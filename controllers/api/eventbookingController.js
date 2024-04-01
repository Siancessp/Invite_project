const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const EventBooking = require("../../models/api/eventbookingModel");
const EventDetails = require("../../models/api/eventModel");

const calculateGrandTotalPrice = async (eventid, nummberofDays, numberofadult, numberofchild) => {
    try {
        const storedeventData = await EventDetails.findById(eventid);
        if (!storedeventData) {
            return {
                success: false,
                msg: "Event not found",
                data: null
            };
        }
        const adult_price = storedeventData.event_price_adult;
        const child_price = storedeventData.event_price_child;
        let grandTotalAdults = 0;
        if (numberofadult) {
            grandTotalAdults = numberofadult * adult_price * nummberofDays;
        }
        let grandTotalChildren = 0;
        if (numberofchild) {
            grandTotalChildren = numberofchild * child_price * nummberofDays;
        }
        let grandTotals = grandTotalAdults + grandTotalChildren;

        return {
            success: true,
            msg: "GrandTotal Fetched Successfully!",
            data: grandTotals
        };
    } catch (error) {
        return {
            success: false,
            msg: "Failed to calculate total price",
            error: error.message
        };
    }
}

const eventbook_adult = async (req, res) => {
    const { user_id, eventBookingDates, nummberofDays, numberofadult, numberofchild, eventid } = req.body;
    try {
        // Call calculateGrandTotalPrice function
        const grandTotalResponse = await calculateGrandTotalPrice(eventid, nummberofDays, numberofadult, numberofchild);

        // Now you can use grand total response data for further processing
        const grandTotal = grandTotalResponse.data;

        // Convert eventBookingDates array to a single string
        const formattedEventBookingDates = eventBookingDates.map(date => new Date(date))

        // Assuming EventBooking is your mongoose model
        const createdEventBooking = await EventBooking.create({
            user_id: user_id,
            eventBookingDates: formattedEventBookingDates,
            nummberofDays: nummberofDays,
            numberofadult: numberofadult,
            numberofchild: numberofchild,
            grandTotal: grandTotal
        });

        const response = {
            success: true,
            msg: "Event Bookings Successful!",
            data: {
                eventBookingDates: formattedEventBookingDates,
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