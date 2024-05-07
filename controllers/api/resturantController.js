const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require("../../config/config");
const firebase = require('../../firebase');

const Resturant = require('../../models/api/resturantModel');
const userRegister = require("../../models/api/userregisterModel");

const securePassword = async (password) =>
{
    try{
        const passwordHash = await bcryptjs.hash(password,10);
        return passwordHash;
    }
    catch(error)
    {
        throw new Error(error.message);
    }   
}

const create_token = async (id) =>
{
    try
    {
        const token = await jwt.sign({ _id: id }, config.secret_jwt);
        return token;
    }
    catch(error)
    {
        throw new Error(error.message);
    }
}

const addresturantDetails = async (req,res) =>
{
    try{
        const { resturantlogo } = req.file || {};
        const { resturantname, mobileno, address, user_id, resturantdescription, todays_offer } = req.body;
        const menu = req.body.menu || [];
        const price = req.body.price || [];

        const newResturantDetails = new Resturant(
            {
                user_id: user_id,
                resturantname: resturantname,
                resturantlogo: resturantlogo,
                mobileno: mobileno,
                address: address,
                menu: menu,
                price: price,
                todays_offer: todays_offer,
                resturantdescription: resturantdescription
            },

        );

        const saveResturantDetails = await newResturantDetails.save();
        const allUsers = await userRegister.find();

        const usersWithTokens = allUsers.filter(user => user.deviceToken);

        if(usersWithTokens.length === 0)
        {
            return res.status(400).json({ success: false, msg: 'No users with device tokens available' });
        }

        const deviceTokens = usersWithTokens.map(user => user.deviceToken);

        const message = {
            notification:
            {
                title: 'New Resturant Added!',
                body: 'Check out the latest resturant details.'
            },
            tokens: deviceTokens
        };

        const responses = await firebase.messaging().sendMulticast(message);

        console.log('Successfully sent notification:', responses);

        const response =
        {
            success: true,
            msg: "Resturant added Successfully!",
            data: saveResturantDetails
        }
        res.status(200).send(response);
    }
    catch(error)
    {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Internal Server Error!"});
    }
};

const getresturantdetails = async (req,res) =>
{
    try
    {
        const existingResturantdetails = await Resturant.find({});
        if (!existingResturantdetails) {
            return res.status(404).json({ success: false, msg: 'Event Details not found' });
        }

        let resturantDetailsWithUser = [];
        for(let i = 0; i < existingResturantdetails.length; i++)
        {
            const resturantDetails = existingResturantdetails[i];
            
            const resturantDetailWithUser = {
                resturant_id: resturantDetails._id,
                resturantlogo: resturantDetails.resturantlogo,
                resturantname: resturantDetails.resturantname,
                resturantdescription: resturantDetails.resturantdescription,
                mobileno: resturantDetails.mobileno,
                address: resturantDetails.address,
                menu: resturantDetails.menu,
                price: resturantDetails.price,
                todays_offer: resturantDetails.todays_offer
            };
            resturantDetailsWithUser.push(resturantDetailWithUser);
        }

        const response = {
            success: true,
            msg: "Successfully fetched event details with users",
            data: resturantDetailsWithUser
        };

        res.status(200).json(response);
    }
    catch(error)
    {
        console.error(error);
        return res.status(500).send( { success: false, msg: "Internal Server Error!"});
    }  
};

module.exports = {
    addresturantDetails,
    getresturantdetails
}