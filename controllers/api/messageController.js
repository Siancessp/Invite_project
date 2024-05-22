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
    const { userId, chatId, text } = req.body;//Get the id who we want to send message
    const userData = req.user;
    console.log("User data:", userData);//Get the id the person who log in
    let userIds = [userData._id, userId];
    console.log('+++++++++');
    try
    {
        const newMessage = await Message.create(
            {
                chatId,
                text,
                user: userData._id
            }
        );
        
        await Chat.findByIdAndUpdate(chatId,{
            latestMessage: text
        },{
            new: true
        });
        res.send({
            data: newMessage, 
            
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
                path: "user",
                select: "fullname"
            }
        );

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
