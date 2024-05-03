const express = require('express');
const hbs  = require('hbs');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const BookingDetails = require("../models/api/bookingModel");
const Event = require("../models/api/eventModel");
const Weekend = require("../models/api/weakendModel");
const Tour = require("../models/api/tourModel");

const getbookinghistorybyUserid = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const userbookingDetails = await BookingDetails.find({ user_id: user_id });
        if (userbookingDetails.length === 0) {
            const previousPage = req.headers.referer || '/';
            return res.redirect(previousPage);
        }

        const eventPromises = [];

        userbookingDetails.forEach(booking => {
            const { bookedevent_id, status_code } = booking;
            if (status_code === '1') {
                eventPromises.push(Event.find({ _id: bookedevent_id }).select('eventname'));
            } else if (status_code === '2') {
                eventPromises.push(Weekend.find({ _id: bookedevent_id }).select('weakendname'));
            } else {
                eventPromises.push(Tour.find({ _id: bookedevent_id }).select('tourname'));
            }
        });
         const userbookedeventDetails = await Promise.all(eventPromises);
         userbookingDetails.forEach((booking, index) => {
            booking.eventname = userbookedeventDetails[index][0].eventname
            booking.BookingDatesFormatted = booking.BookingDates.map(date => {
                const formattedDate = new Date(date).toLocaleDateString('en-GB');
                return formattedDate;
            });
        });
        res.render('userbookinghistorylist', { userbookingDetails });
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    getbookinghistorybyUserid
}