const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const mongoose = require('mongoose');

const EventDetails = require("../../models/api/eventModel");
const EventTemaplte = require("../../models/addeventcategoryModels");
const WeekendTemaplte = require("../../models/addweakendcategoryModel");
const TourDetails = require("../../models/api/tourModel");
const TourTemplate = require("../../models/addtourcategoryModel");
const WeekendDetails = require("../../models/api/weakendModel");
const userRegister = require("../../models/api/userregisterModel");
const { tourtemplate } = require('./tourcontroller');



const getHumanReadableDate = (date) => {
    if (date instanceof Date) {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    } else if (typeof date === 'string') {
        const formattedDate = new Date(date);
        if (!isNaN(formattedDate.getTime())) {
            const options = { day: '2-digit', month: 'short', year: 'numeric' };
            return formattedDate.toLocaleDateString('en-GB', options);
        }
    }
    return null;
};

const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const formattedHours = parseInt(hours, 10) % 12 || 12; // Convert to 12-hour format
    const ampm = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
    return `${formattedHours}:${minutes} ${ampm}`;
};

const newsFeeds = async (req, res) => {
  try {
      const baseImageUrl = "/uploads/event_template";
      const baseImageUrlP = "/uploads/profile_image";

      // Get all event details
      const existedeventDetails = await EventDetails.find();
      const existedweekendDetails = await WeekendDetails.find();
      const existedtourDetails = await TourDetails.find();

      // Get unique user IDs for each type of detail
      const eventUserIds = existedeventDetails.map(event => event.user_id);
      const weekendUserIds = existedweekendDetails.map(weekend => weekend.user_id);
      const tourUserIds = existedtourDetails.map(tour => tour.user_id);

      // Find user details for each type of detail
      const userEventDetails = await userRegister.find({ _id: { $in: eventUserIds } });
      const userWeekendDetails = await userRegister.find({ _id: { $in: weekendUserIds } });
      const userTourDetails = await userRegister.find({ _id: { $in: tourUserIds } });

      // Get template IDs for each type of detail
      const eventtemplateIds = existedeventDetails.map(eventtemplate => eventtemplate.eventtemplateid);
      const weekendtemplateIds = existedweekendDetails.map(weekendtemplate => weekendtemplate.weakendtemplateid);
      const tourtemplateIds = existedtourDetails.map(tourtempalte => tourtempalte.tourtemplateid);

      // Find template details for each type of detail
      const EventtemplateDetails = await EventTemaplte.find({ _id: { $in: eventtemplateIds } });
      const WeekendtemplateDetails = await WeekendTemaplte.find({ _id: { $in: weekendtemplateIds } });
      const TourtemplateDetails = await TourTemplate.find({ _id: { $in: tourtemplateIds } });

      // Create an object to store the sorted and formatted data
      const newsData = {
          eventDetails: existedeventDetails.map(event => {
              const user = userEventDetails.find(user => user._id.toString() === event.user_id.toString());
              const eventtemplate = EventtemplateDetails.find(eventtemplate => eventtemplate._id.toString() === event.eventtemplateid.toString());
              return {
                  type: 'event', // Assigning type 'event' for event details
                  postId: event._id,
                  description: event.eventdescription,
                  createddate: getHumanReadableDate(event.created_date),
                  location: event.event_location,
                  startdate: getHumanReadableDate(event.event_start_date),
                  starttime: formatTime(event.event_start_time),
                  user: user ? {
                      _id: user._id,
                      username: user.fullname,
                      profile_image: baseImageUrlP + '/' + user.profile_image
                  } : null,
                  templateimage: eventtemplate ? {
                      _id: eventtemplate._id,
                      templateimage: baseImageUrl + '/' + eventtemplate.eventtemplate
                      // Add other template details you want to include
                  } : null
              };
          }),
          weekendDetails: existedweekendDetails.map(weekend => {
              const user = userWeekendDetails.find(user => user._id.toString() === weekend.user_id.toString());
              const weekendtemplate = WeekendtemplateDetails.find(weekendtemplate => weekendtemplate._id.toString() === weekend.weakendtemplateid.toString());
              return {
                  type: 'weekend', // Assigning type 'weekend' for weekend details
                //   ...weekend.toObject(),
                  postId: weekend._id,
                  description: weekend.weakenddescription,
                  location: weekend.weakend_location,
                  createddate: getHumanReadableDate(weekend.created_date),
                  startdate: getHumanReadableDate(weekend.weakend_start_date),
                  starttime: formatTime(weekend.weakend_start_time),
                  user: user ? {
                      _id: user._id,
                      username: user.fullname,
                      profile_image: baseImageUrlP + '/' + user.profile_image
                  } : null,
                  templateimage: weekendtemplate ? {
                      _id: weekendtemplate._id,
                      templateimage: baseImageUrl + '/' + weekendtemplate.weakendtemplate
                  } : null
              };
          }),
          tourDetails: existedtourDetails.map(tour => {
              const user = userTourDetails.find(user => user._id.toString() === tour.user_id.toString());
              const tourtemplate = TourtemplateDetails.find(tourtemplate => tourtemplate._id.toString() === tour.tourtemplateid.toString());
              return {
                  type: 'tour', // Assigning type 'tour' for tour details
                  postId: tour._id,
                  description: tour.tourdescription,
                  location: tour.tour_location,
                  createddate: getHumanReadableDate(tour.created_date),
                  startdate: getHumanReadableDate(tour.tour_start_date),
                  starttime: formatTime(tour.tour_start_time),
                  user: user ? {
                      _id: user._id,
                      username: user.fullname,
                      profile_image: baseImageUrlP + '/' + user.profile_image
                  } : null,
                  templateimage: tourtemplate ? {
                      _id: tourtemplate._id,
                      templateimage: baseImageUrl + '/' + tourtemplate.tourtemplate
                  } : null
              };
          }),
      };

      // Combine all events into one array
      const allEvents = [
          ...newsData.eventDetails,
          ...newsData.weekendDetails,
          ...newsData.tourDetails
      ];

      // Custom sorting function to sort events by date and time
      allEvents.sort((a, b) => {
        const dateA = new Date(a.event_start_date + " " + a.event_start_time);
        const dateB = new Date(b.event_start_date + " " + b.event_start_time);
        return dateA - dateB;
      });

      // Send the object as JSON response
      res.status(200).json({ allEvents });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};

const newsFeedsbyuserId = async (req, res) => {
    try {
        const baseImageUrl = "/uploads/event_template";
        const baseImageUrlP = "/uploads/profile_image";

        const userId = req.params.userId;
  
        // Get all event details
        const existedeventDetails = await EventDetails.find({ user_id: userId });
        const existedweekendDetails = await WeekendDetails.find({ user_id: userId });
        const existedtourDetails = await TourDetails.find({ user_id: userId });
  
        // Find user details for each type of detail
        const userDetails = await userRegister.find({ _id: { $in: userId } });
  
        // Get template IDs for each type of detail
        const eventtemplateIds = existedeventDetails.map(eventtemplate => eventtemplate.eventtemplateid);
        const weekendtemplateIds = existedweekendDetails.map(weekendtemplate => weekendtemplate.weakendtemplateid);
        const tourtemplateIds = existedtourDetails.map(tourtempalte => tourtempalte.tourtemplateid);
  
        // Find template details for each type of detail
        const EventtemplateDetails = await EventTemaplte.find({ _id: { $in: eventtemplateIds } });
        const WeekendtemplateDetails = await WeekendTemaplte.find({ _id: { $in: weekendtemplateIds } });
        const TourtemplateDetails = await TourTemplate.find({ _id: { $in: tourtemplateIds } });
  
        // Create an object to store the sorted and formatted data
        const newsData = {
            eventDetails: existedeventDetails.map(event => {
                const user = userDetails.find(user => user._id.toString() === event.user_id.toString());
                const eventtemplate = EventtemplateDetails.find(eventtemplate => eventtemplate._id.toString() === event.eventtemplateid.toString());
                return {
                    type: 'event', // Assigning type 'event' for event details
                    postId: event._id,
                    description: event.eventdescription,
                    createddate: getHumanReadableDate(event.created_date),
                    location: event.event_location,
                    startdate: getHumanReadableDate(event.event_start_date),
                    starttime: formatTime(event.event_start_time),
                    user: user ? {
                        _id: user._id,
                        username: user.fullname,
                        profile_image: baseImageUrlP + '/' + user.profile_image
                    } : null,
                    templateimage: eventtemplate ? {
                        _id: eventtemplate._id,
                        templateimage: baseImageUrl + '/' + eventtemplate.eventtemplate
                        // Add other template details you want to include
                    } : null
                };
            }),
            weekendDetails: existedweekendDetails.map(weekend => {
                const user = userDetails.find(user => user._id.toString() === weekend.user_id.toString());
                const weekendtemplate = WeekendtemplateDetails.find(weekendtemplate => weekendtemplate._id.toString() === weekend.weakendtemplateid.toString());
                return {
                    type: 'weekend', // Assigning type 'weekend' for weekend details
                  //   ...weekend.toObject(),
                    postId: weekend._id,
                    description: weekend.weakenddescription,
                    location: weekend.weakend_location,
                    createddate: getHumanReadableDate(weekend.created_date),
                    startdate: getHumanReadableDate(weekend.weakend_start_date),
                    starttime: formatTime(weekend.weakend_start_time),
                    user: user ? {
                        _id: user._id,
                        username: user.fullname,
                        profile_image: baseImageUrlP + '/' + user.profile_image
                    } : null,
                    templateimage: weekendtemplate ? {
                        _id: weekendtemplate._id,
                        templateimage: baseImageUrl + '/' + weekendtemplate.weakendtemplate
                    } : null
                };
            }),
            tourDetails: existedtourDetails.map(tour => {
                const user = userDetails.find(user => user._id.toString() === tour.user_id.toString());
                const tourtemplate = TourtemplateDetails.find(tourtemplate => tourtemplate._id.toString() === tour.tourtemplateid.toString());
                return {
                    type: 'tour', // Assigning type 'tour' for tour details
                    postId: tour._id,
                    description: tour.tourdescription,
                    location: tour.tour_location,
                    createddate: getHumanReadableDate(tour.created_date),
                    startdate: getHumanReadableDate(tour.tour_start_date),
                    starttime: formatTime(tour.tour_start_time),
                    user: user ? {
                        _id: user._id,
                        username: user.fullname,
                        profile_image: baseImageUrlP + '/' + user.profile_image
                    } : null,
                    templateimage: tourtemplate ? {
                        _id: tourtemplate._id,
                        templateimage: baseImageUrl + '/' + tourtemplate.tourtemplate
                    } : null
                };
            }),
        };
  
        // Combine all events into one array
        const allEvents = [
            ...newsData.eventDetails,
            ...newsData.weekendDetails,
            ...newsData.tourDetails
        ];
  
        // Custom sorting function to sort events by date and time
        allEvents.sort((a, b) => {
          const dateA = new Date(a.event_start_date + " " + a.event_start_time);
          const dateB = new Date(b.event_start_date + " " + b.event_start_time);
          return dateA - dateB;
        });
  
        // Send the object as JSON response
        res.status(200).json({ allEvents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  };

const generateShareableLink = (post, type) => {
    let link;
    if (type === 'event') {
      link = `http://20.163.173.61/api/getselectedeventdetails/${post._id}`;
    } else if (type === 'tour') {
      link = `http://20.163.173.61/api/getalltourdetailsbyid/${post._id}`;
    } else if (type === 'weekend') {
      link = `http://20.163.173.61/api/getallweekenddetails/${post._id}`;
    }
    return link;
  };
  
  const shareEventsToursWeekends = async (req, res) => {
    try {
        const { postId, type } = req.body;
        console.log("Received request with body:", req.body);

        let sharedDetails;

        if (type === 'event') {
            const event = await EventDetails.findById(postId);
            if (!event) {
                throw new Error(`Event with ID ${postId} not found`);
            }
            sharedDetails = {
                id: event._id,
                type: 'event',
                title: event.title,
                description: event.description,
                shareableLink: generateShareableLink(event, 'event'),
            };
            console.log(sharedDetails.shareableLink);
        } else if (type === 'tour') {
            const tour = await TourDetails.findById(postId);
            if (!tour) {
                throw new Error(`Tour with ID ${postId} not found`);
            }
            sharedDetails = {
                id: tour._id,
                type: 'tour',
                title: tour.title,
                description: tour.description,
                shareableLink: generateShareableLink(tour, 'tour'),
            };
        } else if (type === 'weekend') {
            const weekend = await WeekendDetails.findById(postId);
            if (!weekend) {
                throw new Error(`Weekend with ID ${postId} not found`);
            }
            sharedDetails = {
                id: weekend._id,
                type: 'weekend',
                title: weekend.title,
                description: weekend.description,
                shareableLink: generateShareableLink(weekend, 'weekend'),
            };
        } else {
            return res.status(400).json({ error: 'Invalid type specified' });
        }

        const response = {
            success: true,
            msg: "Shareable link generated successfully",
            sharedDetails,
        };

        res.json(response);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
};



module.exports = {
    newsFeeds,
    shareEventsToursWeekends,
    newsFeedsbyuserId
}