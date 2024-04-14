const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
    postId:
    {
        type: Schema.Types.ObjectId,
        require: true
    },
    userId:
    {
        type: Schema.Types.ObjectId,
        require: true
    },
    type:
    {
        type: String,
        require: true
    }
});

const savewishlistdetails = mongoose.model("Wishlist",wishlistSchema);

module.exports = savewishlistdetails;