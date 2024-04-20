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
admin_route.get('/getallUsers', authMiddleware, userController.getallUsers);

admin_route.post('/insertcategory', authMiddleware, categoryController.insertcategory);
admin_route.get('/category', authMiddleware, categoryController.category);

admin_route.get('/wekendcategory', authMiddleware, weakendcategoryController.wekendcategory);
admin_route.post('/insertweakendcategory', authMiddleware, weakendcategoryController.insertweakendcategory);

admin_route.get('/tourcategory', authMiddleware, tourcategoryController.tourcategory);
admin_route.post('/inserttourcategory', authMiddleware, tourcategoryController.inserttourcategory);

admin_route.get('/',loginController.login);
admin_route.get('/login',loginController.login);
admin_route.post('/verifylogin',authMiddleware.loginController.verifylogin);
// admin_route.get('/logout',loginController.logout);

// admin_route.get('/test', authMiddleware, function(req,res){
//     res.status(200).send({ success:true, msg:"Authentcated" });
// });

admin_route.get('/addeventcategory',authMiddleware, addeventController.addeventcategory);
admin_route.get('/getallevent', authMiddleware, addeventController.getallevent);
admin_route.post('/eventcategory',authMiddleware, upload.single('eventtemplate'),addeventController.inserteventcategory);
// admin_route.get('/eventcategorylist',addeventController.eventcategorylist);

admin_route.get('/addweakendcategory', authMiddleware, weakendcategoryController.addweakendcategory);
admin_route.post('/insertweakendcategorydata', authMiddleware, upload.single('weakendtemplate'), weakendcategoryController.insertweakendcategorydata);

admin_route.get('/addtourcategory', authMiddleware, tourcategoryController.addtourcategory);
admin_route.post('/inserttourcategorydata', authMiddleware, upload.single('tourtemplate'), tourcategoryController.inserttourcategorydata);


module.exports = admin_route;
