const mongoose = require("mongoose");

const adminloginSchema = new mongoose.Schema({
    eamil: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const adminlogin = mongoose.model("Login", adminloginSchema);

module.exports = adminlogin;
