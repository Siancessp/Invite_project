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

const geteventDetails = async (req, res) => {
    try {
        const existingEventdetails = await EventDetails.find({ });
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
                    eventstartdate: eventDetail.event_start_date,
                    eventlocation: eventDetail.event_location,
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
            eventstartdate: existedEventDetails.event_start_date,
            eventenddate: existedEventDetails.event_end_date,
            eventstarttime: existedEventDetails.event_start_time,
            eventendtime: existedEventDetails.event_end_time,
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
    getalleventdetailsbyid
}