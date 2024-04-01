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

        const adult_price = storedeventData.event_price_adult;
        const child_price = storedeventData.event_price_child;


        let grandTotalAdults = numberofadult * adult_price * nummberofDays;

        // Calculate grand total for children only if numberOfChildren is present
        let grandTotalChildren = 0;
        if (numberofchild) {
            grandTotalChildren = numberofchild * child_price * nummberofDays;
        }

        // Calculate total price
        let grandTotals = grandTotalAdults + grandTotalChildren;

        const response = {
            success: true,
            msg: "Events Fetched Successfully!",
            data: storedeventData,
            data2:grandTotals
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