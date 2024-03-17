const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/invitex', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});

const LogInSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

const Login = mongoose.model("User", LogInSchema);

module.exports = Login;