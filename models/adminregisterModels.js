const mongoose = require("mongoose");

const adminregisterSchema = new mongoose.Schema({
    roleid: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    mobileno: {
        type: String,
        required: true
      },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmpassword: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    created_date: {
        type: String,
        required: true
    }
});

const adminRegister = mongoose.model("Register", adminregisterSchema);

module.exports = adminRegister;
