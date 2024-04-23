const express = require('express');
const app = express();
const mongoose = require("mongoose");
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const Chat = require("../../models/api/chatModel");

const userRegister = require("../../models/api/userregisterModel");

const createprivateChat = async (req, res) => {
    const { userId } = req.body;//With whome we want to create the chat
    const userData = req.user;
    console.log("User data:", userData);

    let userIds = [userData._id, userId];
    console.log(userIds);
    try {
        
        const chat = await Chat.findOne({ 
            users: { $all: userIds },//Indecate the ids who involve in the chat process
            type: "private",
        });

        if(chat)
        {
            res.send({
                data: chat,
                status: true
            });
            
        }
        else {
            const newChat = await Chat.create({
                users: userIds,
            });
    
            res.send({
                data: newChat,
                status: true
            });
        }
       
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const creategroupChat = async (req, res) => {
    const { userIds, chatName } = req.body;

    const userData = req.user;

    try {
        let allUsers = userIds;
        allUsers.push(userData._id);

        const chat = await Chat.findOne({ 
            users: { $all: allUsers },
            type: "group",
        });

        if(chat) {
            return res.send({
                data: chat,
                status: true
            });
        } else {
            const newChat = await Chat.create({
                users: allUsers,
                chatName: chatName,
                type: "group",
                groupAdmin: userData._id
            });
            return res.send({
                data: newChat,
                status: true
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

function formatDate(date) {
    if (!date) return null;

    const now = new Date();  
    const diffInMs = Math.abs(now - new Date(date));
    const diffInHours = diffInMs / (1000 * 60 * 60); // Convert milliseconds to hours

    if (diffInHours >= 24) {
        return new Date(date).toLocaleDateString('en-GB'); // Display date if more than 24 hours
    } else {
        return new Date(date).toLocaleTimeString('en-US', { hourCycle: 'h12', hour: 'numeric', minute: 'numeric' }).toLowerCase(); // Display time in 12-hour format without seconds, with lowercase AM/PM
    }
};

const myChats = async (req, res) => {
    const userId  = req.params.user_id;

    try {
        const Chats = await Chat.find({
            users: userId
        }).populate({
            path: "users",
            select: "fullname",//The person with whome i have created the chat
            match: { _id: { $ne: userId}}
        });
        const formattedChats = Chats.map(chat => {
            return {
                ...chat.toJSON(),
                createdAt: formatDate(chat.createdAt),
                updatedAt: formatDate(chat.updatedAt)
            };
        });
            return res.send({
                data: formattedChats,
                status: true
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports =
{
    createprivateChat,
    creategroupChat,
    myChats
};