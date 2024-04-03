const express = require('express');
const hbs  = require('hbs');
const app = express();
const bcryptjs = require('bcryptjs');

const userRegister = require("../../models/api/userregisterModel");

const User = async (req, res) => {
    try {
        res.render('userlist'); // Make sure you have a 'login.hbs' file in your 'views' directory
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    User
}