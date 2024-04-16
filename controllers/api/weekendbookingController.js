const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const WeekendBooking = require("../../models/api/eventbookingModel");
const WeakendDetails = require("../../models/api/weakendModel");

const calculateGrandTotalPrice = async (weekendid, numberofadult, numberofchild) => {
    try {
        const storedweekendData = await WeakendDetails.findById(weekendid);
        if (!storedweekendData) {
            return {
                success: false,
                msg: "Weekend not found",
                data: null
            };
        }
        const adult_price = storedweekendData.weakend_price_adult;
        const child_price = storedweekendData.weakend_price_child;
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
};

// Function to calculate the booking dates and number of days
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

  const weekendbooking = async (req, res) => {
    const { user_id, numberofadult, numberofchild, weekendid } = req.body;
    try {
        let existingBooking = await WeekendBooking.findOne({ user_id: user_id, eventid: weekendid });

        const weekendDetails = await WeakendDetails.findOne({ _id: weekendid });

        // Ensure that weekendDetails exist
        if (!weekendDetails) {
            return res.status(404).send({
                success: false,
                msg: "Weekend details not found"
            });
        }

        // Extract necessary details from weekendDetails
        const { weakend_start_date, weakend_end_date } = weekendDetails;
        console.log("Start Date:", weakend_start_date);
        console.log("End Date:", weakend_end_date);

        // Calculate the booking dates and number of days
        let { bookingDates, numDays } = calculateWeekendBooking(weakend_start_date, weakend_end_date);

        if (existingBooking) {
            const grandTotalResponse = await calculateGrandTotalPrice(weekendid, numberofadult, numberofchild);
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
            const grandTotalResponse = await calculateGrandTotalPrice(weekendid, numberofadult, numberofchild);
            const grandTotal = grandTotalResponse.data;
            const createdWeekendBooking = await WeekendBooking.create({
                user_id: user_id,
                eventid: weekendid,
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
    } catch (error) {
        res.status(500).send({
            success: false,
            msg: "Failed to book weekend",
            error: error.message
        });
    }
};

const getAllWeekendBookings = async (req, res) => {
    const { user_id } = req.params;
    try {
        const weekendBooking = await WeekendBooking.findOne({ user_id: user_id });
        

        if (!weekendBooking) {
            return res.status(404).json({
                success: false,
                msg: "Weekend Booking not found for the user",
            });
        }

        
        const formattedDates = weekendBooking.eventBookingDates.map(date => {
            const formattedDate = new Date(date).toLocaleDateString('en-GB');
            return formattedDate;
        });

        const weekend = await WeakendDetails.findOne({ _id: weekendBooking.eventid });

        if (!weekend) {
            return res.status(404).json({
                success: false,
                msg: "Weekend not found for the weekendid",
            });
        }

        const startDate = new Date(weekend.weakend_start_date);
        const endDate = new Date(weekend.weakend_end_date);

        // Calculate the difference in days
        const timeDifference = endDate - startDate;
        const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

        // Calculate the difference in hours for the night count
        const startTime = new Date(`1970-01-01T${weekend.weakend_start_time}`);
        const endTime = new Date(`1970-01-01T${weekend.weakend_end_time}`);
        const timeDifferenceInHours = (endTime - startTime) / (1000 * 60 * 60);

        // Calculate the number of nights
        const numberOfNights = daysDifference + (timeDifferenceInHours >= 24 ? 1 : 0);

        const formattedWekendBooking = {
            ...weekendBooking._doc,
            eventBookingDates: formattedDates,
            weakendname:weekend.weakendname,
            numberOfDays: daysDifference,
            numberOfNights: numberOfNights,
        };

        res.status(200).json({
            success: true,
            msg: "Booking found",
            data: formattedWekendBooking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Failed to fetch weekend booking",
            error: error.message
        });
    }
};


module.exports = {
    calculateGrandTotalPrice,
    weekendbooking,
    getAllWeekendBookings
}