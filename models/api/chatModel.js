const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    chatName: {
        type: String
    },
    type: {
        type: String,
        enum: ["private","group"],
        default: "private"
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    latestMessage:
    {
        type: {},
        ref: "User",
    },
    groupAdmin:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
},{timestamps: true});

const cahtdetails = mongoose.model("Chat", chatSchema);

module.exports = cahtdetails;
