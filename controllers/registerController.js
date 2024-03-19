const express = require('express');
const hbs  = require('hbs');
const app = express();
const bcryptjs = require('bcryptjs');

const Register = require("../models/adminregisterModels");

const securePassword = async (password) => {
    try {
        const passwordHash = await bcryptjs.hash(password, 10); // You need to specify the salt rounds
        return passwordHash;
    } catch (error) {
        throw new Error(error.message);
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

const insertuser = async (req, res) => {
    const { roleid, fullname, mobileno, email, password, status, confirmpassword } = req.body;
    try {
        const existingUser = await Register.findOne({ email: email });
        if (existingUser) {
            return res.status(400).send({ success: false, msg: "Email already exists" });
        }

        const existingUserMobile = await Register.findOne({ mobileno: mobileno });
        if (existingUserMobile) {
            return res.status(400).send({ success: false, msg: "Mobile Number already exists" });
        }

        if (password !== confirmpassword) {
            return res.status(400).send({ success: false, msg: "Both Password and Confirm Password are not Same" });
        }

        const createddate = new Date();
        const spassword = await securePassword(password);
        const sconfirmpassword = await securePassword(confirmpassword);

        if (password === confirmpassword) {
            const newUser = new Register({
                fullname: fullname,
                roleid: 2,
                email: email,
                mobileno: mobileno,
                status: 1,
                password: spassword,
                confirmpassword: sconfirmpassword,
                created_date: createddate
            });

            const savedUser = await newUser.save();

            // Create JWT token for the newly registered user
            const token = await create_token(savedUser._id);
            console.log("Generated Token:", token); // Log the generated token

            const response = {
                success: true,
                msg: "User registered successfully",
                data: {
                    user: savedUser,
                    token: token // Include the token in the response
                }
            }
            res.status(200).send(response);
        } else {
            return res.status(400).send({ success: false, msg: "Passwords do not match" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Error saving user data" });
    }
}



module.exports = {
    insertuser
}