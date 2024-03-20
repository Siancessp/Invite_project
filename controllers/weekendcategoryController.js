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

const insertweakendcategory = async (req,res) =>
{
    const { weakendcategoryname } = req.body;
    try 
    {
        const newwaekendCategory = new weakendCategory({
            weakendcategoryname: weakendcategoryname,
        });

        const saveweakendCategory = await newwaekendCategory.save();
        const response = {
            success: true,
            msg: "Weakend Category added Successfully!",
            data: saveweakendCategory
        }
        res.status(200).send(response);
    } 
    catch (error) 
    {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const fetchCategories = async () => {
    try {
        const existingweakendCategories = await weakendCategory.find({}, '_id weakendcategoryname');
        return existingweakendCategories.map(weakendcategory => ({
            _id: weakendcategory._id,
            weakendcategoryname: weakendcategory.weakendcategoryname
        }));
    } catch (error) {
        throw new Error(error.message);
    }
};


const addweakendcategory = async (req, res) => {
    try {
        const weakendcategories = await fetchCategories();
        res.render('addweakendcategory', { weakendcategories });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const insertweakendcategorydata = async (req, res) => {
    const { weakendcategoryid } = req.body;

    try {
        const newWeakend = new weakEnd({
            weakendcategoryid: weakendcategoryid,
            weakendtemplate: req.file.filename
        });

        const savedWeakend = await newWeakend.save();
        if (savedWeakend) {
            const weakendcategories = await fetchCategories();
            res.render('addweakendcategory', { message: "Your event has been created successfully!", weakendcategories });
        } else {
            res.render('addweakendcategory', { message: "Failed to create event!" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};



module.exports = {
    insertweakendcategory,
    insertweakendcategorydata,
    addweakendcategory,
    fetchCategories,
    wekendcategory
}