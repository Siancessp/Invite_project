const express = require("express");
const hbs = require('hbs');
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const session = require('express-session');
const Razorpay = require('razorpay');
const admin_route = require("./routes/adminRoute");
const user_route = require("./routes/userRoute");

// Set up the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up Handlebars engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views/common'));

// CORS middleware setup
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Use middleware
app.use('/', admin_route);
app.use('/api', user_route);

app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'session_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Connect to MongoDB
mongoose.connect("mongodb+srv://swarupamohapatra11:CpMeZSu7zxgRYAX2@cluster0.8ujr7jw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});