const express = require("express");
const exphbs  = require('express-handlebars');
const admin_route = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const bodyParser = require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true}));

const path = require("path");

const multer = require("multer");
const storage = multer.diskStorage(
    {
        destination:function(req,file,cb)
        {
            cb(null,path.join(__dirname, '../public/uploads/event_template'));
        },
        filename:function(req,file,cb)
        {
            const name = Date.now()+'-'+file.originalname;
            cb(null,name);
        }
    }
);

admin_route.get('/protected-route', authMiddleware, (req, res) => {
    res.json({ success: true, message: "Protected route accessed successfully", user: req.user });
});

const upload = multer({storage:storage});

const loginController = require("../controllers/loginController");
const registerController = require("../controllers/registerController");
const userController = require('../controllers/userController');

const categoryController = require("../controllers/categoryController");
const weakendcategoryController = require("../controllers/weekendcategoryController");

const tourcategoryController = require("../controllers/tourcategoryController");

const addeventController = require("../controllers/eventController");

admin_route.post('/register', registerController.insertuser);
admin_route.get('/getallUsers', userController.getallUsers);
admin_route.get('/inactiveuser/:user_id', userController.inactiveuser);
admin_route.get('/activeuser/:user_id', userController.activeuser);

admin_route.post('/insertcategory', categoryController.insertcategory);
admin_route.get('/category', categoryController.category);

admin_route.get('/wekendcategory', weakendcategoryController.wekendcategory);
admin_route.post('/insertweakendcategory', weakendcategoryController.insertweakendcategory);

admin_route.get('/tourcategory', tourcategoryController.tourcategory);
admin_route.post('/inserttourcategory', tourcategoryController.inserttourcategory);

admin_route.get('/',loginController.login);
admin_route.get('/login',loginController.login);
admin_route.post('/verifylogin',loginController.verifylogin);
// admin_route.get('/logout',loginController.logout);

// admin_route.get('/test', authMiddleware, function(req,res){
//     res.status(200).send({ success:true, msg:"Authentcated" });
// });

admin_route.get('/addeventcategory', addeventController.addeventcategory);
admin_route.get('/getallevent',  addeventController.getallevent);
admin_route.post('/eventcategory', upload.single('eventtemplate'),addeventController.inserteventcategory);
admin_route.get('/geteventbyuserid/:user_id',addeventController.geteventbyUserid);

admin_route.get('/addweakendcategory',  weakendcategoryController.addweakendcategory);
admin_route.post('/insertweakendcategorydata',  upload.single('weakendtemplate'), weakendcategoryController.insertweakendcategorydata);
admin_route.get('/getallweekenddetails',  weakendcategoryController.getallweekenddetails);
admin_route.get('/getwekendbyuserid/:user_id',  weakendcategoryController.getwekendbyUserid);

admin_route.get('/addtourcategory', tourcategoryController.addtourcategory);
admin_route.post('/inserttourcategorydata', upload.single('tourtemplate'), tourcategoryController.inserttourcategorydata);
admin_route.get('/getalltourdetails',  tourcategoryController.getalltourDetails);
admin_route.get('/gettourbyuserid/:user_id',  tourcategoryController.gettourbyUserid);


module.exports = admin_route;
