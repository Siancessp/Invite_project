const express = require('express');
const hbs  = require('hbs');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const TourCategory = require("../models/tourcategoryModel");
const Tour = require("../models/addtourcategoryModel");
const TourDetails = require("../models/api/tourModel");

const tourcategory = async (req, res) => {
    try {
        res.render('addtourname');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const inserttourcategory = async (req, res) => {
    const { tourcategoryname } = req.body;
    try {
        const newtourCategory = new TourCategory({
            tourcategoryname: tourcategoryname,
        });
        const savetourCategory = await newtourCategory.save();
        const response = {
            success: true,
            msg: "Tour Category added Successfully!",
            data: savetourCategory
        }
        res.status(200).send(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const fetchtourCategories = async (req, res) => {
    try {
        const existingtourCategories = await TourCategory.find({}, '_id tourcategoryname');
        const formattedCategories = existingtourCategories.map(tourcategory => ({
            _id: tourcategory._id,
            tourcategoryname: tourcategory.tourcategoryname
        }));
        return formattedCategories;
    } catch (error) {
        console.error("Error fetching tour categories:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

const addtourcategory = async (req, res) => {
    try {
        const tourcategories = await fetchtourCategories();
        res.render('addtourcategory', { tourcategories });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const inserttourcategorydata = async (req, res) => {
    const { tourcategoryid } = req.body;

    try {
        if (!tourcategoryid) {
            return res.status(400).json({ success: false, message: 'Tour Category ID is required' });
        }

        if (!req.file || !req.file.filename) {
            return res.status(400).json({ success: false, message: 'Tour template file is required' });
        }

        const newTour = new Tour({
            tourcategoryid: tourcategoryid,
            tourtemplate: req.file.filename
        });

        const savedTour = await newTour.save();
        
        if (savedTour) {
            // Fetch the updated list of categories after saving
            const tourcategories = await fetchtourCategories();
            return res.render('addtourcategory', { message: "Your tour has been created successfully!", tourcategories });
        } else {
            return res.render('addtourcategory', { message: "Failed to create event!" });
        }
    } catch (error) {
        console.error(error); // Log the full error for debugging
        return res.status(500).send('Internal Server Error');
    }
};

const getalltourDetails = async (req, res) => {
    try {
        const existedtourDetails = await TourDetails.find();
        if (!existedtourDetails || existedtourDetails.length === 0) {
            return res.status(404).json({ success: false, msg: 'Tour Details not found' });
        }
         res.render('tourlist', { existedtourDetails });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const gettourbyUserid = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const usercreatedtourDetails = await TourDetails.find({ user_id: user_id });
        
        if (usercreatedtourDetails.length === 0) {
            const previousPage = req.headers.referer || '/';
            return res.redirect(previousPage);
        }
        
        res.render('usertourlist', { usercreatedtourDetails });
    } catch(error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    tourcategory,
    fetchtourCategories,
    inserttourcategory,
    addtourcategory,
    inserttourcategorydata,
    getalltourDetails,
    gettourbyUserid
}