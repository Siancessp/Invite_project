const express = require("express");
const user_route = express.Router();

const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

const userController = require("../controllers/api/userConroller");
const eventController = require("../controllers/api/eventcontroller");

user_route.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.js'));
});


user_route.post('/register', userController.insertuserData);
user_route.get('/login', userController.user_login);
user_route.get('/eventtemplate', eventController.eventtemplate);
user_route.get('/geteventcategory', eventController.geteventcategory);
user_route.get('/getselectedtemplate', eventController.getselectedtemplate);
user_route.post('/addeventdetails', eventController.addeventDetails);
user_route.get('/getalleventdetails', eventController.geteventDetails);
user_route.get('/getselectedeventdetails/:eventid', eventController.getalleventdetailsbyid);

module.exports = user_route;