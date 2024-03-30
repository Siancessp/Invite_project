const mongoose = require("mongoose");

const User = require("../api/userregisterModel");

const commentSchema = new mongoose.Schema({
    commented_By: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post_id: {
        type: String,
        required: true
    },
    comments: {
        type: Number,
        defult : 0
    },
    comment: {
        type: String,
        required: true,
        maxlength: 500 // Example: Maximum 500 characters for comment
    },
    post_sharedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    replies: [{
        replied_By: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        reply: {
            type: String,
            required: true,
            maxlength: 500
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const commentdetails = mongoose.model("Comment", commentSchema);

module.exports = commentdetails;
