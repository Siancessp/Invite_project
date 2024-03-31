const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const userRegister = require("../../models/api/userregisterModel");

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

const insertuserData = async (req,res)=>
{
    const { fullname, mobile, email, password, confirmpassword } = req.body;
    try{
        const existingUser = await userRegister.findOne({ email: email });
        if (existingUser) {
            return res.status(400).send({ success: false, msg: "Email already exists" });
        }

        const existingUserMobile = await userRegister.findOne({ mobile: mobile });
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
            const newUser = new userRegister({
                fullname: fullname,
                mobile: mobile,
                email: email,
                password: spassword,
                confirmpassword: sconfirmpassword,
                created_date : createddate,
                profile_image: null,
                background_image:null,
                user_bio:null
            });

            const savedUser = await newUser.save();
            const token = await create_token(savedUser._id);

            const response = {
                success: true,
                msg: "User registered successfully",
                data: {
                    user: savedUser,
                    token: token
                }
            }
            res.status(200).send(response);
        } else {
            return res.status(400).send({ success: false, msg: "Passwords do not match" });
        }

    }
    catch(error)
    {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Error saving user data" });
    }
}

const getprofile = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const existedUserDetails = await userRegister.findOne({ _id: user_id });

        if (!existedUserDetails) {
            return res.status(404).json({ success: false, msg: 'User Details not found' });
        }

        const userexistedResult = {
            user_id: existedUserDetails._id,
            user_name: existedUserDetails.fullname,
            email: existedUserDetails.email, 
            user_bio:existedUserDetails.user_bio,
            profile_image:existedUserDetails.profile_image,
            background_image:existedUserDetails.background_image,
            mobile:existedUserDetails.mobile
        };

        const userresponse = {
            status: true,
            msg: "Existing User Details",
            data: userexistedResult
        };

        return res.status(200).json(userresponse);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

const updateprofileById = async (req, res) => {
    const { fullname, mobile, email, user_bio, user_id } = req.body;

    try {
        // Update fields in Register collection
        const updateFields = { fullname, mobile, email, user_bio };

        // Use multer middleware for profile_image and background_image uploads
        upload.fields([
            { name: 'profile_image', maxCount: 1 },
            { name: 'background_image', maxCount: 1 }
        ])(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred
                return res.status(400).json({ success: false, msg: "File upload error" });
            } else if (err) {
                // An unknown error occurred
                return res.status(500).json({ success: false, msg: "Unknown error" });
            }

            // Update profile_image and background_image fields if files were uploaded
            if (req.files && req.files['profile_image']) {
                updateFields.profile_image = req.files['profile_image'][0].filename;
            }
            if (req.files && req.files['background_image']) {
                updateFields.background_image = req.files['background_image'][0].filename;
            }

            // Perform the update in the Register collection
            const updatedRegister = await userRegister.findOneAndUpdate(
                { _id: user_id },
                { $set: updateFields },
                { new: true }
            );

            if (!updatedRegister) {
                return res.status(404).json({ success: false, msg: "User not found" });
            }

            const response = {
                success: true,
                msg: "User updated successfully",
                data: {
                    updatedRegister
                }
            };
            res.status(200).send(response);
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Error updating user data", error: error.message });
    }
};




const user_login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userloginData = await userRegister.findOne({ email: email });
        if (userloginData) {
            const passwordMatch = await bcryptjs.compare(password, userloginData.password);
            if (passwordMatch) {
                const tokenDta = await create_token(userloginData._id);
                const userResult = {
                    user_id: userloginData._id,
                    user_name: `${userloginData.fullname}`,
                    email: userloginData.email,
                    password: userloginData.password,
                    token: tokenDta
                }
                const response = {
                    status: true,
                    msg: "User Details",
                    user_id: userResult.user_id,
                    user_name: userResult.user_name,
                    email: userResult.email,
                    token: userResult.token
                }
                res.status(200).send(response);
            } else {
                res.status(200).send({ success: false, msg: "Password incorrect" });
            }
        } else {
            res.status(200).send({ success: false, msg: "Login details are incorrect" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, msg: "Internal Server Error" });
    }
}

module.exports = {
    insertuserData,
    user_login,
    getprofile,
    updateprofileById
}