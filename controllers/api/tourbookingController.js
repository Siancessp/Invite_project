const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const TourBooking = require("../../models/api/eventbookingModel");
const TourDetails = require("../../models/api/tourModel");

const calculateGrandTotalPrice = async (tourid, numberofadult, numberofchild) => {
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
            grandTotalAdults = numberofadult * adult_price;
        }
        let grandTotalChildren = 0;
        if (numberofchild) {
            grandTotalChildren = numberofchild * child_price;
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

const calculateWeekendBooking = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the difference in days
    const diffInMs = end - start;
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    // Get the booking dates
    const bookingDates = [];
    for (let i = 0; i <= diffInDays; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        bookingDates.push(date.toISOString().split('T')[0]);
    }

    return {
        bookingDates: bookingDates,
        numDays: diffInDays
    };
};

const tourbooking = async (req, res) => {
    const { user_id, numberofadult, numberofchild, tourid } = req.body;
    try {
        let existingBooking = await TourBooking.findOne({ user_id: user_id, eventid: tourid });

        const tourDetails = await TourDetails.findOne({ _id: tourid });

        // Ensure that weekendDetails exist
        if (!tourDetails) {
            return res.status(404).send({
                success: false,
                msg: "Tour details not found"
            });
        }

        // Extract necessary details from weekendDetails
        const { tour_start_date, tour_end_date } = tourDetails;

        // Calculate the booking dates and number of days
        let { bookingDates, numDays } = calculateWeekendBooking(tour_start_date, tour_end_date);

        if (existingBooking) {
            const grandTotalResponse = await calculateGrandTotalPrice(tourid, numberofadult, numberofchild);
            const grandTotal = grandTotalResponse.data;
            existingBooking.nummberofDays = numDays;
            existingBooking.eventBookingDates = bookingDates;
            existingBooking.numberofadult = numberofadult;
            existingBooking.numberofchild = numberofchild;
            existingBooking.grandtotalprice = grandTotal;

            await existingBooking.save();
            // const { nummberofDays, eventBookingDates, ...bookingDetails } = existingBooking.toObject();

            const response = {
                success: true,
                msg: "Weekend Booking Updated Successfully!",
                data: {
                    BookingDetails: existingBooking,
                    grandTotal: grandTotal
                }
            };
            res.status(200).send(response);
        } else {
            const grandTotalResponse = await calculateGrandTotalPrice(tourid, numberofadult, numberofchild);
            const grandTotal = grandTotalResponse.data;
            const createdTourBooking = await TourBooking.create({
                user_id: user_id,
                eventid: tourid,
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
            msg: "Failed to book weekend",
            error: error.message
        });
    }
};

const getAllTourBookings = async (req, res) => {
    const { user_id } = req.params;
    try {
        const tourBooking = await TourBooking.findOne({ user_id: user_id });

        if (!tourBooking) {
            return res.status(404).json({
                success: false,
                msg: "Tour Booking not found for the user",
            });
        }

        const tourDetails = await TourDetails.findOne({ _id: tourBooking.eventid });

        if (!tourDetails) {
            return res.status(404).send({
                success: false,
                msg: "Tour details not found",
            });
        }

        const startDate = new Date(tourDetails.tour_start_date);
        const endDate = new Date(tourDetails.tour_end_date);

        // Calculate the difference in days
        const timeDifference = endDate - startDate;
        const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

        // Calculate the difference in hours for the night count
        const startTime = new Date(`1970-01-01T${tourDetails.tour_start_time}`);
        const endTime = new Date(`1970-01-01T${tourDetails.tour_end_time}`);
        const timeDifferenceInHours = (endTime - startTime) / (1000 * 60 * 60);

        // Calculate the number of nights
        const numberOfNights = daysDifference + (timeDifferenceInHours >= 24 ? 1 : 0);

        const formattedDates = tourBooking.eventBookingDates.map((date) => {
            const formattedDate = new Date(date).toLocaleDateString("en-GB");
            return formattedDate;
        });

        const formattedWekendBooking = {
            ...tourBooking._doc,
            eventBookingDates: formattedDates,
            tourname: tourDetails.tourname,
            numberOfDays: daysDifference,
            numberOfNights: numberOfNights,
        };

        res.status(200).json({
            success: true,
            msg: "Booking found",
            data: formattedWekendBooking,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Failed to fetch weekend booking",
            error: error.message,
        });
    }
};



module.exports = {
    calculateGrandTotalPrice,
    tourbooking,
    getAllTourBookings
}