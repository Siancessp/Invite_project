const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const EventBooking = require("../../models/api/eventbookingModel");
const EventDetails = require("../../models/api/eventModel");

const calculateGrandTotalPrice = async (req,res) =>
{
    const { eventid,nummberofDays,numberofadult,numberofchild } = req.body;
    try
    {
        const storedeventData = await EventDetails.findById(eventid);
        if (!storedeventData) {
            throw new Error("Event not found");
        }
        const response = {
            success: true,
            msg: "Events Fetched Successfully!",
            data: storedeventData,
            data2:storedeventData.event_price_adult
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