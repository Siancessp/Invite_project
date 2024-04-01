const mongoose = require("mongoose");

const eventbookingSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    nummberofDays: {
        type: String,
        required: true
    },
    eventBookingDates: {
        type: Date,
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

const eventbookingdetails = mongoose.model("EventBooking", eventbookingSchema);

module.exports = eventbookingdetails;
