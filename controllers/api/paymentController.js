const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const Razorpay = require('razorpay');

const Payment = require("../../models/api/paymentModel");

const eventBooking = require("../../models/api/eventbookingModel");

const Booking = require("../../models/api/bookingModel");

const dotenv = require('dotenv');
dotenv.config();

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});

const checkout = async (req, res) => {
    try {
        const { user_id, amount } = req.body;
        console.log(req.body);
        
        // Create a receipt ID that is within 40 characters
        const receiptId = `order_${user_id}_${Date.now()}`;
        const truncatedReceiptId = receiptId.substring(0, 40); // Truncate if necessary

        const orderOptions = {
            amount: amount,
            currency: "INR",
            receipt: truncatedReceiptId
        };

        const order = await razorpayInstance.orders.create(orderOptions);

        const paymentData = {
            user_id: user_id,
            amount: amount,
            razorpay_order_id: order.id
        };
        const newPayment = new Payment(paymentData);
        const savedPayment = await newPayment.save();

        res.status(201).json({
            status: true,
            order: order,
            amount: amount,
            payment: savedPayment
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, msg: 'Error creating Razorpay order' });
    }
};

const payment = async (req, res) => {
    let error = "Payment Failed";

    try {
        const { user_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const update = await Payment.updateOne(
            { razorpay_order_id, user_id },
            { $set: { razorpay_payment_id, razorpay_signature } }
        );
        const attributes = {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        };
        // await razorpayInstance.utility.verifyPaymentSignature(attributes);

        const update_transaction = await Payment.updateOne(
            { razorpay_order_id, user_id },
            { $set: { status: "capture" } }
        );

        console.log("Update Transaction:", update_transaction);

        if (update_transaction) {
            const eventData = await eventBooking.find({ user_id });

            // Extracting required data from eventData
            const bookedevent_ids = eventData.map(event => event._id);
            const nummberofDays = eventData.map(event => event.nummberofDays);
            const BookingDates = eventData.map(event => event.eventBookingDates).flat();
            const numberofadult = eventData.map(event => event.numberofadult);
            const numberofchild = eventData.map(event => event.numberofchild);
            const grandtotalprice = eventData.map(event => event.grandtotalprice);

            const newBooking = await Booking.create({
                user_id: user_id,
                status_code: req.body.status_code, // Make sure this is passed correctly in the request body
                bookedevent_id: bookedevent_ids,
                nummberofDays: nummberofDays,
                BookingDates: BookingDates,
                numberofadult: numberofadult,
                numberofchild: numberofchild,
                grandtotalprice: grandtotalprice
            });

            // Make the eventBookingDates empty for the user
            if (newBooking) {
                await eventBooking.updateMany({ user_id }, { $unset: { eventBookingDates: "" } });
                return res.status(200).json({ success: true, message: 'Payment captured successfully and booking created. Event table emptied.' });
            } else {
                return res.status(500).json({ success: false, message: 'Failed to create booking' });
            }
        } else {
            return res.status(400).json({ success: false, message: 'Failed to capture payment' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
}




module.exports ={
    checkout,
    payment
} 