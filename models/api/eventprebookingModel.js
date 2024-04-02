const mongoose = require("mongoose");

const eventprebookingSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    event_id: {
        type: String,
        required: true
    },
    nummberofDays: {
        type: String,
        required: true
    },
    eventBookingDates: {
        type: [Date], // Changed to array of Date objects
        required: true
    },
    numberofadult: {
        type: String,
        required: true
    },
    numberofchild: {
        type: String
    },
    grandtotalprice: {
        type: String,
        required: true
    }
});

const eventprebookingdetails = mongoose.model("EventpreBooking", eventprebookingSchema);

module.exports = eventprebookingdetails;
