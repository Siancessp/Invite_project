const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const EventBooking = require("../../models/api/eventbookingModel");
const EventDetails = require("../../models/api/eventModel");

const calculateGrandTotalPrice = async (nummberofDays, numberofadult, numberofchild, eventid) =>
{
    const { eventid } = req.body;
    try
    {
        const storedeventId = await EventDetails.findById(eventid);
        if (!storedeventId) {
            throw new Error("Event not found");
        }
        const response = {
            success: true,
            msg: "Events Fetched Successfully!",
            data: storedeventId
        };
        res.status(200).send(response);
    }
    catch (error) {
        throw new Error("Failed to calculate total price");
    }
}
const eventbook_adult = async (req, res) =>
{
    const { user_id, eventBookingDates, nummberofDays, numberofadult, numberofchild, } = req.body;
}

module.exports = {
    calculateGrandTotalPrice
}