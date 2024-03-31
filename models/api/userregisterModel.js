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
        defult: null
    },
    background_image: {
        type: String,
        defult: null
    },
    user_bio: {
        type: String,
        defult: null
    },
    confirmpassword: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    created_date: {
        type: String,
        required: true
    }
});

const userregister = mongoose.model("User", userregisterSchema);

module.exports = userregister;
