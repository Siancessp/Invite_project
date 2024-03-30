const express = require("express");
const user_route = express.Router();
const Razorpay = require('razorpay');

const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

const userController = require("../controllers/api/userConroller");
const eventController = require("../controllers/api/eventcontroller");
const weakendController = require("../controllers/api/weakendController");
const paymentController = require("../controllers/api/paymentController");
const tourController = require("../controllers/api/tourcontroller");

const likeController = require("../controllers/api/likecontroller");
const commentController = require("../controllers/api/commentcontroller");

user_route.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.js'));
});


user_route.post('/register', userController.insertuserData);
user_route.post('/login', userController.user_login);
user_route.get('/getprofile/:user_id', userController.getprofile);
user_route.post('/updateprofile/:user_id', userController.updateprofileById);

user_route.get('/eventtemplate', eventController.eventtemplate);
user_route.get('/geteventcategory', eventController.geteventcategory);
user_route.get('/getselectedtemplate', eventController.getselectedtemplate);
user_route.post('/addeventdetails', eventController.addeventDetails);
user_route.get('/getalleventdetails', eventController.geteventDetails);
user_route.get('/getselectedeventdetails/:eventid', eventController.getalleventdetailsbyid);

user_route.get('/weakendtemplate', weakendController.weakendtemplate);
user_route.get('/getweakendcategory', weakendController.getweakendcategory);
user_route.post('/addweakenddetails', weakendController.addweakendDetails);
user_route.get('/getweakenddetails', weakendController.getweakendDetails);
user_route.get('/getalleventdetails/:weakendid', weakendController.getallweakenddetailsbyid);

user_route.get('/tourtemplate', tourController.tourtemplate);
user_route.get('/gettourcategory', tourController.gettourcategory);
user_route.post('/addtourdetails', tourController.addtourDetails);
user_route.get('/gettourdetails', tourController.gettourDetails);
user_route.get('/getalltourdetailsbyid/:tourid', tourController.getalltourdetailsbyid);

user_route.post('/storelikedetails', likeController.storelikeDetails);
user_route.get('/getlikedetails/:post_id', likeController.getLikeDetails);

// user_route.post('/storecommentdetails', commentController.storecommentDetails);
// user_route.get('/getcommentdetails', commentController.getcommentDetails);
// user_route.get('/addreplytocomment/:commentId', commentController.addReplyToComment);
// user_route.get('/addreplytocomment/:commentId', commentController.addReplyToComment);

// user_route.post('/payment', paymentController.payment);

module.exports = user_route;