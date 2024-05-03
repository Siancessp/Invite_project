const express = require('express');
const hbs  = require('hbs');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const BookingDetails = require("../models/api/bookingModel");

const getbookinghistorybyUserid = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const userbookingDetails = await BookingDetails.find({ user_id: user_id });
        if (userbookingDetails.length === 0) {
            const previousPage = req.headers.referer || '/';
            return res.redirect(previousPage);
        }

        console.log(userbookingDetails.bookedevent_id);

        res.render('userbookinghistorylist', { userbookingDetails });
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    getbookinghistorybyUserid
}