const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const EventDetails = require("../../models/api/eventModel");
const TourDetails = require("../../models/api/tourModel");
const WeekendDetails = require("../../models/api/weakendModel");
const userRegister = require("../../models/api/userregisterModel");

const Booking = require("../../models/api/bookingModel");

const bookingHistory = async (req,res) =>
{
   try {
    const booking_id = req.params.booking_id;
    const existedBookingDetails = await Booking.findOne({ _id: booking_id });
    const status_code = existedBookingDetails.status_code;
    const existedUserDetails = await userRegister.findOne({ _id: existedBookingDetails.user_id });
    let eventData, wekendData, tourData;

    if (status_code == 1) {
        eventData = await EventDetails.findOne({ _id: { $in: existedBookingDetails.bookedevent_id } });
    }
    else if(status_code == 2)
    {
        wekendData = await WeekendDetails.findOne({ _id: { $in: existedBookingDetails.bookedevent_id } });
    }
    else if(status_code == 3)
    {
        tourData = await TourDetails.findOne({ _id: { $in: existedBookingDetails.bookedevent_id } });
    }
    
    const response = {
        success: true,
        msg: "Data fetched successfully",
        bookingDetails: existedBookingDetails,
        userDetails: existedUserDetails,
        eventData: eventData,
        wekendData: wekendData,
        tourData: tourData
    };

    res.status(200).json(response);
} catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: 'Failed to fetch data', error: error.message });
}

};


const bookingHistoryByUserId = async (req,res) =>
{
   try {
    const user_id = req.params.user_id;
    const existBookingDetails = await Booking.find({ user_id: user_id }); 
    const response = {
        success: true,
        msg: "Data fetched successfully",
        bookingDetails: existBookingDetails
    };

    res.status(200).json(response);
} catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: 'Failed to fetch data', error: error.message });
}

};

module.exports = {
    bookingHistory,
    bookingHistoryByUserId
}