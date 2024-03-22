const express = require("express");
const exphbs  = require('express-handlebars');
const admin_route = express.Router();

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

const upload = multer({storage:storage});

const loginController = require("../controllers/loginController");
const registerController = require("../controllers/registerController");

const categoryController = require("../controllers/categoryController");
const weakendcategoryController = require("../controllers/weekendcategoryController");

const addeventController = require("../controllers/eventController");

admin_route.post('/register', registerController.insertuser);

admin_route.post('/insertcategory', categoryController.insertcategory);
admin_route.get('/category', categoryController.category);

admin_route.get('/wekendcategory', weakendcategoryController.wekendcategory);
admin_route.post('/insertweakendcategory', weakendcategoryController.insertweakendcategory);

admin_route.get('/fetchweakendCategories', weakendcategoryController.fetchweakendCategories);
admin_route.get('/addweakendcategory', weakendcategoryController.addweakendcategory);
admin_route.post('/insertweakendcategorydata', upload.single('weakendtemplate'), weakendcategoryController.insertweakendcategorydata);

admin_route.get('/',loginController.login);
admin_route.get('/login',loginController.login);
admin_route.post('/verifylogin',loginController.verifylogin);

admin_route.get('/addeventcategory',addeventController.addeventcategory);
admin_route.post('/eventcategory',upload.single('eventtemplate'),addeventController.inserteventcategory);
admin_route.get('/eventcategorylist',addeventController.eventcategorylist);


module.exports = admin_route;
