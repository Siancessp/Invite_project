const express = require('express');
const hbs  = require('hbs');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const BookingDetails = require("../models/api/bookingModel");
const Event = require("../models/api/eventModel");

const getbookinghistorybyUserid = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const userbookingDetails = await BookingDetails.find({ user_id: user_id });
        if (userbookingDetails.length === 0) {
            const previousPage = req.headers.referer || '/';
            return res.redirect(previousPage);
        }

        userbookingDetails.forEach(booking => {
            const { bookedevent_id, status_code } = booking;
            console.log(bookedevent_id);
            // Use conditional statements to handle status codes separately
            if (status_code === '1') {
                console.log("Hii");
            } else if (status_code === 'STATUS_CODE_2') {
                // Handle status code 2
            } else {
                // Handle other status codes
            }
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