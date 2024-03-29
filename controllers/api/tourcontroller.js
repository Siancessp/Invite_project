const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

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

const tourtemplate = async (req,res)=>
{
    try{
        const baseImageUrl = "/uploads/event_template";
        const existingTour = await Tour.find({});

        const tourWithUrls = existingTour.map(tour => {
            const tourWithUrls = {
                _id: tour._id,
                tourcategoryid: tour.tourcategoryid,
                tourtemplate: baseImageUrl + '/' + tour.tourtemplate,
                __v: tour.__v
            };
            return tourWithUrls;
        });

        const response = {
            success: true,
            msg: "Tour Fetch Successfully!",
            data: tourWithUrls
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
const addtourDetails = async (req,res)=>
{
    try {
        const tourtemplateid = req.body.tourtemplateid;
        const { tourdescription, tour_id, tour_start_date, tour_end_date, tour_start_time, tour_end_time, tour_location, tour_price_adult,tour_price_child, user_id } = req.body;
        const baseImageUrl = "/uploads/event_template";
        const existingTourtemplate = await Tour.findOne({ _id: tourtemplateid });

        if (!existingTourtemplate) {
            return res.status(404).json({ success: false, msg: 'Tour not found' });
        }

        const newTourDetails = new TourDetails({
            user_id: user_id,
            tourtemplateid: tourtemplateid,
            tourdescription: tourdescription,
            tour_id: tour_id,
            tour_start_date: tour_start_date,
            tour_end_date: tour_end_date,
            tour_start_time: tour_start_time,
            tour_end_time: tour_end_time,
            tour_location: tour_location,
            tour_price_adult: tour_price_adult,
            tour_price_child: tour_price_child
        });

        const savedTourDetails = await newTourDetails.save();
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
}

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
                const tourDetailsWithUser = {
                    tour_id: tourDetail._id,
                    tourstartdate: tourDetail.tour_start_date,
                    tourlocation: tourDetail.tour_location,
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
        const eventid = req.params.eventid;
        const existedTourDetails = await TourDetails.findOne({ _id: eventid });

        if (!existedTourDetails) {
            return res.status(404).json({ success: false, msg: 'Event Details not found' });
        }

        const tourtemplatebackground = await weakEnd.findOne({ _id: existedTourDetails.tourtemplateid });
        const tourcategoryId = tourtemplatebackground.tourcategoryid;

        const tourcategory = await tourCategory.findOne({ _id: tourcategoryId });
        const user = await userRegister.findOne({ _id: existedTourDetails.user_id });

        const baseImageUrl = "/uploads/event_template";

        const tourDetailWithUser = {
            tour_id: existedTourDetails._id,
            tourstartdate: existedTourDetails.weakend_start_date,
            tourenddate: existedTourDetails.weakend_end_date,
            tourstarttime: existedTourDetails.weakend_start_time,
            tourendtime: existedTourDetails.weakend_end_time,
            tourpriceadult: existedTourDetails.weakend_price_adult,
            tourpricechild: existedTourDetails.weakend_price_child,
            tourlocation: existedTourDetails.weakend_location,
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

