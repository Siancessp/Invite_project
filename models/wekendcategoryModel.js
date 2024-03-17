const mongoose = require("mongoose");

const weakendcategorySchema = new mongoose.Schema({
    weakendcategoryname: {
        type: String,
        required: true
    }
});

const weakendcategory = mongoose.model("Weekendcategory", weakendcategorySchema);

module.exports = weakendcategory;
