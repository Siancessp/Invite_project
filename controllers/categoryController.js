const express = require('express');
const hbs  = require('hbs');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const Category = require("../models/addcategoryModel");

const category = async (req, res) => {
    try {
        res.render('addeventname'); // Make sure you have a 'login.hbs' file in your 'views' directory
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const insertcategory = async (req,res) =>
{
    const { categoryname } = req.body;
    try 
    {
        const newCategory = new Category({
            categoryname: categoryname,
        });

        const savedCategory = await newCategory.save();
        const response = {
            success: true,
            msg: "Category added Successfully!",
            data: savedCategory
        }
        res.status(200).send(response);
    } 
    catch (error) 
    {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {
    insertcategory,
    category
}