const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const TourBooking = require("../../models/api/eventbookingModel");
const TourDetails = require("../../models/api/tourModel");

const calculateGrandTotalPrice = async (tourid, nummberofDays, numberofadult, numberofchild) => {
    try {
        const storedtourData = await TourDetails.findById(tourid);
        if (!storedtourData) {
            return {
                success: false,
                msg: "Tour not found",
                data: null
            };
        }
        const adult_price = storedtourData.tour_price_adult;
        const child_price = storedtourData.tour_price_child;
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
  const tourbooking = async (req, res) => {
    const { user_id, tourBookingDates, numberofDays, numberofadult, numberofchild, tourid } = req.body;
    try {
        let existingBooking = await TourBooking.findOne({ user_id: user_id, eventid: tourid });

        if (existingBooking) {
            const grandTotalResponse = await calculateGrandTotalPrice(tourid, numberofDays, numberofadult, numberofchild);
            const grandTotal = grandTotalResponse.data;

            const datesOnly = cleanDates(tourBookingDates);

            existingBooking.eventBookingDates = datesOnly;
            existingBooking.nummberofDays = numberofDays;
            existingBooking.numberofadult = numberofadult;
            existingBooking.numberofchild = numberofchild;
            existingBooking.grandtotalprice = grandTotal;

            await existingBooking.save();

            const response = {
                success: true,
                msg: "Tour Booking Updated Successfully!",
                data: {
                    BookingDetails: existingBooking,
                    grandTotal: grandTotal
                }
            };
            res.status(200).send(response);
        } else {
            const grandTotalResponse = await calculateGrandTotalPrice(tourid, numberofDays, numberofadult, numberofchild);
            const grandTotal = grandTotalResponse.data;

            const datesOnly = cleanDates(tourBookingDates);

            const createdTourBooking = await TourBooking.create({
                user_id: user_id,
                eventid: tourid,
                eventBookingDates: datesOnly,
                nummberofDays: numberofDays,
                numberofadult: numberofadult,
                numberofchild: numberofchild,
                grandtotalprice: grandTotal
            });

            const response = {
                success: true,
                msg: "Tour Booking Successful!",
                data: {
                    BookingDetails: createdTourBooking,
                    grandTotal: grandTotal
                }
            };
            res.status(200).send(response);
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            msg: "Failed to book tour",
            error: error.message
        });
    }
};




module.exports = {
    calculateGrandTotalPrice,
    tourbooking
}