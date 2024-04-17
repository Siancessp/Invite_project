const express = require('express');
const hbs  = require('hbs');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const adminLogin = require('../models/adminloginModels');
const Register = require("../models/adminregisterModels");

const login = async (req, res) => {
    try {
        res.render('login'); // Make sure you have a 'login.hbs' file in your 'views' directory
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const create_token = async (id) => {
    try {
        const token = await jwt.sign({ _id: id }, config.secret_jwt);
        return token;
    } catch (error) {
        throw new Error(error.message);
    }
}

const verifylogin = async (req,res) => {
        try{
                const email = req.body.email;
                const password = req.body.password;

                const userloginData = await Register.findOne({ email: email });
                if (userloginData) {
                    const passwordMatch = await bcryptjs.compare(password, userloginData.password);
                    if (passwordMatch) {
                        const tokenDta = await create_token(userloginData._id);
                        const userResult = {
                            _id: userloginData._id,
                            user_name: `${userloginData.firstname} ${userloginData.lastname}`,
                            email: userloginData.email,
                            password: userloginData.password,
                            token: tokenDta
                        }
                        res.render('dashboard');
                    } else {
                        res.status(200).send({ success: false, msg: "Password incorrect" });
                    }
                } else {
                    res.status(200).send({ success: false, msg: "Login details are incorrect" });
                }
        }
        catch(error)
        {
            console.log(error.message);
        }
}


module.exports = {
    login,
    verifylogin
}
