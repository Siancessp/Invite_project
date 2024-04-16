const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const Event = require("../../models/addeventcategoryModels");
const Category = require("../../models/addcategoryModel");
const EventDetails = require("../../models/api/eventModel");
const userRegister = require("../../models/api/userregisterModel");

const securePassword = async (password) => {
    try {
        const passwordHash = await bcryptjs.hash(password, 10); // You need to specify the salt rounds
        return passwordHash;
    } catch (error) {
        throw new Error(error.message);
    }
}

const create_token = async (id) => {
    try {
        const token = await jwt.sign({ _id: id }, config.secret_jwt);
        return token;
    } catch (error) {
        throw new Error(error.message);
    }
}

const eventtemplate = async (req, res) => {
    try {
        const baseImageUrl = "/uploads/event_template";
        const { categoryid } = req.params;

        let filter = {}; // Default filter to get all events
        if (categoryid) {
            filter = { categoryid: categoryid }; // Filter by categoryid if provided
        }

        const existingEvents = await Event.find(filter);

        const eventsWithUrls = existingEvents.map(event => ({
            _id: event._id,
            categoryid: event.categoryid,
            eventtemplate: baseImageUrl + '/' + event.eventtemplate,
            __v: event.__v
        }));

        const response = {
            success: true,
            msg: "Events Fetched Successfully!",
            data: eventsWithUrls
        };

        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Error fetching events" });
    }
};



