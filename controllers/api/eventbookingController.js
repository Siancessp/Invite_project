const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const EventBooking = require("../../models/api/eventbookingModel");

const calculateGrandTotalPrice = async (nummberofDays, numberofadult, numberofchild, eventid) =>
{
    try
    {
        const storedeventId = await EventTemplate.findById(eventid);
        if (!storedeventId) {
            throw new Error("Event not found");
        }
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