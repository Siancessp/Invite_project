const express = require('express');
const app = express();
const mongoose = require("mongoose");
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const Message = require("../../models/api/messageModel");
const Chat = require("../../models/api/chatModel");

const userRegister = require("../../models/api/userregisterModel");

const sendMessage = async (req, res) =>
{
    const { chatId, text } = req.body;//Get the id who we want to send message
    const userId = req.user.userId;
    try
    {
        const newMessage = await Message.create(
            {
                chatId,
                text,
                user: userId
            }
        );
        
       const chatUpdate = await Chat.findByIdAndUpdate(chatId,{
            latestMessage: text
        },{
            new: true
        }).populate({
            path:"users",
            select:"fullname",
            match:{_id: { $ne: userId }}
        });
        res.send({
            data: newMessage,
            roomData: chatUpdate,
            status: true
        });
    }
    catch(error)
    {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const myMessages = async (req, res) => {
    const chatId  = req.params.chatId;

    try {
        const Messages = await Message.find({
            chatId: chatId
        }).populate(
            {
                path: "users",
                select : "fullname" //The person who login
            }
        ).sort({ createdAt: -1 });

            return res.send({
                data: Messages,
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
    sendMessage,
    myMessages
}