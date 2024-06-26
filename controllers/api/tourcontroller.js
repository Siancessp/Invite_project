const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const firebase = require('../../firebase');

const tourCategory = require("../../models/tourcategoryModel");
const Tour = require("../../models/addtourcategoryModel");
const TourDetails = require("../../models/api/tourModel");
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

const gettourcategory = async (req,res) => {
    try {
        const existingtourCategories = await tourCategory.find({}, '_id tourcategoryname');
        const formattedCategories = existingtourCategories.map(tour => ({
            _id: tour._id,
            tourcategoryname: tour.tourcategoryname
        }));
        res.status(200).json(formattedCategories);
    } catch (error) {
        throw error; // Simply throw the caught error
    }
};

const tourtemplate = async (req, res) => {
    try {
        const baseImageUrl = "/uploads/event_template";
        const { tourcategoryid } = req.params;
        let filter = {}; // Default filter to get all tour templates

        if (tourcategoryid) {
            filter = { tourcategoryid: tourcategoryid }; // Filter by tourcategoryid if provided
        }

        const existingTour = await Tour.find(filter);

        const tourWithUrls = existingTour.map(tour => ({
            _id: tour._id,
            tourcategoryid: tour.tourcategoryid,
            tourtemplate: baseImageUrl + '/' + tour.tourtemplate,
            __v: tour.__v
        }));

        const response = {
            success: true,
            msg: "Tours Fetched Successfully!",
            data: tourWithUrls
        };

        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Error fetching tour data" });
    }
};

//After choose a template we have to store data
const addtourDetails = async (req, res) => {
    try {
        const { tourtemplateid, tourdescription, tourname, tour_start_date, tour_end_date, tour_start_time, tour_end_time, tour_location, tour_price_adult, tour_price_child, user_id, multiData } = req.body;
        
        const existingTourtemplate = await Tour.findOne({ _id: tourtemplateid });

        if (!existingTourtemplate) {
            return res.status(404).json({ success: false, msg: 'Tour not found' });
        }

        const newTourDetails = new TourDetails({
            user_id: user_id,
            tourtemplateid: tourtemplateid,
            tourdescription: tourdescription,
            tourname: tourname,
            tour_start_date: tour_start_date,
            tour_end_date: tour_end_date,
            tour_start_time: tour_start_time,
            tour_end_time: tour_end_time,
            tour_location: tour_location,
            tour_price_adult: tour_price_adult,
            tour_price_child: tour_price_child
        });

        const savedTourDetails = await newTourDetails.save();

        const allUsers = await userRegister.find();
        const userwithTokens = allUsers.filter(user => user.deviceToken);
        if(!userwithTokens)
        {
            res.status(400).json({
                success: false,
                msg: 'No users with device tokens available'
            });
        }

        const deviceTokens = userwithTokens.map(user => user.deviceToken);
        const message = {
            notification: {
                title: 'New Tour Added!',
                body: 'Check out the latest Tour details.'
            },
            tokens: deviceTokens
        };

        const responses = await firebase.messaging().sendMulticast(message);
        console.log('Successfully sent notification:', responses);

        const response = {
            success: true,
            msg: "Tour added Successfully!",
            data: savedTourDetails
        }
        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Internal Server Error" });
    }
};

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
    // Split the time string into hours, minutes, and AM/PM
    const [hoursMinutes, ampm] = time.split(' ');

    // Split the hours and minutes
    const [hours, minutes] = hoursMinutes.split(':');

    // Join hours and minutes together with AM/PM
    const formattedTime = `${hours}:${minutes} ${ampm}`;

    return formattedTime;
};

