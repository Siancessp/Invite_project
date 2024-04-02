const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    razorpay_payment_id: {
        type: String
    },
    razorpay_order_id: {
        type: String,
        required: true
    },
    razorpay_signature: {
        type: String,
        required: false
    },
    status: {
        type: String,
        default: null // Default value is null
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});

const paymentdetails = mongoose.model("Payment", paymentSchema);

module.exports = paymentdetails;
