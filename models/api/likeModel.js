const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
    liked_By: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    post_id: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        defult : 0
    },
    user_sharedBy: {
        type: String,
        required: false
    }
});

const likedetails = mongoose.model("Like", likeSchema);

module.exports = likedetails;
