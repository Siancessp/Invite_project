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

const eventbooking = async (req, res) => {
    const { user_id, eventBookingDates, nummberofDays, numberofadult, numberofchild, eventid, buttonClicked } = req.body;
    try {
        let existingBooking = await EventBooking.findOne({ user_id: user_id, eventid: eventid });
        
        if (existingBooking) {
            const grandTotalResponse = await calculateGrandTotalPrice(eventid, nummberofDays, numberofadult, numberofchild);
            const grandTotal = grandTotalResponse.data;

            const formattedEventBookingDates = eventBookingDates.map(date => new Date(date));

            existingBooking.eventBookingDates = formattedEventBookingDates;
            existingBooking.nummberofDays = nummberofDays;

            if (buttonClicked === 1) {
                existingBooking.numberofadult = numberofadult > 0 ? numberofadult : 0;
            } else if (buttonClicked === 2) {
                existingBooking.numberofchild = numberofchild > 0 ? numberofchild : 0;
            }

            existingBooking.grandtotalprice = grandTotal;

            await existingBooking.save();

            const response = {
                success: true,
                msg: "Event Booking Updated Successfully!",
                data: {
                    eventBookingDates: formattedEventBookingDates,
                    BookingDetails: existingBooking,
                    grandTotal: grandTotal
                }
            };
            res.status(200).send(response);
        } else {
            const grandTotalResponse = await calculateGrandTotalPrice(eventid, nummberofDays, numberofadult, numberofchild);
            const grandTotal = grandTotalResponse.data;

            const formattedEventBookingDates = eventBookingDates.map(date => new Date(date));

            const createdEventBooking = await EventBooking.create({
                user_id: user_id,
                eventid: eventid,
                eventBookingDates: formattedEventBookingDates,
                nummberofDays: nummberofDays,
                numberofadult: buttonClicked === 1 ? (numberofadult > 0 ? numberofadult : 0) : 0,
                numberofchild: buttonClicked === 2 ? (numberofchild > 0 ? numberofchild : 0) : 0,
                grandtotalprice: grandTotal
            });

            const response = {
                success: true,
                msg: "Event Booking Successful!",
                data: {
                    eventBookingDates: formattedEventBookingDates,
                    BookingDetails: createdEventBooking,
                    grandTotal: grandTotal
                }
            };
            res.status(200).send(response);
        }
    } catch (error) {
        // Handle error
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};






module.exports = {
    calculateGrandTotalPrice,
    eventbooking
}