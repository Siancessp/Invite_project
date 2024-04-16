const mongoose = require("mongoose");

const eventbookingSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    eventid: {
        type: String,
        required: true
    },
    nummberofDays: {
        type: String,
        required: false
    },
    eventBookingDates: {
        type: [Date], // Changed to array of Date objects
        required: false
    },
    numberofadult: {
        type: String,
        required: false
    },
    numberofchild: {
        type: String
    },
    grandtotalprice: {
        type: String,
        required: true
    }
});

eventbookingSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

const eventbookingdetails = mongoose.model("EventBooking", eventbookingSchema);

module.exports = eventbookingdetails;
