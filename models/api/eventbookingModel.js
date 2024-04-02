const mongoose = require("mongoose");

const eventbookingSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    nummberofDays: {
        type: Number, // Changed to Number for numerical values
        required: true
    },
    eventBookingDates: {
        type: [Date], // Array of Date objects
        required: true
    },
    numberofadult: {
        type: Number, // Changed to Number for numerical values
        required: true
    },
    numberofchild: {
        type: Number // Changed to Number for numerical values
    },
    grandtotalprice: {
        type: Number, // Changed to Number for numerical values
        required: true
    }
});

const eventbookingdetails = mongoose.model("EventBooking", eventbookingSchema);

module.exports = eventbookingdetails;
