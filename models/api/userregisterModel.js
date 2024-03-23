const mongoose = require("mongoose");

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
        required: false
    },
    background_image: {
        type: String,
        required: false
    },
    user_bio: {
        type: String,
        required: false
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
