const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Register = require('../models/adminregisterModels');

const authMiddleware = async (req, res, next) =>
{
    try
    {
        const token = req.body.token || req.query.token || req.headers["authorization"];

        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
          }
        
          jwt.verify(token, config.secret_jwt, (err, decoded) => {
            if (err) {
                return res.status(403).json({ success: false, message: "Failed to authenticate token" });
            }

            // Token is valid, attach user info to request for further processing
            req.user = decoded;
            next();
        });
    }
    catch(error)
    {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = authMiddleware;