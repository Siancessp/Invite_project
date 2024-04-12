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

        const eventtemplateIds = existedeventDetails.map(eventtemplate => eventtemplate.eventtemplateid);
        const weekendtemplateIds = existedweekendDetails.map(weekendtemplate => weekendtemplate.weakendtemplateid);
        const tourtemplateIds = existedtourDetails.map(tourtempalte => tourtempalte.tourtemplateid);

        const EventtemplateDetails = await EventTemaplte.find({ _id: { $in: eventtemplateIds } });
        const WeekendtemplateDetails = await WeekendTemaplte.find({ _id: { $in: weekendtemplateIds } });
        const TourtemplateDetails = await TourTemplate.find({ _id: { $in: tourtemplateIds}});

        const baseImageUrl = "/uploads/event_template";
        // Create an object with the results
        const newsData = {
            eventDetails: existedeventDetails.map(event => {
                const user = userEventDetails.find(user => user._id.toString() === event.user_id.toString());
                const eventtemplate = EventtemplateDetails.find(eventtemplate => eventtemplate._id.toString() === event.eventtemplateid.toString());
                return {
                    type: 'event',
                    ...event.toObject(),
                    event_start_date: getHumanReadableDate(event.event_start_date),
                    event_start_time: formatTime(event.event_start_time),
                    user: user ? {
                        _id: user._id,
                        username: user.fullname,
                        // Add other user details you want to include
                    } : null,
                    eventtemplate: eventtemplate ? {
                        _id: eventtemplate._id,
                        eventtemplate : baseImageUrl + '/' + eventtemplate.eventtemplate
                        // Add other template details you want to include
                    } : null
                };
            }),
            weekendDetails: existedweekendDetails.map(weekend => {
                const user = userWeekendDetails.find(user => user._id.toString() === weekend.user_id.toString());
                const weekendtemplate = WeekendtemplateDetails.find(weekendtemplate => weekendtemplate._id.toString() === weekend.weakendtemplateid.toString());
                return {
                    type: 'weekend',
                    ...weekend.toObject(),
                    weakend_start_date: getHumanReadableDate(weekend.weakend_start_date),
                    weakend_start_time: formatTime(weekend.weakend_start_time),
                    user: user ? {
                        _id: user._id,
                        username: user.fullname,
                        // Add other user details you want to include
                    } : null,
                    weekendtemplate: weekendtemplate ?
                    {
                        _id: weekendtemplate._id,
                        weekendtemplate: baseImageUrl + '/' + weekendtemplate.weakendtemplate
                    }: null
                };
            }),
            tourDetails: existedtourDetails.map(tour => {
                const user = userTourDetails.find(user => user._id.toString() === tour.user_id.toString());
                const tourtemplate = TourtemplateDetails.find(tourtemplate => tourtemplate._id.toString() === tour.tourtemplateid.toString());
                return {
                    type: 'tour',
                    ...tour.toObject(),
                    user: user ? {
                        _id: user._id,
                        username: user.fullname,
                        // Add other user details you want to include
                    } : null,
                    tourtemplate: tourtemplate ?
                    {
                        _id: tourtemplate._id,
                        tourtemplate: baseImageUrl + '/' + tourtemplate.tourtemplate
                    }: null
                };
            }),
            userEventDetails,
            userWeekendDetails,
            userTourDetails
        };

        // Send the object as JSON response
        res.status(200).json(newsData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    newsFeeds
}