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


const weakendtemplate = async (req, res) => {
    try {
        const baseImageUrl = "/uploads/event_template";
        const { weakendcategoryid } = req.params;

        let filter = {}; // Default filter to get all weekend templates
        if (weakendcategoryid) {
            filter = { weakendcategoryid: weakendcategoryid }; // Filter by weakendcategoryid if provided
        }

        const existingWeakends = await weakEnd.find(filter);

        const weakendsWithUrls = existingWeakends.map(weakend => ({
            _id: weakend._id,
            weakendcategoryid: weakend.weakendcategoryid,
            weakendtemplate: baseImageUrl + '/' + weakend.weakendtemplate,
            __v: weakend.__v
        }));

        const response = {
            success: true,
            msg: "Weekend Templates Fetched Successfully!",
            data: weakendsWithUrls
        };

        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Error fetching weekend templates" });
    }
};


//After choose a template we have to store data
const addweakendDetails = async (req,res)=>
{
    try {
        const weakendtemplateid = req.body.weakendtemplateid;
        const { weakenddescription, weakendname, weakend_start_date, weakend_end_date, weakend_start_time, weakend_end_time, weakend_location, weakend_price_adult,weakend_price_child, user_id } = req.body;
        const baseImageUrl = "/uploads/event_template";
        const existingWeakendtemplate = await weakEnd.findOne({ _id: weakendtemplateid });

        if (!existingWeakendtemplate) {
            return res.status(404).json({ success: false, msg: 'Weakend not found' });
        }

        const newWeakendDetails = new WeakendDetails({
            user_id: user_id,
            weakendtemplateid: weakendtemplateid,
            weakenddescription: weakenddescription,
            weakendname: weakendname,
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

const getHumanReadableDate = (date) => {
    if (date instanceof Date) {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const month = monthNames[date.getMonth()];
        const day = date.getDate();
        return `${day} ${month}`;
    } else if (isFinite(date)) {
        // If it's a timestamp, convert it to a Date object
        const d = new Date();
        d.setTime(date);
        return getHumanReadableDate(d);
    }
};

const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const formattedHours = parseInt(hours, 10) % 12 || 12; // Convert to 12-hour format
    const ampm = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
    return `${formattedHours}:${minutes} ${ampm}`;
};

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
                    weakendstartdate: getHumanReadableDate(new Date(eventDetail.weakend_start_date)),
                    weakendenddate: getHumanReadableDate(new Date(eventDetail.weakend_end_date)),
                    weakendname: eventDetail.weakendname,
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
