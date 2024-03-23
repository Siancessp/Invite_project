const mongoose = require("mongoose");

const tourcategorySchema = new mongoose.Schema({
    tourcategoryname: {
        type: String,
        required: true
    }
});

const tourcategory = mongoose.model("Tourcategory", tourcategorySchema);

module.exports = tourcategory;
