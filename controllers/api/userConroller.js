const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { ObjectId } = require('mongoose').Types;
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

function generateReferralCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

const insertuserData = async (req,res)=>
{
    const { fullname, mobile, email, password, confirmpassword, refered_referal_code } = req.body;
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
                user_bio:null,
                referal_code:generateReferralCode()
            });

            if (refered_referal_code) {
                const referringUser = await userRegister.findOne({ referal_code: refered_referal_code });
                if (referringUser) {
                    // Increase the referral points of the referring user
                    referringUser.referral_points += 1;
                    await referringUser.save();
                }
            }

            const savedUser = await newUser.save();
            const token = await create_token(savedUser._id);

            savedUser.token = token;
            await savedUser.save();

            const referralLink = `http://20.163.173.61/api/register?ref=${newUser.referal_code}`;


            const response = {
                success: true,
                msg: "User registered successfully",
                data: {
                    user: savedUser,
                    referralLink:referralLink
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
};

const fetchallUsers = async (req,res) =>
{
    try{
        const getallUser = await userRegister.find();

        const response = {
            success: true,
            msg: "User fetched successfully",
            data: getallUser
        }
        res.status(200).send(response);
    }
    catch(error)
    {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Error saving user data" });   
    }
};

const getreferalLink = async (req, res) => {
    const user_id = req.params.user_id;
    try {
        // Validate if the user_id is a valid ObjectId
        if (!ObjectId.isValid(user_id)) {
            console.log("Invalid user ID:", user_id);
            return res.status(400).json({ success: false, msg: 'Invalid user ID' });
        }

        // Convert user_id to ObjectId
        const userIdObject = new ObjectId(user_id);

        // Use userIdObject in the query
        const existedUserDetails = await userRegister.findOne({ _id: userIdObject });

        if (!existedUserDetails) {
            console.log("User not found for ID:", user_id);
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        const referal_code = existedUserDetails.referal_code;
        const referralLink = `http://20.163.173.61/api/register?ref=${referal_code}`;

        console.log("Referral Link:", referralLink);

        const response = {
            success: true,
            msg: "Referral link fetched successfully",
            referralLink: referralLink,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

const getprofile = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const existedUserDetails = await userRegister.findOne({ _id: user_id });
        const baseImageUrlP = "/uploads/profile_image";
        const baseImageUrlB = "/uploads/background_image";

        if (!existedUserDetails) {
            return res.status(404).json({ success: false, msg: 'User Details not found' });
        }

        const userexistedResult = {
            user_id: existedUserDetails._id,
            user_name: existedUserDetails.fullname,
            email: existedUserDetails.email, 
            user_bio:existedUserDetails.user_bio,
            profile_image:baseImageUrlP + '/' + existedUserDetails.profile_image,
            background_image:baseImageUrlB + '/' + existedUserDetails.background_image,
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
    const { user_id } = req.body;
    let { fullname, mobile, email, user_bio } = req.body;
    const baseImageUrlP = "/uploads/profile_image";
    const baseImageUrlB = "/uploads/background_image";

    try {
        // Check if req.files exists before attempting to destructure
        const { profile_image, background_image } = req.files || {};

        let updateFields = {};

        if (fullname) updateFields.fullname = fullname;
        if (mobile) updateFields.mobile = mobile;
        if (email) updateFields.email = email;
        if (user_bio) updateFields.user_bio = user_bio;
        if (profile_image && profile_image[0].filename) {
            updateFields.profile_image = baseImageUrlP + '/' + profile_image[0].filename;
        }
        if (background_image && background_image[0].filename) {
            updateFields.background_image = baseImageUrlB + '/' + background_image[0].filename;
        }

        const updatedRegister = await userRegister.findOneAndUpdate(
            { _id: user_id },
            { $set: updateFields },
            { new: true }
        );

        if (!updatedRegister) {
            return res.status(404).json({ success: false, msg: "User not found" });
        }

        return res.status(200).json({
            success: true,
            msg: "User updated successfully",
            data: updatedRegister 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: "Error updating user data",
            error: error.message
        });
    }
};

const user_login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const deviceToken = req.body.deviceToken;

        const userloginData = await userRegister.findOne({ email: email });
        if (userloginData) {
            const passwordMatch = await bcryptjs.compare(password, userloginData.password);
            if (passwordMatch) {
                
                const updateResult = await userRegister.updateOne({ email: email }, { deviceToken: deviceToken });

                const tokenData = await create_token(userloginData._id);
                const userResult = {
                    user_id: userloginData._id,
                    user_name: `${userloginData.fullname}`,
                    email: userloginData.email,
                    password: userloginData.password,
                    token: tokenData
                }
                const response = {
                    status: true,
                    msg: "User Details",
                    user_id: userResult.user_id,
                    user_name: userResult.user_name,
                    email: userResult.email,
                    token: userResult.token,
                    deviceToken: deviceToken
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
};

module.exports = {
    insertuserData,
    user_login,
    getprofile,
    updateprofileById,
    getreferalLink,
    fetchallUsers
}