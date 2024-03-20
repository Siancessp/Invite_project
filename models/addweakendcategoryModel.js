const mongoose = require("mongoose");

const weakendcategorySchema = new mongoose.Schema({
    weakendcategoryid: {
        type: String,
        required: true
    },
    weakendtemplate: {
        type: String,
        required: true 
    }
});

const weakendcategory = mongoose.model("Weakendcategory", weakendcategorySchema);

module.exports = weakendcategory;
