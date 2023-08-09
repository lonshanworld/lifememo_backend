const jwt = require("jsonwebtoken");
const userModel = require("../models/usermodel");

const tokenUser = async(req)=>{
    const bearerHeader = req.headers["authorization"];
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    const decodeduserid = jwt.verify(token,process.env.JWT_SECRETKEY);

    const userdata = await userModel.findById(decodeduserid.userId).select("-password").exec();
    return userdata;
};


module.exports = tokenUser;