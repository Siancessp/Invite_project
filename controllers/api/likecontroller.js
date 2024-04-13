const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const Like = require("../../models/api/likeModel");
const User = require("../../models/api/userregisterModel");

const storelikeDetails = async (req, res) => {
    const { user_id, post_id, user_sharedBy } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(user_id) ||
            !mongoose.Types.ObjectId.isValid(post_id) ||
            (user_sharedBy && !mongoose.Types.ObjectId.isValid(user_sharedBy))) {
            return res.status(400).json({ success: false, message: 'Invalid IDs' });
        }

        // Check if the user has already liked the post
        const existingLike = await Like.findOne({ post_id, liked_By: user_id });

        if (existingLike) {
            // If the user has already liked the post, remove the like
            await Like.findOneAndUpdate(
                { _id: existingLike._id },
                { $pull: { liked_By: user_id }, $inc: { likes: -1 } }
            );

            return res.status(200).json({ success: true, message: 'Like removed successfully' });
        }

        // Check if any other user has liked the post
        const otherLike = await Like.findOne({ post_id, liked_By: { $ne: user_id } });

        if (otherLike) {
            // If other users have liked the post, add the like and increment the likes count
            await Like.findOneAndUpdate(
                { _id: otherLike._id },
                { $addToSet: { liked_By: user_id }, $inc: { likes: 1 } }
            );

            return res.status(200).json({ success: true, message: 'Like added successfully' });
        }

        // If no likes exist for the post, add the like and set likes count to 1
        const newLike = new Like({
            liked_By: [user_id],
            post_id,
            likes: 1,
            user_sharedBy
        });

        const savedLike = await newLike.save();

        return res.status(201).json({ success: true, message: 'Like added successfully', data: savedLike });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Internal Server Error" });
    }
};

const getLikeDetails = async (req, res) => {
    const { post_id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(post_id)) {
            return res.status(400).json({ success: false, message: 'Invalid post ID' });
        }
        // Get the total number of likes for the post
        const likeCount = await Like.findOne({ post_id }).select('likes');
        if (!likeCount) {
            return res.status(404).json({ success: false, message: 'Like count not found for the post' });
        }
        // Get the IDs of users who liked the post
        const likedUsersIds = await Like.findOne({ post_id }).select('liked_By');
        if (!likedUsersIds) {
            return res.status(404).json({ success: false, message: 'Users who liked the post not found' });
        }
        // Fetch details of users who liked the post from the User table
        const usersLiked = await User.find({ _id: { $in: likedUsersIds.liked_By } }).select('fullname');

        if (!usersLiked) {
            return res.status(404).json({ success: false, message: 'Users details not found' });
        }

        // Respond with the total like count and details of users who liked the post
        return res.status(200).json({ success: true, data: { likeCount, usersLiked } });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Internal Server Error" });
    }
};


module.exports = {
    storelikeDetails,
    getLikeDetails
}