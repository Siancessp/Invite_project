const mongoose = require("mongoose");

const weakendcategorySchema = new mongoose.Schema({
    weakendcategoryid: {
        type: String,
        required: true
    },
    weakendtemplate: {
        type: String,
        required: false 
    }
});

const weakendcategory = mongoose.model("Weakendcategorytemplate", weakendcategorySchema);

module.exports = weakendcategory;
