const express = require('express');
const app = express();
const mongoose = require("mongoose");
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const Comment = require("../../models/api/commentModel");
const User = require("../../models/api/userregisterModel");
const savePost = require("../../models/api/savepostModel");

const storecommentDetails = async (req, res) => {
    const { commented_By, comment, post_id, post_sharedBy } = req.body;
    try {
        // Validate the provided user IDs and comment
        if (!mongoose.Types.ObjectId.isValid(commented_By) || typeof comment !== 'string' || (post_sharedBy && !mongoose.Types.ObjectId.isValid(post_sharedBy))) 
        {
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
                post_sharedBy: savedComment.post_sharedBy,
                post_id: savedComment.post_id,
                createdAt: savedComment.createdAt,
                totalComments: commentsCount
            }
        });
    } catch(error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

const getCommentCount = async (req, res) => {
    const { post_id } = req.params;
    try {
        // Ensure post_id is valid
        if (!post_id) {
            return res.status(400).json({ success: false, message: 'Invalid post_id' });
        }

        // Find the count of comments for the specified post
        const commentCount = await Comment.countDocuments({ post_id });

        res.status(200).json({
            success: true,
            post_id:post_id, 
            commentCount: commentCount,
         });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getcommentDetails = async (req, res) => {
    const { post_id } = req.params;
    const baseImageUrlP = "/uploads/profile_image";
    try {
        // Find all comments for the specified post and populate the commented_By field with user details
        const comments = await Comment.find({ post_id }).populate('commented_By', '_id fullname profile_image');

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
                username: comment.commented_By.fullname,
                profile_image: baseImageUrlP + '/' + comment.commented_By.profile_image,
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


const deleteComment = async (req,res) =>
{
    const { commentId } = req.params;

    try{
        const deletedComment = await Comment.findByIdAndDelete(commentId);

        if (!deletedComment) {
            // If comment is not found
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });
    }
    catch(error)
    {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });   
    }
}

const addReplyToComment = async (req, res) => {
    const { replied_By, reply, commentId } = req.body;

    try {
        // Check if commentId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid commentId'
            });
        }

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
            replied_By: replied_By,
            reply: reply
        });

        // Save the updated comment
        const updatedComment = await comment.save();

        res.status(201).json({
            success: true,
            message: 'Reply added successfully',
            data: updatedComment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


const getCommentWithReplies = async (req, res) => {
    const { commentId } = req.params;
    const baseImageUrlP = "/uploads/profile_image";

    try {
        // Find the comment by its ID
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Fetch user details for each replied_By ID
        const populatedReplies = await Promise.all(comment.replies.map(async (reply) => {
            // Fetch user details using replied_By ID
            const user = await User.findById(reply.replied_By);
            if (!user) {
                // Handle if user is not found
                return {
                    ...reply.toObject(),
                    user: null
                };
            }

            // Add user's name to the reply object
            const { profile_image, fullname } = user;
            return {
                ...reply.toObject(),
                user: {
                    fullname,
                    profile_image: baseImageUrlP + '/' + profile_image,
                }
            };
        }));

        // Update the comment with populated replies
        const commentWithReplies = {
            ...comment.toObject(),
            replies: populatedReplies
        };

        res.status(200).json({
            success: true,
            message: 'Comment retrieved successfully',
            data: commentWithReplies
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const deleteReply = async (req, res) => {
    const { replyId } = req.params;

    try {
        // Find the comment containing the reply and remove the reply
        const updatedComment = await Comment.findOneAndUpdate(
            { "replies._id": replyId },
            { $pull: { replies: { _id: replyId } } },
            { new: true }
        );

        if (!updatedComment) {
            // If comment or reply is not found
            return res.status(404).json({
                success: false,
                message: 'Comment or Reply not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reply deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

const SavePost = async (req,res) =>
{
    const { postId, userId } = req.body;
    try
    {
        if (!mongoose.Types.ObjectId.isValid(postId) || (userId && !mongoose.Types.ObjectId.isValid(userId))) 
        {
            return res.status(400).json({ success: false, message: 'Invalid data provided' });
        }

        const newPost = new savePost({
             postId: postId, 
             userId: userId 
            });
        const savedPost = await newPost.save();
        res.status(200).json({
            success: true,
            message: 'Post Saved successfully',
            data: savedPost
        });
    }
    catch(error)
    {
        console.error(error);
        res.status.json({
            status: false,
            message: 'Internal Server Error'
        });
    }
};

const savedpostDetails = async (req, res) => {
    const userId = req.params.userId; 
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid data provided' });
        }
        
        const savedPostDetails = await savePost.find({ userId: userId });
        // console.log(savedPostDetails);
        // const data1 = savedPostDetails[0].postId;

        // console.log(data1);

        res.status(200).json({
            success: true,
            message: 'Saved Post Details Retrieved Successfully',
            data: savedPostDetails
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};


module.exports = {
    storecommentDetails,
    getcommentDetails,
    addReplyToComment,
    getCommentWithReplies,
    getCommentCount,
    deleteComment,
    deleteReply,
    SavePost,
    savedpostDetails
}