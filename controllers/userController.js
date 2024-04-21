const express = require('express');
const hbs  = require('hbs');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const userRegister = require("../models/api/userregisterModel");

const User = async (req, res) => {
    try {
        res.render('userlist');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const getallUsers = async (req, res) => {
    try {
        const existedUserDetails = await userRegister.find();
        if (!existedUserDetails || existedUserDetails.length === 0) {
            return res.status(404).json({ success: false, msg: 'User Details not found' });
        }
        res.render('userlist', { existedUserDetails });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const inactiveuser = async (req, res) => {
    try {
        const user_id = req.params.user_id;

        const updatedUser = await userRegister.findByIdAndUpdate(user_id, { status: 0 }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const existedUserDetails = await userRegister.find(); // Fetch updated user details
        res.render('userlist', { existedUserDetails });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const activeuser = async (req, res) => {
    try {
        const user_id = req.params.user_id;

        const updatedUser = await userRegister.findByIdAndUpdate(user_id, { status: 1 }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const existedUserDetails = await userRegister.find(); // Fetch updated user details
        res.render('userlist', { existedUserDetails });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    User,
    getallUsers,
    inactiveuser,
    activeuser
}