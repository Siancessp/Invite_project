const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const WeekendBooking = require("../../models/api/eventbookingModel");
const WeakendDetails = require("../../models/api/weakendModel");

const calculateGrandTotalPrice = async (weekendid, nummberofDays, numberofadult, numberofchild) => {
    try {
        const storedweekendData = await WeakendDetails.findById(weekendid);
        if (!storedweekendData) {
            return {
                success: false,
                msg: "Weekend not found",
                data: null
            };
        }
        const adult_price = storedweekendData.event_price_adult;
        const child_price = storedweekendData.event_price_child;
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
const weekendbooking = async (req, res) => {
    const { user_id, weekendBookingDates, nummberofDays, numberofadult, numberofchild, weekendid } = req.body;
    try {   
            let existingBooking = await WeekendBooking.findOne({ user_id: user_id, eventid: weekendid });

            if (existingBooking) {
                const grandTotalResponse = await calculateGrandTotalPrice(weekendid, nummberofDays, numberofadult, numberofchild);
                const grandTotal = grandTotalResponse.data;

               
                const datesOnly = cleanDates(weekendBookingDates);

                existingBooking.eventBookingDates = datesOnly;
                existingBooking.nummberofDays = nummberofDays;
                existingBooking.numberofadult = numberofadult;
                existingBooking.numberofchild = numberofchild;
                existingBooking.grandtotalprice = grandTotal;

                await existingBooking.save();

                const response = {
                    success: true,
                    msg: "Weekend Booking Updated Successfully!",
                    data: {
                        BookingDetails: existingBooking,
                        grandTotal: grandTotal
                    }
                };
                res.status(200).send(response);
            }
            else 
            {
                const grandTotalResponse = await calculateGrandTotalPrice(weekendid, nummberofDays, numberofadult, numberofchild);
                const grandTotal = grandTotalResponse.data;

                const datesOnly = cleanDates(weekendBookingDates);

                const createdWeekendBooking = await WeekendBooking.create({
                    user_id: user_id,
                    eventid: weekendid,
                    weekendBookingDates: datesOnly,
                    nummberofDays: nummberofDays,
                    numberofadult: numberofadult,
                    numberofchild: numberofchild,
                    grandtotalprice: grandTotal
                });

                const response = {
                    success: true,
                    msg: "Weekend Booking Successful!",
                    data: {
                        BookingDetails: createdWeekendBooking,
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
                msg: "Failed to book weekend",
                error: error.message
            });
        }
};




module.exports = {
    calculateGrandTotalPrice,
    weekendbooking
}