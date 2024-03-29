const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const weakendCategory = require("../../models/wekendcategoryModel");
const weakEnd = require("../../models/addweakendcategoryModel");
const WeakendDetails = require("../../models/api/weakendModel");
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
        const existingweakendCategories = await weakendCategory.find({}, '_id weakendcategoryname');
        const formattedCategories = existingweakendCategories.map(weakend => ({
            _id: weakend._id,
            weakendcategoryname: weakend.weakendcategoryname
        }));
        res.status(200).json(formattedCategories);
    } catch (error) {
        throw error; // Simply throw the caught error
    }
};


const weakendtemplate = async (req,res)=>
{
    try{
        const baseImageUrl = "/uploads/event_template";
        const existingWeakend = await weakEnd.find({});

        const weakendWithUrls = existingWeakend.map(weakend => {
            const weakendWithUrls = {
                _id: weakend._id,
                weakendcategoryid: weakend.weakendcategoryid,
                weakendtemplate: baseImageUrl + '/' + weakend.weakendtemplate,
                __v: weakend.__v
            };
            return weakendWithUrls;
        });

        const response = {
            success: true,
            msg: "Weakend Fetch Successfully!",
            data: weakendWithUrls
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
        const weakendtemplateid = req.body.weakendtemplateid;
        const { weakenddescription, weakendid, weakend_start_date, weakend_end_date, weakend_start_time, weakend_end_time, weakend_location, weakend_price_adult,weakend_price_child, user_id } = req.body;
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

//Fetch all weakend details
const getweakendDetails = async (req, res) => {
    try {
        const existingWeakenddetails = await WeakendDetails.find({ });
        const baseImageUrl = "/uploads/event_template";

        if (!existingWeakenddetails) {
            return res.status(404).json({ success: false, msg: 'Weakend Details not found' });
        }
        let weakendDetailsWithUsers = [];

        for (let i = 0; i < existingWeakenddetails.length; i++) {
            const weakendDetail = existingWeakenddetails[i];
            const weakendtemplate = await weakEnd.findOne({ _id: weakendDetail.weakendtemplateid });

            const weakendcategoryId = weakendtemplate.weakendcategoryid;

            const weakendcategory = await weakendCategory.findOne({ _id: weakendcategoryId });

            if (weakendtemplate) {
                const weakendDetailsWithUser = {
                    weakend_id: weakendDetail._id,
                    weakendstartdate: weakendDetail.weakend_start_date,
                    weakendlocation: weakendDetail.weakend_location,
                    weakendtemplate: {
                        weakendtemplate_id: weakendtemplate._id,
                        weakendtemplate: baseImageUrl + '/' + weakendtemplate.weakendtemplate
                    },
                    weakendcategory: {
                        weakendcategory_id: weakendcategory._id,
                        weakend_name: weakendcategory.weakendcategoryname
                    }
                };

                weakendDetailsWithUsers.push(weakendDetailsWithUser);
            }
        }

        const response = {
            success: true,
            msg: "Successfully fetched event details with users",
            data: weakendDetailsWithUsers
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};

const getallweakenddetailsbyid = async (req, res) => {
    try {
        const weakendid = req.params.weakendid;
        const existedWeakendDetails = await WeakendDetails.findOne({ _id: weakendid });

        if (!existedWeakendDetails) {
            return res.status(404).json({ success: false, msg: 'Weakend Details not found' });
        }

        const weakendtemplatebackground = await weakEnd.findOne({ _id: existedWeakendDetails.weakendtemplateid });
        const weakendcategoryId = weakendtemplatebackground.weakendcategoryid;

        const weakendcategory = await weakendCategory.findOne({ _id: weakendcategoryId });
        const user = await userRegister.findOne({ _id: existedWeakendDetails.user_id });

        const baseImageUrl = "/uploads/event_template";

        const weakendDetailWithUser = {
            weakend_id: existedWeakendDetails._id,
            weakendstartdate: existedWeakendDetails.weakend_start_date,
            weakendenddate: existedWeakendDetails.weakend_end_date,
            weakendstarttime: existedWeakendDetails.weakend_start_time,
            weakendendtime: existedWeakendDetails.weakend_end_time,
            weakendpriceadult: existedWeakendDetails.weakend_price_adult,
            weakendpricechild: existedWeakendDetails.weakend_price_child,
            weakendlocation: existedWeakendDetails.weakend_location,
            weakendtemplate: {
                weakendtemplate_id: weakendtemplatebackground._id,
                weakendtemplate: baseImageUrl + '/' + weakendtemplatebackground.weakendtemplate
            },
            weakendcategory: {
                weakendcategory_id: weakendcategory._id,
                weakendcategory_name: weakendcategory.weakendcategoryname
            },
            user: {
                user_id: user._id,
                username: user.fullname
            }
        };

        res.status(200).json({ success: true, data: weakendDetailWithUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};

module.exports = {
    weakendtemplate,
    getweakendcategory,
    addweakendDetails,
    getweakendDetails,
    getallweakenddetailsbyid
}
