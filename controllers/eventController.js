const express = require('express');
const hbs  = require('hbs');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const Event = require("../models/addeventcategoryModels");
const Category = require("../models/addcategoryModel");
const EventDetails = require("../models/api/eventModel");
const BookingDetails = require("../models/api/bookingModel");

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

const geteventbyUserid = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        console.log("User ID:", user_id); // Check the value of user_id
        
        const usercreatedeventDetails = await EventDetails.find({ user_id: user_id });
        console.log("User created event details:", usercreatedeventDetails); // Check the value of usercreatedeventDetails
        
        if (usercreatedeventDetails.length === 0) {
            const previousPage = req.headers.referer || '/';
            console.log("Redirecting to:", previousPage); // Check the value of previousPage
            return res.redirect(previousPage);
        }
        
        const eventIds = usercreatedeventDetails.map(event => event._id);
        console.log("Event IDs:", eventIds); // Check the value of eventIds

        const bookingDetails = await BookingDetails.find({ bookedevent_id: { $in: eventIds } });
        console.log("Booking details:", bookingDetails); // Check the value of bookingDetails
        
        // Initialize an object to store the total grand total price for each event ID
        const eventTotalPrices = {};

        // Loop through the booking details and sum up the grand total prices for each event ID
        bookingDetails.forEach(booking => {
            const eventId = booking.bookedevent_id.toString(); // Convert ObjectId to string
            const grandTotalPrice = parseFloat(booking.grandtotalprice) || 0; // Parse and get grand total price
            eventTotalPrices[eventId] = (eventTotalPrices[eventId] || 0) + grandTotalPrice;
        });
        console.log("Event total prices:", eventTotalPrices); // Check the value of eventTotalPrices

        // Loop through the usercreatedeventDetails and add the total grand total price for each event
        usercreatedeventDetails.forEach(event => {
            const eventId = event._id.toString(); // Convert ObjectId to string
            event.grandTotalPrice = eventTotalPrices[eventId] || 0; // Add the total grand total price to the event details
        });
        console.log("User created event details with grand total prices:", usercreatedeventDetails); // Check the value of usercreatedeventDetails with grand total prices
        
        // Render the 'userseventlist' view with the updated usercreatedeventDetails array
        res.render('userseventlist', { usercreatedeventDetails });
    } catch(error) {
        console.error(error.message);
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