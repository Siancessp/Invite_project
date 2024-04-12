const express = require('express');
const app = express();
const mongoose = require("mongoose");
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const Comment = require("../../models/api/commentModel");

const storecommentDetails = async (req, res) => {
    const { commented_By, comment, post_id, post_sharedBy } = req.body;
    try {
        // Validate the provided user IDs and comment
        if (
            !mongoose.Types.ObjectId.isValid(commented_By) ||
            typeof comment !== 'string' ||
            (post_sharedBy && !mongoose.Types.ObjectId.isValid(post_sharedBy))
        ) {
            return res.status(400).json({ success: false, message: 'Invalid data provided' });
        }

        // Create a new comment object
        const newComment = new Comment({ commented_By, comment, post_id, post_sharedBy });

        // Save the new comment to the database
        const savedComment = await newComment.save();
        const commentsCount = await Comment.countDocuments({ post_id });

        // Return success response with essential comment details
        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: {
                _id: savedComment._id,
                comment: savedComment.comment,
                post_id: savedComment.post_id,
                createdAt: savedComment.createdAt,
                totalComments:commentsCount
                // Add other necessary fields to include in the response
            }
        });
    } catch(error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};



const getcommentDetails = async (req, res) => {
    const { post_id } = req.params;

    try {
        // Find all comments for the specified post and populate the commented_By field with user details
        const comments = await Comment.find({ post_id }).populate('commented_By', '_id fullname');

        // If there are no comments for the post
        if (comments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No comments found for this post',
                data: []
            });
        }

        // Extract the necessary data for response
        const commentsData = comments.map(comment => ({
            _id: comment._id,
            comment: comment.comment,
            commented_By: {
                _id: comment.commented_By._id,
                username: comment.commented_By.fullname
            }
        }));

        res.status(200).json({
            success: true,
            message: 'Comments retrieved successfully',
            data: commentsData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const addReplyToComment = async (req, res) => {
    const { commentId } = req.params;
    const { replied_By, reply } = req.body;

    try {
        // Find the comment by its ID
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Add the new reply to the replies array
        comment.replies.push({
            replied_By: replied_By, // The ID of the user who replied
            reply: reply
        });

        // Save the updated comment
        await comment.save();

        res.status(201).json({
            success: true,
            message: 'Reply added successfully',
            data: comment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getCommentWithReplies = async (req, res) => {
    const { commentId } = req.params;

    try {
        // Find the comment by its ID
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Comment retrieved successfully',
            data: comment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


module.exports = {
    storecommentDetails,
    getcommentDetails,
    addReplyToComment,
    getCommentWithReplies
}