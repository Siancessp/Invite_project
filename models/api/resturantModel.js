const mongoose = require("mongoose");

const resturantSchema = new mongoose.Schema(
    {
        user_id: {
            type: String,
            required: true
        },
        resturantlogo:
        {
            type: String,
            required: true 
        },
        resturantname:
        {
            type: String,
            required: true
        },
        resturantdescription:
        {
            type: String,
            required: true
        },
        mobileno:
        {
            type: String,
            required: true
        },
        address:
        {
            type: String,
            required: true
        },
        menu:
        {
            type: String,
            required: true
        },
        price:
        {
            type: String,
            required: true
        },
        created_date: {
            type: Date,
            default: Date.now
        },
        updated_date: {
            type: Date,
            default: Date.now
        }
    }
);

const resturant = mongoose.model("Resturant",resturantSchema);

module.exports = resturant;