const express = require('express');
const hbs  = require('hbs');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const weakendCategory = require("../models/wekendcategoryModel");
const weakEnd = require("../models/addweakendcategoryModel");


const wekendcategory = async (req, res) => {
    try {
        res.render('addweakendcategory');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const insertweakendcategory = async (req, res) => {
    const { weakendcategoryname } = req.body;
    try {
        const newwaekendCategory = new weakendCategory({
            weakendcategoryname: weakendcategoryname,
        });
        const saveweakendCategory = await newwaekendCategory.save();
        const response = {
            success: true,
            msg: "Weekend Category added Successfully!",
            data: saveweakendCategory
        }
        res.status(200).send(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const fetchweakendCategories = async (req, res) => {
    try {
        const existingWeakendCategories = await weakendCategory.find({}, '_id weakendcategoryname');
        const formattedCategories = existingWeakendCategories.map(weakendcategory => ({
            _id: weakendcategory._id,
            weakendcategoryname: weakendcategory.weakendcategoryname
        }));
        res.status(200).json(formattedCategories);
    } catch (error) {
        console.error("Error fetching weakend categories:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

const addweakendcategory = async (req, res) => {
    try {
        const weakendcategories = await fetchweakendCategories();
        res.render('addweakendcategory', { weakendcategories });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}


const insertweakendcategorydata = async (req, res) => {
    const { weakendcategoryid } = req.body;

    try {
        const newWeakend = new weakEnd({
            weakendcategoryid: weakendcategoryid,
            weakendtemplate: req.file.filename
        });

        const savedWeakend = await newWeakend.save();
        if (savedWeakend) {
            const weakendcategories = await fetchweakendCategories();
            res.render('addeventcategory', { message: "Your event has been created successfully!", weakendcategories });
        } else {
            res.render('addeventcategory', { message: "Failed to create event!" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}



module.exports = {
    insertweakendcategory,
    insertweakendcategorydata,
    fetchweakendCategories,
    wekendcategory,
    addweakendcategory
}