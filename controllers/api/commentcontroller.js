const express = require('express');
const app = express();
const mongoose = require("mongoose");
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const Comment = require("../../models/api/commentModel");
const User = require("../../models/api/userregisterModel");
const savePost = require("../../models/api/savepostModel");
const EventDetails = require("../../models/api/eventModel");
const EventTemaplte = require("../../models/addeventcategoryModels");
const WeekendTemaplte = require("../../models/addweakendcategoryModel");
const TourDetails = require("../../models/api/tourModel");
const TourTemplate = require("../../models/addtourcategoryModel");
const WeekendDetails = require("../../models/api/weakendModel");
const Wishlist = require("../../models/api/wishlistModel");

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

const SavePost = async (req, res) => {
    const { postId, userId, type } = req.body;
    try {
        if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid data provided' });
        }
        const existingSavedPost = await savePost.findOne({ postId, userId, type });

        if (existingSavedPost) {
            await savePost.deleteOne({ postId, userId, type });
            res.status(200).json({
                success: true,
                message: 'Post Unsaved successfully',
                data: { postId, userId, type }
            });
        } else {
            const newPost = new savePost({
                postId,
                userId,
                type
            });
            const savedPost = await newPost.save();
            res.status(200).json({
                success: true,
                message: 'Post Saved successfully',
                data: savedPost
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};



const getHumanReadableDate = (date) => {
    if (date instanceof Date) {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    } else if (typeof date === 'string') {
        const formattedDate = new Date(date);
        if (!isNaN(formattedDate.getTime())) {
            const options = { day: '2-digit', month: 'short', year: 'numeric' };
            return formattedDate.toLocaleDateString('en-GB', options);
        }
    }
    return null;
};

const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const formattedHours = parseInt(hours, 10) % 12 || 12; // Convert to 12-hour format
    const ampm = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
    return `${formattedHours}:${minutes} ${ampm}`;
};


const savedpostDetails = async (req, res) => {
    const userId = req.params.userId;
    const baseImageUrl = "/uploads/event_template";
    const baseImageUrlP = "/uploads/profile_image";

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid data provided' });
        }

        const savedPostDetails = await savePost.find({ userId: userId });
        const allEvents = [];

        for (const postDetail of savedPostDetails) {
            const postId = postDetail.postId;
            const type = postDetail.type;

            if (type === 'event') {
                const eventData = await EventDetails.findOne({ _id: postId });
                const eventtemplateId = eventData.eventtemplateid;
                const user_id = eventData.user_id;
                const userData = await User.findOne({ _id: user_id });
                const eventtemplateData = await EventTemaplte.findOne({ _id: eventtemplateId });

                const eventDetailsObject = {
                    type,
                    postId: eventData._id,
                    description: eventData.eventdescription,
                    createddate: getHumanReadableDate(eventData.created_date),
                    location: eventData.event_location,
                    startdate: getHumanReadableDate(eventData.event_start_date),
                    starttime: formatTime(eventData.event_start_time),
                    user: userData ? {
                        _id: userData._id,
                        username: userData.fullname,
                        profile_image: baseImageUrlP + '/' + userData.profile_image
                    } : null,
                    templateimage: eventtemplateData ? {
                        _id: eventtemplateData._id,
                        templateimage: baseImageUrl + '/' + eventtemplateData.eventtemplate
                        // Add other template details you want to include
                    } : null
                };

                allEvents.push(eventDetailsObject);
            } else if (type === 'tour') {
                const tourData = await TourDetails.findOne({ _id: postId });
                const tourtemplateId = tourData.tourtemplateid;
                const user_id = tourData.user_id;
                const userData = await User.findOne({ _id: user_id });
                const tourtemplateData = await TourTemplate.findOne({ _id: tourtemplateId });

                const tourDetailsObject = {
                    type,
                    postId: tourData._id,
                    description: tourData.tourdescription,
                    createddate: getHumanReadableDate(tourData.created_date),
                    location: tourData.tour_location,
                    startdate: getHumanReadableDate(tourData.tour_start_date),
                    starttime: formatTime(tourData.tour_start_time),
                    user: userData ? {
                        _id: userData._id,
                        username: userData.fullname,
                        profile_image: baseImageUrlP + '/' + userData.profile_image
                    } : null,
                    templateimage: tourtemplateData ? {
                        _id: tourtemplateData._id,
                        templateimage: baseImageUrl + '/' + tourtemplateData.tourtemplate
                    } : null
                };

                allEvents.push(tourDetailsObject);
            } else if (type === 'weekend') {
                const weekendData = await WeekendDetails.findOne({ _id: postId });
                const weekendtemplateId = weekendData.weakendtemplateid;
                const user_id = weekendData.user_id;
                const userData = await User.findOne({ _id: user_id });
                const weekendtemplateData = await WeekendTemaplte.findOne({ _id: weekendtemplateId });

                const weekendDetailsObject = {
                    type,
                    postId: weekendData._id,
                    description: weekendData.weakenddescription,
                    createddate: getHumanReadableDate(weekendData.created_date),
                    location: weekendData.weakend_location,
                    startdate: getHumanReadableDate(weekendData.weakend_start_date),
                    starttime: formatTime(weekendData.weakend_start_time),
                    user: userData ? {
                        _id: userData._id,
                        username: userData.fullname,
                        profile_image: baseImageUrlP + '/' + userData.profile_image
                    } : null,
                    templateimage: weekendtemplateData ? {
                        _id: weekendtemplateData._id,
                        templateimage: baseImageUrl + '/' + weekendtemplateData.weakendtemplate
                    } : null
                };

                allEvents.push(weekendDetailsObject);
            }
        }

        // Custom sorting function to sort events by date and time
        allEvents.sort((a, b) => {
            const dateA = new Date(a.startdate + " " + a.starttime);
            const dateB = new Date(b.startdate + " " + b.starttime);
            return dateA - dateB;
        });

        res.status(200).json({
            success: true,
            message: 'Saved Post Details Retrieved Successfully',
            details: allEvents
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};

const saveWishlist = async (req,res) =>
{
    const { postId, userId, type } = req.body;
    try{
        if(!mongoose.Types.ObjectId(postId) || !mongoose.Types.ObjectId(userId))
        {
            return res.status(400).json({
                success: false,
                message: 'Invalid data provided'
            });
        }
        
        const existingWishlist = await Wishlist.findOne({ userId, postId, type });

        if(existingWishlist)
        {
            await Wishlist.deleteOne({ userId, postId, type });

            res.status(200).json({
                success: true,
                message: 'WishList Unsaved Successfully!'
            });
        }
        else
        {
            const newWishlist = await Wishlist({
                postId,
                userId,
                type
            });

            const savedWishlist = await newWishlist.save();

            res.status(200).json({
                success: true,
                message: 'Wishlist Saved Successfully!',
                data: savedWishlist 
            });
        }
    }
    catch(error)
    {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Internal Server Error'
        });
    }
};

const savedWishlistDetails = async (req,res) =>
{
    const userId = req.params.userId;
    const baseImageUrl = "/uploads/event_template";
    const baseImageUrlP = "/uploads/profile_image";
    try{
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid data provided' });
        }

        const savedWishlistDetails = await savePost.find({ userId: userId });
        const allWishlists = [];

        for(const wishlistDetail of savedWishlistDetails)
        {
            const postId = wishlistDetail.postId;
            const type = wishlistDetail.type;

            if (type === 'event')
            {
                const eventwishlistData = await EventDetails.findOne({ _id: postId });
                const eventwishlisttemplateId = eventwishlistData.eventtemplateid;
                const eventwishlisttemplateData = await EventTemaplte.findOne({ _id: eventwishlisttemplateId });
                const user_id = eventwishlistData.user_id;
                const userwishlistData = await User.findOne({ _id: user_id });

                const eventwishlistDetailsObject = {
                    type,
                    postId: eventwishlistData._id,
                    description: eventwishlistData.eventdescription,
                    createddate: getHumanReadableDate(eventwishlistData.created_date),
                    location: eventwishlistData.event_location,
                    startdate: getHumanReadableDate(eventwishlistData.event_start_date),
                    starttime: formatTime(eventwishlistData.event_start_time),
                    user: userwishlistData ? {
                        _id: userwishlistData._id,
                        username: userwishlistData.fullname,
                        profile_image: baseImageUrlP + '/' + userwishlistData.profile_image
                    }:null,
                    templateimage: eventwishlisttemplateData ? {
                        _id: eventwishlisttemplateData._id,
                        templateimage: baseImageUrl + '/' + eventwishlisttemplateData.eventtemplate
                    }:null
                }
                allWishlists.push(eventwishlistDetailsObject);
            }
            else if (type === 'weekend')
            {
                const weekendwishlistData = await WeekendDetails.findOne({ _id: postId });
                const weekendwishlisttemplateId = weekendwishlistData.weakendtemplateid;
                const weekendwishlisttemplateData = await WeekendTemaplte.findOne({ _id: weekendwishlisttemplateId });
                const user_id = weekendwishlistData.user_id;
                const userwishlistData = await User.findOne({ _id: user_id });

                const weekendwishlistDetailsObject = {
                    type,
                    postId: weekendwishlistData._id,
                    description: weekendwishlistData.weakenddescription,
                    createddate: getHumanReadableDate(weekendwishlistData.created_date),
                    location: weekendwishlistData.weakend_location,
                    startdate: getHumanReadableDate(weekendwishlistData.weakend_start_date),
                    starttime: formatTime(weekendwishlistData.weakend_start_time),
                    user: userwishlistData ? {
                        _id: userwishlistData._id,
                        username: userwishlistData.fullname,
                        profile_image: baseImageUrlP + '/' + userwishlistData.profile_image
                    }:null,
                    templateimage: weekendwishlisttemplateData ? {
                        _id: weekendwishlisttemplateData._id,
                        templateimage: baseImageUrl + '/' + weekendwishlisttemplateData.weakendtemplate
                    }:null
                }
                allWishlists.push(weekendwishlistDetailsObject);
            }
            else if (type === 'tour')
            { 
                const tourwishlistData = await TourDetails.findOne({ _id: postId });
                const tourwishlisttemplateId = tourwishlistData.tourtemplateid;
                const tourwishlisttemplateData = await TourTemplate.findOne({ _id: tourwishlisttemplateId });
                const user_id = eventwishlistData.user_id;
                const userwishlistData = await User.findOne({ _id: user_id });

                const tourwishlistDetailsObject = {
                    type,
                    postId: tourwishlistData._id,
                    description: tourwishlistData.tourdescription,
                    createddate: getHumanReadableDate(tourwishlistData.created_date),
                    location: tourwishlistData.tour_location,
                    startdate: getHumanReadableDate(tourwishlistData.tour_start_date),
                    starttime: formatTime(tourwishlistData.tour_start_time),
                    user: userwishlistData ? {
                        _id: userwishlistData._id,
                        username: userwishlistData.fullname,
                        profile_image: baseImageUrlP + '/' + userwishlistData.profile_image
                    }:null,
                    templateimage: tourwishlisttemplateData ? {
                        _id: tourwishlisttemplateData._id,
                        templateimage: baseImageUrl + '/' + tourwishlisttemplateData.tourtemplate
                    }:null
                }
                allWishlists.push(tourwishlistDetailsObject);
            }
        }

        allWishlists.sort((a, b) => {
            const dateA = new Date(a.startdate + " " + a.starttime);
            const dateB = new Date(b.startdate + " " + b.starttime);
            return dateA - dateB;
        });

        res.status(200).json({
            success: true,
            message: 'Saved wishlist Details Retrieved Successfully',
            details: allWishlists
        });
    }
    catch(error)
    {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Internal Server Error'
        });
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
    savedpostDetails,
    saveWishlist,
    savedWishlistDetails
}