const getselectedtemplate = async (req, res) => {
    try {
        const eventtemplateid = req.body.eventtemplateid;
        const baseImageUrl = "/uploads/event_template";
        const existingEventtemplate = await Event.findOne({ _id: eventtemplateid });

        if (!existingEventtemplate) {
            return res.status(404).json({ success: false, msg: 'Event template not found' });
        }

        const eventWithUrl = {
            _id: existingEventtemplate._id,
            categoryname: existingEventtemplate.categoryname,
            eventtemplate: baseImageUrl + '/' + existingEventtemplate.eventtemplate,
            __v: existingEventtemplate.__v
        };

        const response = {
            success: true,
            msg: "Event Template Fetched Successfully!",
            data: eventWithUrl
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Internal Server Error" });
    }
};

const geteventcategory = async (req, res) => {
    try {
        const existingCategories = await Category.find({}, '_id categoryname');
        const formattedCategories = existingCategories.map(category => ({
            _id: category._id,
            categoryname: category.categoryname
        }));
        res.status(200).json(formattedCategories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};



const addeventDetails = async (req,res)=>
{
    try {
        const eventtemplateid = req.body.eventtemplateid;
        const { eventdescription, eventname, event_start_date, event_end_date, event_start_time, event_end_time, event_location, event_price_adult, event_price_child, user_id } = req.body;
        const baseImageUrl = "/uploads/event_template";
        const existingEventtemplate = await Event.findOne({ _id: eventtemplateid });

        if (!existingEventtemplate) {
            return res.status(404).json({ success: false, msg: 'Event not found' });
        }

        const newEventDetails = new EventDetails({
            user_id: user_id,
            eventtemplateid: eventtemplateid,
            eventdescription: eventdescription,
            eventname: eventname,
            event_start_date: event_start_date,
            event_end_date: event_end_date,
            event_start_time: event_start_time,
            event_end_time: event_end_time,
            event_location: event_location,
            event_price_adult: event_price_adult,
            event_price_child: event_price_child
        });

        const savedEventDetails = await newEventDetails.save();
        const response = {
            success: true,
            msg: "Event added Successfully!",
            data: savedEventDetails
        }
        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Internal Server Error" });
    }
};

const getHumanReadableDate = (date) => {
    if (date instanceof Date) {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const month = monthNames[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    } else if (isFinite(date)) {
        // If it's a timestamp, convert it to a Date object
        const d = new Date();
        d.setTime(date);
        return getHumanReadableDate(d);
    }
};

const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const formattedHours = parseInt(hours, 10) % 12 || 12; // Convert to 12-hour format
    const ampm = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
    return `${formattedHours}:${minutes} ${ampm}`;
};

const geteventDetails = async (req, res) => {
    try {
        const existingEventdetails = await EventDetails.find({});
        const baseImageUrl = "/uploads/event_template";

        if (!existingEventdetails) {
            return res.status(404).json({ success: false, msg: 'Event Details not found' });
        }

        let eventDetailsWithUsers = [];

        for (let i = 0; i < existingEventdetails.length; i++) {
            const eventDetail = existingEventdetails[i];
            const eventtemplate = await Event.findOne({ _id: eventDetail.eventtemplateid });

            const categoryId = eventtemplate.categoryid;
            const category = await Category.findOne({ _id: categoryId });

            if (eventtemplate) {
                const eventDetailWithUser = {
                    event_id: eventDetail._id,
                    eventstartdate: getHumanReadableDate(new Date(eventDetail.event_start_date)),
                    eventenddate: getHumanReadableDate(new Date(eventDetail.event_end_date)),
                    eventname: eventDetail.eventname,
                    eventlocation: eventDetail.event_location,
                    eventdescription: eventDetail.eventdescription,
                    eventtemplate: {
                        eventtemplate_id: eventtemplate._id,
                        eventtemplate: baseImageUrl + '/' + eventtemplate.eventtemplate
                    },
                    category: {
                        category_id: category._id,
                        category_name: category.categoryname
                    }
                };

                eventDetailsWithUsers.push(eventDetailWithUser);
            }
        }

        const response = {
            success: true,
            msg: "Successfully fetched event details with users",
            data: eventDetailsWithUsers
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};

const getweeklyeventDetails = async (req, res) => {
    try {
        const baseImageUrl = "/uploads/event_template";

        // Get today's date
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Calculate the date 7 days from today
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 7);

        // Find events with start dates within the next 7 days and in the current month
        const existingEventdetails = await EventDetails.find({
            $expr: {
                $and: [
                    { $lte: ["$event_start_date", futureDate.toISOString()] },
                    { $gte: ["$event_end_date", today.toISOString()] }
                ]
            }
        });

        if (!existingEventdetails || existingEventdetails.length === 0) {
            return res.status(404).json({ success: false, msg: 'No upcoming events found' });
        }

        let eventDetailsArray = [];

        for (let i = 0; i < existingEventdetails.length; i++) {
            const eventDetail = existingEventdetails[i];
            const eventtemplate = await Event.findOne({ _id: eventDetail.eventtemplateid });

            const categoryId = eventtemplate.categoryid;
            const category = await Category.findOne({ _id: categoryId });

            if (eventtemplate) {
                const eventDetailWithUser = {
                    eventstartdate: getHumanReadableDate(new Date(eventDetail.event_start_date)),
                    eventenddate: getHumanReadableDate(new Date(eventDetail.event_end_date)),
                    eventname: eventDetail.eventname,
                    event_id: eventDetail._id,
                    eventlocation: eventDetail.event_location,
                    eventdescription: eventDetail.eventdescription,
                    eventtemplate: {
                        eventtemplate_id: eventtemplate._id,
                        eventtemplate: baseImageUrl + '/' + eventtemplate.eventtemplate
                    },
                    category: {
                        category_id: category._id,
                        category_name: category.categoryname
                    }
                };

                eventDetailsArray.push(eventDetailWithUser);
            }
        }

        const response = {
            success: true,
            msg: "Successfully fetched upcoming event details for the current week in the current month",
            data: eventDetailsArray
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};


const getMonthlyEventDetails = async (req, res) => {
    try {
        const baseImageUrl = "/uploads/event_template";

        // Get today's date
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Calculate the last day of the current month
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        const futureDate = new Date(today);
        futureDate.setDate(lastDayOfMonth.getDate());

        console.log("Today:", today);
        console.log("Future Date:", futureDate);

        // Find events with start dates within the current month
        const existingEventdetails = await EventDetails.find({
            $expr: {
                $and: [
                    { $lte: ["$event_start_date", futureDate.toISOString()] },
                    { $gte: ["$event_end_date", today.toISOString()] }
                ]
            }
        });

        console.log("Existing Event Details:", existingEventdetails);

        if (!existingEventdetails || existingEventdetails.length === 0) {
            return res.status(404).json({ success: false, msg: 'No upcoming events found for the current month' });
        }

        let eventDetailsArray = [];

        for (let i = 0; i < existingEventdetails.length; i++) {
            const eventDetail = existingEventdetails[i];

            // Fetch the event template
            const eventtemplate = await Event.findOne({ _id: eventDetail.eventtemplateid });

            // Fetch the category
            const categoryId = eventtemplate.categoryid;
            const category = await Category.findOne({ _id: categoryId });

            if (eventtemplate) {
                const eventDetailWithUser = {
                    eventstartdate: getHumanReadableDate(new Date(eventDetail.event_start_date)),
                    eventenddate: getHumanReadableDate(new Date(eventDetail.event_end_date)),
                    eventname: eventDetail.eventname,
                    event_id: eventDetail._id,
                    eventlocation: eventDetail.event_location,
                    eventdescription: eventDetail.eventdescription,
                    eventtemplate: {
                        eventtemplate_id: eventtemplate._id,
                        eventtemplate: baseImageUrl + '/' + eventtemplate.eventtemplate
                    },
                    category: {
                        category_id: category._id,
                        category_name: category.categoryname
                    }
                };

                eventDetailsArray.push(eventDetailWithUser);
            }
        }

        console.log("Event Details Array:", eventDetailsArray);

        const response = {
            success: true,
            msg: "Successfully fetched upcoming event details for the current month",
            data: eventDetailsArray
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};






const getReadableDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
};

const getalleventdetailsbyid = async (req, res) => {
    try {
        const eventid = req.params.eventid;
        const existedEventDetails = await EventDetails.findOne({ _id: eventid });

        if (!existedEventDetails) {
            return res.status(404).json({ success: false, msg: 'Event Details not found' });
        }

        const eventtemplatebackground = await Event.findOne({ _id: existedEventDetails.eventtemplateid });
        const eventcategoryId = eventtemplatebackground.categoryid;

        const eventcategory = await Category.findOne({ _id: eventcategoryId });
        const user = await userRegister.findOne({ _id: existedEventDetails.user_id });

        const baseImageUrl = "/uploads/event_template";

        const eventDetailWithUser = {
            event_id: existedEventDetails._id,
            eventname: existedEventDetails.eventname,
            eventdescription: existedEventDetails.eventdescription,
            eventstartdate: getHumanReadableDate(new Date(existedEventDetails.event_start_date)),
            eventstartingdate: getReadableDate(new Date(existedEventDetails.event_start_date)),
            eventenddate: getHumanReadableDate(new Date(existedEventDetails.event_end_date)),
            eventendingdate: getReadableDate(new Date(existedEventDetails.event_end_date)),
            eventstarttime: formatTime(existedEventDetails.event_start_time),
            eventendtime: formatTime(existedEventDetails.event_end_time),
            eventpriceadult: existedEventDetails.event_price_adult,
            eventpricechild: existedEventDetails.event_price_child,
            eventlocation: existedEventDetails.event_location,
            eventtemplate: {
                eventtemplate_id: eventtemplatebackground._id,
                eventtemplate: baseImageUrl + '/' + eventtemplatebackground.eventtemplate
            },
            category: {
                category_id: eventcategory._id,
                category_name: eventcategory.categoryname
            },
            user: {
                user_id: user._id,
                username: user.fullname
            }
        };

        res.status(200).json({ success: true, data: eventDetailWithUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};

module.exports = {
    eventtemplate,
    getselectedtemplate,
    addeventDetails,
    geteventDetails,
    geteventcategory,
    getalleventdetailsbyid,
    getMonthlyEventDetails,
    getweeklyeventDetails
}