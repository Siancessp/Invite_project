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
    grandTotal: {  // Updated field name to grandTotal
        type: String,  // You can adjust the type as needed
        required: true
    }
});

const eventbookingdetails = mongoose.model("EventBooking", eventbookingSchema);

module.exports = eventbookingdetails;
