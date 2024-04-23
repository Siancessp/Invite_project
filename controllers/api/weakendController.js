const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const firebase = require('../../firebase');

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

        const allUsers = await userRegister.find();
        const userswithToken = allUsers.filter(user => user.deviceToken);

        if (userswithToken.length === 0) {
            return res.status(400).json({ success: false, msg: 'No users with device tokens available' });
        }
        const deviceTokens = userswithToken.map(user => user.deviceToken);

        const message = {
            notification: {
                title: 'New Weekend Added!',
                body: 'Check out the latest Weekend details.'
            },
            tokens: deviceTokens
        };

        // Send notification
        const responses = await firebase.messaging().sendMulticast(message);

        console.log('Successfully sent notification:', responses);

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
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
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
                const startDate = new Date(weakendDetail.weakend_start_date);
                const endDate = new Date(weakendDetail.weakend_end_date);

                // Calculate the difference in days
                const timeDifference = endDate - startDate;
                const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

                // Calculate the difference in hours for the night count
                const startTime = new Date(`1970-01-01T${weakendDetail.weakend_start_time}`);
                const endTime = new Date(`1970-01-01T${weakendDetail.weakend_end_time}`);
                const timeDifferenceInHours = (endTime - startTime) / (1000 * 60 * 60);

                // Calculate the number of nights
                const numberOfNights = daysDifference + (timeDifferenceInHours >= 24 ? 1 : 0);

                const weakendDetailsWithUser = {
                    type: 'weekend',
                    weakend_id: weakendDetail._id,
                    weakendstartdate: getHumanReadableDate(new Date(weakendDetail.weakend_start_date)),
                    weakendenddate: getHumanReadableDate(new Date(weakendDetail.weakend_end_date)),
                    weakendname: weakendDetail.weakendname,
                    weakendlocation: weakendDetail.weakend_location,
                    weekendday: daysDifference, // Number of days
                    weekendnight: numberOfNights,
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
        if (!weakendtemplatebackground) {
            return res.status(404).json({ success: false, msg: 'Weakend Template not found' });
        }

        const weakendcategoryId = weakendtemplatebackground.weakendcategoryid;
        const weakendcategory = await weakendCategory.findOne({ _id: weakendcategoryId });

        if (!weakendcategory) {
            return res.status(404).json({ success: false, msg: 'Weakend Category not found' });
        }

        const user = await userRegister.findOne({ _id: existedWeakendDetails.user_id });

        const baseImageUrl = "/uploads/event_template";

        const weakendDetailWithUser = {
            weakend_id: existedWeakendDetails._id,
            weakendstartdate: getHumanReadableDate(new Date(existedWeakendDetails.weakend_start_date)),
            weakendname: existedWeakendDetails.weakendname,
            weakendenddate: getHumanReadableDate(new Date(existedWeakendDetails.weakend_end_date)),
            weakendstarttime: formatTime(existedWeakendDetails.weakend_start_time),
            weakendendtime: formatTime(existedWeakendDetails.weakend_end_time),
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

const getweeklyweekendDetails = async (req, res) => {
    try {
        const baseImageUrl = "/uploads/event_template";

        // Get today's date
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Calculate the date 7 days from today
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 7);

        // Find events with start dates within the next 7 days and in the current month
        const existingWeekenddetails = await WeakendDetails.find({
            $expr: {
                $and: [
                    { $lte: ["$weakend_start_date", futureDate.toISOString()] },
                    { $gte: ["$weakend_end_date", today.toISOString()] }
                ]
            }
        });

        console.log("Existing Weekend Details:", existingWeekenddetails);

        if (!existingWeekenddetails || existingWeekenddetails.length === 0) {
            return res.status(404).json({ success: false, msg: 'No upcoming weekend found' });
        }

        let weekendDetailsArray = [];

        for (let i = 0; i < existingWeekenddetails.length; i++) {
            const weekendDetail = existingWeekenddetails[i];
            const weekendtemplate = await weakEnd.findOne({ _id: weekendDetail.weakendtemplateid });

            const weekendcategoryId = weekendtemplate.weakendcategoryid;
            const weekendcategory = await weakendCategory.findOne({ _id: weekendcategoryId });

            if (weekendtemplate) {
                const startDate = new Date(weakendDetail.weakend_start_date);
                const endDate = new Date(weakendDetail.weakend_end_date);

                // Calculate the difference in days
                const timeDifference = endDate - startDate;
                const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

                // Calculate the difference in hours for the night count
                const startTime = new Date(`1970-01-01T${weakendDetail.weakend_start_time}`);
                const endTime = new Date(`1970-01-01T${weakendDetail.weakend_end_time}`);
                const timeDifferenceInHours = (endTime - startTime) / (1000 * 60 * 60);

                // Calculate the number of nights
                const numberOfNights = daysDifference + (timeDifferenceInHours >= 24 ? 1 : 0);
                const weekendDetailWithUser = {
                    weekendstartdate: getHumanReadableDate(new Date(weekendDetail.weakend_end_date)),
                    weekendenddate: getHumanReadableDate(new Date(weekendDetail.weakend_end_date)),
                    weekendday: daysDifference, // Number of days
                    weekendnight: numberOfNights,
                    weekendname: weekendDetail.weakendname,
                    weekendlocation: weekendDetail.weakend_location,
                    weekenddescription: weekendDetail.weakenddescription,
                    weekendtemplate: {
                        weekendtemplate_id: weekendtemplate._id,
                        weekendtemplate: baseImageUrl + '/' + weekendtemplate.weakendtemplate
                    },
                    category: {
                        category_id: weekendcategory._id,
                        category_name: weekendcategory.weakendcategoryname
                    }
                };

                weekendDetailsArray.push(weekendDetailWithUser);
            }
        }

        console.log("Weekend Details Array:", weekendDetailsArray);

        const response = {
            success: true,
            msg: "Successfully fetched upcoming event details for the current week in the current month",
            data: weekendDetailsArray
        };

        res.status(200).json(response);
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
    getallweakenddetailsbyid,
    getweeklyweekendDetails
}
