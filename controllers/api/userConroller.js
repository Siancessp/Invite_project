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

function generateReferralCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const insertuserData = async (req, res) => {
    const { fullname, mobile, email, password, confirmPassword } = req.body;
    try {
        // Check if the user already exists with the given email
        const existingUser = await userRegister.findOne({ email: email });
        if (existingUser) {
            return res.status(400).send({ success: false, msg: "Email already exists" });
        }

        // Check if the user already exists with the given mobile number
        const existingUserMobile = await userRegister.findOne({ mobile: mobile });
        if (existingUserMobile) {
            return res.status(400).send({ success: false, msg: "Mobile Number already exists" });
        }

        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return res.status(400).send({ success: false, msg: "Both Password and Confirm Password are not the same" });
        }

        // Hash the password using your securePassword function
        const hashedPassword = await securePassword(password);

        // Generate a referral code for the new user
        const referralCode = generateReferralCode();

        // Create a new user object with the provided data
        const newUser = new userRegister({
            fullname: fullname,
            mobile: mobile,
            email: email,
            password: hashedPassword,
            confirmpassword: hashedPassword, // Not sure if you need to hash this too, adjust if needed
            created_date: new Date(),
            profile_image: null,
            background_image: null,
            user_bio: null,
            referal_code: referralCode
        });

        // Save the new user to the database
        const savedUser = await newUser.save();

        // Create a token for the new user
        const token = await createToken(savedUser._id);

        // Construct the referral link with the generated referral code
        const referralLink = `http://20.163.173.61/api/register?ref=${referralCode}`;

        // Send success response with user data, referral link, and token
        const response = {
            success: true,
            msg: "User registered successfully",
            data: {
                user: savedUser,
                referralLink: referralLink,
                token: token
            }
        };

        res.status(200).send(response);
    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error saving user data:", error);
        return res.status(500).send({ success: false, msg: "Error saving user data" });
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

    const { profile_image, background_image } = req.files;

    try {
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