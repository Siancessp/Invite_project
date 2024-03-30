const mongoose = require("mongoose");

const eventregisterSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    eventtemplateid: {
        type: String,
        required: true
    },
    eventname: {
        type: String,
        required: true
    },
    eventdescription: {
        type: String,
        required: true
    },
    event_start_date: {
        type: String,
        required: true
    },
    event_end_date: {
        type: String,
        required: true
    },
    event_start_time: {
        type: String,
        required: true
    },
    event_end_time: {
        type: String,
        required: true
    },
    event_location: {
        type: String,
        required: true
    },
    event_price_adult: {
        type: String,
        required: true
    },
    event_price_child: {
        type: String,
        required: true
    }
});

const eventdetails = mongoose.model("Event", eventregisterSchema);

module.exports = eventdetails;
