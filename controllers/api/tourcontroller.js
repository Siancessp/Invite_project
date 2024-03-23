const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const tourCategory = require("../../models/tourcategoryModel");
const Tour = require("../../models/addtourcategoryModel");
const TourDetails = require("../../models/api/tourModel");
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

const getweakendcategory = async (req,res) => {
    try {
        const existingtourCategories = await tourCategory.find({}, '_id tourcategoryname');
        const formattedCategories = existingtourCategories.map(tour => ({
            _id: tour._id,
            tourcategoryname: tour.tourcategoryname
        }));
        res.status(200).json(formattedCategories);
    } catch (error) {
        throw error; // Simply throw the caught error
    }
};

const tourtemplate = async (req,res)=>
{
    try{
        const baseImageUrl = "/uploads/event_template";
        const existingTour = await Tour.find({});

        const tourWithUrls = existingTour.map(tour => {
            const tourWithUrls = {
                _id: tour._id,
                tourcategoryid: tour.tourcategoryid,
                tourtemplate: baseImageUrl + '/' + tour.tourtemplate,
                __v: tour.__v
            };
            return tourWithUrls;
        });

        const response = {
            success: true,
            msg: "Tour Fetch Successfully!",
            data: tourWithUrls
        };

        res.status(200).send(response);
    }
    catch(error)
    {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Error saving user data" });
    }
}

//After choose a template we have to store data
const addweakendDetails = async (req,res)=>
{
    try {
        const tourtemplateid = req.body.tourtemplateid;
        const { tourdescription, tour_id, tour_start_date, tour_end_date, tour_start_time, tour_end_time, tour_location, tour_price_adult,tour_price_child, user_id } = req.body;
        const baseImageUrl = "/uploads/event_template";
        const existingWeakendtemplate = await weakEnd.findOne({ _id: weakendtemplateid });

        if (!existingWeakendtemplate) {
            return res.status(404).json({ success: false, msg: 'Weakend not found' });
        }

        const newWeakendDetails = new WeakendDetails({
            user_id: user_id,
            weakendtemplateid: weakendtemplateid,
            weakenddescription: weakenddescription,
            weakendid: weakendid,
            weakend_start_date: weakend_start_date,
            weakend_end_date: weakend_end_date,
            weakend_start_time: weakend_start_time,
            weakend_end_time: weakend_end_time,
            weakend_location: weakend_location,
            weakend_price_adult: weakend_price_adult,
            weakend_price_child: weakend_price_child
        });

        const savedWeakendDetails = await newWeakendDetails.save();
        const response = {
            success: true,
            msg: "Weakend added Successfully!",
            data: savedWeakendDetails
        }
        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Internal Server Error" });
    }
}

