const mongoose = require("mongoose");
const { isNonNullObject } = require("razorpay/dist/utils/razorpay-utils");

const userregisterSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    profile_image: {
        type: String,
        default: null  // Set default value to null
    },
    background_image: {
        type: String,
        default: null  // Set default value to null
    },
    user_bio: {
        type: String,
        default: null  // Set default value to null
    },
    confirmpassword: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    referal_code: {
        type: String,
        required: true
    },
    token: {
        type: String,
        default: null
    },
    referral_points: {
        type: Number, // Assuming referral points are numeric
        default: 0
      },
    created_date: {
        type: String,
        required: true
    }
});

const userregister = mongoose.model("User", userregisterSchema);

module.exports = userregister;
