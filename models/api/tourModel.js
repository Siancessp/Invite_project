const mongoose = require("mongoose");

const tourregisterSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    tourname: {
        type: String,
        required: true
    },
    tourtemplateid: {
        type: String,
        required: true
    },
    tourdescription: {
        type: String,
        required: true
    },
    tour_start_date: {
        type: String,
        required: true
    },
    tour_end_date: {
        type: String,
        required: true
    },
    tour_start_time: {
        type: String,
        required: true
    },
    tour_end_time: {
        type: String,
        required: true
    },
    tour_location: {
        type: String,
        required: true
    },
    tour_price_adult: {
        type: String,
        required: true
    },
    tour_price_child: {
        type: String,
        required: true
    },
    tour_price_infant: {
        type: String
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});

const tourdetails = mongoose.model("Tourdetails", tourregisterSchema);

module.exports = tourdetails;
