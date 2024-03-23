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
        res.render('addtourcategory');
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
        const newTour = new weakEnd({
            tourcategoryid: tourcategoryid,
            tourtemplate: req.file.filename
        });

        const savedTour = await newTour.save();
        if (savedTour) {
            // Fetch the updated list of categories after saving
            const tourcategories = await fetchtourCategories();
            res.render('addtourcategory', { message: "Your tour has been created successfully!", tourcategories });
        } else {
            res.render('addtourcategory', { message: "Failed to create event!" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    tourcategory,
    fetchtourCategories,
    addtourcategory,
    inserttourcategorydata
}