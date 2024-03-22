const mongoose = require("mongoose");

const weakendregisterSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    weakendid: {
        type: String,
        required: true
    },
    weakendtemplateid: {
        type: String,
        required: true
    },
    weakenddescription: {
        type: String,
        required: true
    },
    weakend_start_date: {
        type: String,
        required: true
    },
    weakend_end_date: {
        type: String,
        required: true
    },
    weakend_start_time: {
        type: String,
        required: true
    },
    weakend_end_time: {
        type: String,
        required: true
    },
    weakend_location: {
        type: String,
        required: true
    },
    weakend_price_adult: {
        type: String,
        required: true
    },
    weakend_price_child: {
        type: String,
        required: true
    },
    weakend_price_infant: {
        type: String
    }
});

const weakenddetails = mongoose.model("Weakenddetails", weakendregisterSchema);

module.exports = weakenddetails;
