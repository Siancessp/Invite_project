const mongoose = require("mongoose");

const weakendcategorySchema = new mongoose.Schema({
    weakendcategoryname: {
        type: String,
        required: true
    }
});

const weakendcategory = mongoose.model("WeakEndcategory", weakendcategorySchema);

module.exports = weakendcategory;
