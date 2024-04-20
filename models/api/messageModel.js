const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        require: true
    },
    users: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    chatId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat", 
        require: true
    }
},{timestamps: true});

const messagedetails = mongoose.model("Message", messageSchema);

module.exports = messagedetails;
