const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    bookedevent_id: {
        type: String,
        required: true
    },
    status_code: {
        type: String,
        required: true
    },
    nummberofDays: {
        type: String,
        required: true
    },
    BookingDates: {
        type: [String], // Array of date strings
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

const bookingdetails = mongoose.model("Booking", bookingSchema);

module.exports = bookingdetails;
