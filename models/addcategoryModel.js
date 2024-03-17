const mongoose = require("mongoose");

const addcategorySchema = new mongoose.Schema({
    categoryname: {
        type: String,
        required: true
    }
});

const addcategory = mongoose.model("Category", addcategorySchema);

module.exports = addcategory;
