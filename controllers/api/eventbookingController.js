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

const cleanDates = (datesObject) => {
    return Object.keys(datesObject);
  };
const eventbooking = async (req, res) => {
    const { user_id, eventBookingDates, nummberofDays, numberofadult, numberofchild, eventid } = req.body;
    try {
            let existingBooking = await EventBooking.findOne({ user_id: user_id, eventid: eventid });

            if (existingBooking) {
                const grandTotalResponse = await calculateGrandTotalPrice(eventid, nummberofDays, numberofadult, numberofchild);
                const grandTotal = grandTotalResponse.data;

               
                const datesOnly = cleanDates(eventBookingDates);

                existingBooking.eventBookingDates = datesOnly;
                existingBooking.nummberofDays = nummberofDays;
                existingBooking.numberofadult = numberofadult;
                existingBooking.numberofchild = numberofchild;
                existingBooking.grandtotalprice = grandTotal;

                await existingBooking.save();

                const response = {
                    success: true,
                    msg: "Event Booking Updated Successfully!",
                    data: {
                        BookingDetails: existingBooking,
                        grandTotal: grandTotal
                    }
                };
                res.status(200).send(response);
            }
            else 
            {
                const grandTotalResponse = await calculateGrandTotalPrice(eventid, nummberofDays, numberofadult, numberofchild);
                const grandTotal = grandTotalResponse.data;

                const datesOnly = cleanDates(eventBookingDates);

                const createdEventBooking = await EventBooking.create({
                    user_id: user_id,
                    eventid: eventid,
                    eventBookingDates: datesOnly,
                    nummberofDays: nummberofDays,
                    numberofadult: numberofadult,
                    numberofchild: numberofchild,
                    grandtotalprice: grandTotal
                });

                const response = {
                    success: true,
                    msg: "Event Booking Successful!",
                    data: {
                        BookingDetails: createdEventBooking,
                        grandTotal: grandTotal
                    }
                };
                res.status(200).send(response);
            }
        
        } 
        catch (error)
        {
            res.status(500).send({
                success: false,
                msg: "Failed to book event",
                error: error.message
            });
        }
};


const getAllEventBookings = async (req, res) => {
    const { user_id } = req.params;
    try {
        const eventBooking = await EventBooking.findOne({ user_id: user_id });

        if (!eventBooking) {
            return res.status(404).json({
                success: false,
                msg: "Event Booking not found for the user",
            });
        }

        const formattedDates = eventBooking.eventBookingDates.map(date => {
            const formattedDate = new Date(date).toLocaleDateString('en-GB');
            return formattedDate;
        });

        const formattedEventBooking = {
            ...eventBooking._doc,
            eventBookingDates: formattedDates
        };

        // Get event name using eventid
        const event = await Event.findOne({ _id: eventBooking.eventid });

        if (!event) {
            return res.status(404).json({
                success: false,
                msg: "Event not found for the eventid",
            });
        }

        const eventDetails = {
            eventId: event._id,
            eventName: event.eventName,
            // Add other event details as needed
        };

        formattedEventBooking.event = eventDetails;

        res.status(200).json({
            success: true,
            msg: "Booking found",
            data: formattedEventBooking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Failed to fetch event booking",
            error: error.message
        });
    }
};



module.exports = {
    calculateGrandTotalPrice,
    eventbooking,
    getAllEventBookings
}