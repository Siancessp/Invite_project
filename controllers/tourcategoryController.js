const express = require('express');
const hbs  = require('hbs');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const TourCategory = require("../models/tourcategoryModel");
const Tour = require("../models/addtourcategoryModel");

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

const fetchTourCategories = async () => {
    try {
        const existingTourCategories = await Tour.find({}, '_id tourcategoryname');
        const formattedCategories = existingTourCategories.map(tourcategory => ({
            _id: tourcategory._id,
            tourcategoryname: tourcategory.tourcategoryname
        }));
        return formattedCategories;
    } catch (error) {
        throw new Error("Error fetching tour categories:", error.message);
    }
};

const addTourCategory = async (req, res) => {
    try {
        const tourcategories = await fetchTourCategories();
        res.render('addtourcategory', { tourcategories });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const insertTourCategoryData = async (req, res) => {
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
            const tourcategories = await fetchTourCategories();
            return res.render('addtourcategory', { message: "Your tour has been created successfully!", tourcategories });
        } else {
            return res.render('addtourcategory', { message: "Failed to create tour!" });
        }
    } catch (error) {
        console.error(error); // Log the full error for debugging
        return res.status(500).send('Internal Server Error');
    }
};


module.exports = {
    tourcategory,
    fetchTourCategories,
    inserttourcategory,
    addTourCategory,
    insertTourCategoryData
}