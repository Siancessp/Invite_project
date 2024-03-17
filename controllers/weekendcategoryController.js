const express = require('express');
const hbs  = require('hbs');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const weakendCategory = require("../models/wekendcategoryModel");

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

module.exports = {
    insertweakendcategory
}