const express = require('express');
const app = express();
const mongoose = require('mongoose');
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
        const { resturantname, mobileno, address, user_id, resturantdescription, todays_offer, offer_start_date, offer_start_time, offer_end_date, offer_end_time } = req.body;
        const menu = req.body.menu || [];
        const price = req.body.price || [];

        const menuWithIds = menu.map((menuItem, index) => {
            return {
                _id: new mongoose.Types.ObjectId(), // Use mongoose.Types.ObjectId to generate ObjectId
                menu: menuItem,
                price: price[index] || 0
            };
        });

        const newResturantDetails = new Resturant(
            {
                user_id: user_id,
                resturantname: resturantname,
                resturantlogo: resturantlogo,
                mobileno: mobileno,
                address: address,
                menu: menuWithIds,
                todays_offer: todays_offer,
                offer_start_date: offer_start_date,
                offer_start_time: offer_start_time,
                offer_end_date: offer_end_date,
                offer_end_time: offer_end_time,
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

const getresturantdetails = async (req, res) => {
    try {
        const existingResturantdetails = await Resturant.find({});
        
        if (!existingResturantdetails || existingResturantdetails.length === 0) {
            return res.status(404).json({ success: false, msg: 'Restaurant details not found' });
        }

        const today = new Date();

        let resturantDetailsWithUser = [];
        for (let i = 0; i < existingResturantdetails.length; i++) {
            const resturantDetails = existingResturantdetails[i];

            const resturantDetailWithUser = {
                resturant_id: resturantDetails._id,
                user_id: resturantDetails.user_id,
                resturantname: resturantDetails.resturantname,
                resturantdescription: resturantDetails.resturantdescription,
                mobileno: resturantDetails.mobileno,
                address: resturantDetails.address,
                menu: resturantDetails.menu,
                offer_start_date: resturantDetails.offer_start_date,
                offer_start_time: resturantDetails.offer_start_time,
                offer_end_time: resturantDetails.offer_end_time,
                offer_end_date: resturantDetails.offer_end_date
            };

            if (today >= new Date(resturantDetails.offer_start_date) && today <= new Date(resturantDetails.offer_end_date)) {
                resturantDetailWithUser.todays_offer = resturantDetails.todays_offer;
            }
            else {
                resturantDetailWithUser.todays_offer = "Get you soon with exciting offers....";
            }

            resturantDetailsWithUser.push(resturantDetailWithUser);
        }

        const response = {
            success: true,
            msg: "Successfully fetched restaurant details",
            data: resturantDetailsWithUser
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Internal Server Error!" });
    }
};

const updateofferbyreturantId = async (req,res) =>
{
    try{
        const resturant_id = req.body.resturant_id;
        const { todays_offer, offer_start_date, offer_start_time, offer_end_time, offer_end_date } = req.body;
        const updatingofferDetails = await Resturant.findOne({ _id : resturant_id});

        if (!updatingofferDetails) {
            return res.status(404).json({ success: false, msg: 'Restaurant details not found' });
        }

        if(!todays_offer || !offer_start_date || !offer_start_time || !offer_end_time || !offer_end_date)
        {
            return res.status(400).json({ success: false, msg: 'Missing mandatory fields' });
        }
        else
        {
            updatingofferDetails.todays_offer = todays_offer;
            updatingofferDetails.offer_start_date = offer_start_date;
            updatingofferDetails.offer_start_time = offer_start_time;
            updatingofferDetails.offer_end_time = offer_end_time;
            updatingofferDetails.offer_end_date = offer_end_date;

            await updatingofferDetails.save();
        }
        return res.status(200).json({ success: true, msg: 'Offer details updated successfully', data: updatingofferDetails });
    }
    catch(error)
    {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Internal Server Errorr!"});
    }   
};

const updatemenubyresturantId = async (req, res) => {
    try {
        const { resturant_id, menu_id, newMenuName, newPrice } = req.body;
        const updatingmenuDetails = await Resturant.findOne({ _id: resturant_id });

        if (!updatingmenuDetails) {
            return res.status(404).json({ success: false, msg: 'Restaurant details not found' });   
        }

        const menuItemToUpdate = updatingmenuDetails.menu.find(menuItem => String(menuItem._id) === String(menu_id));

        if(!menuItemToUpdate)
        {
            return res.status(404).json({ success: false, msg: "Menu item not found"});
        }

        if(newMenuName)
        {
            menuItemToUpdate.menu = newMenuName;
        }
        if(newPrice)
        {
            menuItemToUpdate.price = newPrice;
        }

        await updatingmenuDetails.save();

        return res.status(200).json({ success: true, msg: 'Menu item updated successfully', data: updatingmenuDetails });
    } catch(error) {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Internal Server Error!"});
    }
};


module.exports = {
    addresturantDetails,
    getresturantdetails,
    updateofferbyreturantId,
    updatemenubyresturantId
}