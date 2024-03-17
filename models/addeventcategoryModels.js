const mongoose = require("mongoose");

const eventcategorySchema = new mongoose.Schema({
    categoryid: {
        type: String,
        required: true
    },
    eventtemplate: {
        type: String,
        required: true 
    }
});

const eventcategory = mongoose.model("Eventcategory", eventcategorySchema);

module.exports = eventcategory;
