const express = require('express');
const hbs  = require('hbs');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const Event = require("../models/addeventcategoryModels");
const Category = require("../models/addcategoryModel");
const EventDetails = require("../models/api/eventModel");

const fetchCategories = async () => {
    try {
        const existingCategories = await Category.find({}, '_id categoryname');
        return existingCategories.map(category => ({
            _id: category._id,
            categoryname: category.categoryname
        }));
    } catch (error) {
        throw new Error(error.message);
    }
}

const addeventcategory = async (req, res) => {
    try {
        const categories = await fetchCategories();
        res.render('addeventcategory', { categories });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const inserteventcategory = async (req, res) => {
    try {
        // Extract category id from request body
        const { categoryid } = req.body;

        // // Extract token from request headers
        // const token = req.body.token || req.query.token || req.headers["authorization"];
        // console.log(token);

        // // Verify token and attach user info to request
        // jwt.verify(token, config.secret_jwt, async (err, decoded) => {
        //     if (err) {
        //         return res.status(403).json({ success: false, message: "Failed to authenticate token" });
        //     }

            // Token is valid, proceed with inserting event category
            const newEvent = new Event({
                categoryid: categoryid,
                eventtemplate: req.file.filename
            });

            const savedEvent = await newEvent.save();
            if (savedEvent) {
                const categories = await fetchCategories();
                res.render('addeventcategory', { message: "Your event has been created successfully!", categories });
            } else {
                res.render('addeventcategory', { message: "Failed to create event!" });
            }
        // });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}


// const inserteventcategory = async (req, res) => {
//     const { categoryid } = req.body;

//     try {
        
//         const newEvent = new Event({
//             categoryid: categoryid,
//             eventtemplate: req.file.filename
//         });

//         const savedEvent = await newEvent.save();
//         if (savedEvent) {
//             const categories = await fetchCategories();
//             res.render('addeventcategory', { message: "Your event has been created successfully!", categories });
//         } else {
//             res.render('addeventcategory', { message: "Failed to create event!" });
//         }
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send('Internal Server Error');
//     }
// }

//This is for admin panel to display the list of the event
const getallevent = async (req, res) => {
    try {
        const existedeventDetails = await EventDetails.find();
        if (!existedeventDetails || existedeventDetails.length === 0) {
            return res.status(404).json({ success: false, msg: 'Event Details not found' });
        }
         res.render('eventlist', { existedeventDetails });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const geteventbyUserid = async (req,res) =>
{
    try
    {
        const user_id = req.params.user_id;
        const usercreatedeventDetails = await EventDetails.find({ user_id: user_id });
        
        if (!usercreatedeventDetails) {
            return res.status(404).json({ success: false, msg: 'Event Details not found' });
        }
         res.render('userseventlist', { usercreatedeventDetails });
    }
    catch(error)
    {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    addeventcategory,
    inserteventcategory,
    getallevent,
    fetchCategories,
    geteventbyUserid
}