const express = require('express');
const hbs  = require('hbs');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const Event = require("../models/addeventcategoryModels");
const Category = require("../models/addcategoryModel");

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
}

const inserteventcategory = async (req, res) => {
    const { categoryid } = req.body;

    try {
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
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}


const eventcategorylist = async (req, res) => {
    try {
        res.render('eventcategorylist'); // Make sure you have a 'login.hbs' file in your 'views' directory
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}
module.exports = {
    addeventcategory,
    inserteventcategory,
    eventcategorylist
}