//Fetch all weakend details
const gettourDetails = async (req, res) => {
    try {
        const existingTourdetails = await TourDetails.find({ });
        const baseImageUrl = "/uploads/event_template";

        if (!existingTourdetails) {
            return res.status(404).json({ success: false, msg: 'Tour Details not found' });
        }
        let tourDetailsWithUsers = [];

        for (let i = 0; i < existingTourdetails.length; i++) {
            const tourDetail = existingTourdetails[i];
            const tourtemplate = await Tour.findOne({ _id: tourDetail.tourtemplateid });

            const tourcategoryId = tourtemplate.tourcategoryid;

            const tourcategory = await tourCategory.findOne({ _id: tourcategoryId });

            if (tourtemplate) {
                const startDate = new Date(tourDetail.tour_start_date);
                const endDate = new Date(tourDetail.tour_end_date);

                // Calculate the difference in days
                const timeDifference = endDate - startDate;
                const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

                // Calculate the difference in hours for the night count
                const startTime = new Date(`1970-01-01T${tourDetail.tour_start_time}`);
                const endTime = new Date(`1970-01-01T${tourDetail.tour_end_time}`);
                const timeDifferenceInHours = (endTime - startTime) / (1000 * 60 * 60);

                // Calculate the number of nights
                const numberOfNights = daysDifference + (timeDifferenceInHours >= 24 ? 1 : 0);
                const tourDetailsWithUser = {
                    type: 'tour',
                    tour_id: tourDetail._id,
                    tourstartdate: getHumanReadableDate(new Date(tourDetail.tour_start_date)),
                    tourenddate: getHumanReadableDate(new Date(tourDetail.tour_end_date)),
                    tourstarttime: formatTime(tourDetail.tour_start_time),
                    tourname: tourDetail.tourname,
                    tourendtime: formatTime(tourDetail.tour_end_time),
                    tourlocation: tourDetail.tour_location,
                    tourday: daysDifference, // Number of days
                    tournight: numberOfNights,
                    tourtemplate: {
                        tourtemplate_id: tourtemplate._id,
                        tourtemplate: baseImageUrl + '/' + tourtemplate.tourtemplate
                    },
                    tourcategory: {
                        tourcategory_id: tourcategory._id,
                        tour_name: tourcategory.tourcategoryname
                    }
                };

                tourDetailsWithUsers.push(tourDetailsWithUser);
            }
        }

        const response = {
            success: true,
            msg: "Successfully fetched tour details with users",
            data: tourDetailsWithUsers
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
}

const getalltourdetailsbyid = async (req, res) => {
    try {
        const tourid = req.params.tourid;
        
        // Validate if tourid is a valid ObjectId
        if (!ObjectId.isValid(tourid)) {
            return res.status(400).json({ success: false, msg: 'Invalid tour ID' });
        }

        const existedTourDetails = await TourDetails.findOne({ _id: tourid });

        if (!existedTourDetails) {
            return res.status(404).json({ success: false, msg: 'Tour Details not found' });
        }

        const tourtemplatebackground = await Tour.findOne({ _id: existedTourDetails.tourtemplateid });
        const tourcategoryId = tourtemplatebackground.tourcategoryid;

        const tourcategory = await tourCategory.findOne({ _id: tourcategoryId });
        const user = await userRegister.findOne({ _id: existedTourDetails.user_id });

        const baseImageUrl = "/uploads/event_template";

        const tourDetailWithUser = {
            tour_id: existedTourDetails._id,
            tourstartdate: getHumanReadableDate(new Date(existedTourDetails.tour_start_date)),
            tourenddate: getHumanReadableDate(new Date(existedTourDetails.tour_end_date)),
            tourstarttime: formatTime(existedTourDetails.tour_start_time),
            tourendtime: formatTime(existedTourDetails.tour_end_time),
            tourpriceadult: existedTourDetails.tour_price_adult,
            tourpricechild: existedTourDetails.tour_price_child,
            tourlocation: existedTourDetails.tour_location,
            tourtemplate: {
                tourtemplate_id: tourtemplatebackground._id,
                tourtemplate: baseImageUrl + '/' + tourtemplatebackground.tourtemplate
            },
            tourcategory: {
                tourcategory_id: tourcategory._id,
                tourcategory_name: tourcategory.tourcategoryname
            },
            user: {
                user_id: user._id,
                username: user.fullname
            }
        };

        res.status(200).json({ success: true, data: tourDetailWithUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};

module.exports = {
    tourtemplate,
    gettourcategory,
    addtourDetails,
    gettourDetails,
    getalltourdetailsbyid
}

