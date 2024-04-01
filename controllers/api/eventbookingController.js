const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const EventBooking = require("../../models/api/eventbookingModel");
const EventDetails = require("../../models/api/eventModel");

const calculateGrandTotalPrice = async (req,res,eventid,nummberofDays,numberofadult,numberofchild) =>
{
    try
    {
        const storedeventData = await EventDetails.findById(eventid);
        if (!storedeventData) {
            throw new Error("Event not found");
        }
        const adult_price = storedeventData.event_price_adult;
        const child_price = storedeventData.event_price_child;
        let grandTotalAdults = numberofadult * adult_price * nummberofDays;
        let grandTotalChildren = 0;
        if (numberofchild) {
            grandTotalChildren = numberofchild * child_price * nummberofDays;
        }
        let grandTotals = grandTotalAdults + grandTotalChildren;

        const response = {
            success: true,
            msg: "GrandTotal Fetched Successfully!",
            data: grandTotals
        };
        res.status(200).send(response);
    }
    catch (error) {
        throw new Error("Failed to calculate total price");
    }
}

const eventbook_adult = async (req, res) => {
    const { user_id, eventBookingDates, nummberofDays, numberofadult, numberofchild,eventid } = req.body;
    try {
        // Call calculateGrandTotalPrice function
        const grandTotalResponse = await calculateGrandTotalPrice(req, res,eventid,nummberofDays,numberofadult,numberofchild);

        // Now you can use grand total response data for further processing
        const grandTotal = grandTotalResponse.data;

        // Your logic for event booking using the calculated grand total
        // For example:
        // const eventBooking = await EventBooking.create({
        //     user_id: user_id,
        //     eventBookingDates: eventBookingDates,
        //     nummberofDays: nummberofDays,
        //     numberofadult: numberofadult,
        //     numberofchild: numberofchild,
        //     grandTotal: grandTotal
        // });

        const response = {
            success: true,
            msg: "Event Booking Successful!",
            data: {
                // Include event booking details if needed
                // eventBooking: eventBooking,
                grandTotal: grandTotal
            }
        };
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({
            success: false,
            msg: "Failed to book event",
            error: error.message
        });
    }
}

module.exports = {
    calculateGrandTotalPrice,
    eventbook_adult
}