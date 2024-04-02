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
    let success = true;
    let error = "Payment Failed";

    try {
        const { user_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, status_code } = req.body;

        // Update payment details
        const updatePaymentResult = await Payment.updateOne(
            { razorpay_order_id, user_id },
            { $set: { razorpay_payment_id, razorpay_signature } }
        );

        // Verify payment signature
        await razorpayInstance.utility.verifyPaymentSignature({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });

        // If verification is successful, update transaction status
        if (updatePaymentResult.nModified > 0) {
            const updateTransactionResult = await Payment.updateOne(
                { razorpay_order_id, user_id },
                { $set: { status: "capture" } }
            );

            if (updateTransactionResult.nModified > 0) {
                // Payment status updated successfully
                return res.status(200).json({ success: true, message: 'Payment captured successfully' });
            } else {
                success = false;
                error = 'Failed to update transaction status';
            }
        } else {
            success = false;
            error = 'Failed to update payment details';
        }
    } catch (error) {
        console.error(error);
        success = false;
        error = 'Payment Error';
    }

    // Handle errors
    if (success === false) {
        return res.status(400).json({ success: false, message: error });
    }
};

// Example usage:
// app.post('/process-payment', payment);


module.exports ={
    checkout,
    payment
} 