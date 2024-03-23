const mongoose = require("mongoose");

const tourcategorySchema = new mongoose.Schema({
    tourcategoryid: {
        type: String,
        required: true
    },
    tourtemplate: {
        type: String,
        required: false 
    }
});

const tourcategory = mongoose.model("Tourcategorytemplate", tourcategorySchema);

module.exports = tourcategory;
