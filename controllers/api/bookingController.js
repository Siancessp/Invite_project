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

const bookingHistory = async (req, res) => {
    try {
        const booking_id = req.params.booking_id;
        const existedBookingDetails = await Booking.findOne({ _id: booking_id });
        const status_code = existedBookingDetails.status_code;
        const existedUserDetails = await userRegister.findOne({ _id: existedBookingDetails.user_id });

        const formattedDates = existedBookingDetails.BookingDates.map(date => {
            const d = new Date(date);
            const day = d.getDate().toString().padStart(2, '0');
            const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d);
            const year = d.getFullYear();
            return `${day} ${month} ${year}`;
        });

        const updatedBookingDetails = {
            _id: existedBookingDetails._id,
            user_id: existedBookingDetails.user_id,
            bookedevent_id: existedBookingDetails.bookedevent_id,
            status_code: existedBookingDetails.status_code,
            nummberofDays: existedBookingDetails.nummberofDays,
            BookingDates: formattedDates,
            numberofadult: existedBookingDetails.numberofadult,
            numberofchild: existedBookingDetails.numberofchild,
            grandtotalprice: existedBookingDetails.grandtotalprice,
            __v: existedBookingDetails.__v
        };

        let eventDetailWithUser, weekendData, tourData;

        if (status_code == 1) {
            eventData = await EventDetails.findOne({ _id: { $in: existedBookingDetails.bookedevent_id } });
            if (eventData) {
                eventDetailWithUser = {
                    event_id: eventData._id,
                    eventstartdate: getHumanReadableDate(new Date(eventData.event_start_date)),
                    eventenddate: getHumanReadableDate(new Date(eventData.event_end_date)),
                    eventname: eventData.eventname,
                    eventlocation: eventData.event_location,
                    eventdescription: eventData.eventdescription
                };
            }
        } else if (status_code == 2) {
            weekendData = await WeekendDetails.findOne({ _id: { $in: existedBookingDetails.bookedevent_id } });
            if (weekendData) {
                // Handle weekendData
            }
        } else if (status_code == 3) {
            tourData = await TourDetails.findOne({ _id: { $in: existedBookingDetails.bookedevent_id } });
            if (tourData) {
                // Handle tourData
            }
        }

        const response = {
            success: true,
            msg: "Data fetched successfully",
            bookingDetails: updatedBookingDetails,
            userDetails: existedUserDetails,
            eventData: eventDetailWithUser,
            weekendData: weekendData,
            tourData: tourData
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Failed to fetch data', error: error.message });
    }
};





const bookingHistoryByUserId = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        
        // Fetch booking details for the user_id
        const existBookingDetails = await Booking.find({ user_id: user_id }); 
        
        // Extract and format dates to "DD Month YYYY" format
        const updatedBookingDetails = existBookingDetails.map(booking => {
            const formattedDates = booking.BookingDates.map(date => {
                const d = new Date(date);
                const day = d.getDate().toString().padStart(2, '0'); // Get day with leading zero if needed
                const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d); // Get full month name
                const year = d.getFullYear(); // Get full year
                return `${day} ${month} ${year}`;
            });
            return {
                _id: booking._id,
                user_id: booking.user_id,
                bookedevent_id: booking.bookedevent_id,
                status_code: booking.status_code,
                nummberofDays: booking.nummberofDays,
                BookingDates: formattedDates, // Updated to formatted dates
                numberofadult: booking.numberofadult,
                numberofchild: booking.numberofchild,
                grandtotalprice: booking.grandtotalprice,
                __v: booking.__v
            };
        });
        
        // Prepare response JSON with updated BookingDates
        const response = {
            success: true,
            msg: "Data fetched successfully",
            bookingDetails: updatedBookingDetails
        };
        
        // Send response
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        // If an error occurs, send error response
        res.status(500).json({ success: false, msg: 'Failed to fetch data', error: error.message });
    }
};



module.exports = {
    bookingHistory,
    bookingHistoryByUserId
}