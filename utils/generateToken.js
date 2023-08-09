const jwt = require("jsonwebtoken");

const generateToken = (res, userId) =>{
    const token = getToken(userId);
    res.cookie("jwtforlifememory", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60*60*24*7*1000,
    })
};


const getToken = (userId) =>{
    const token = jwt.sign({userId}, process.env.JWT_SECRETKEY,{
        expiresIn: "7d",
    });
    return token;
}

module.exports = {
    generateToken,
    getToken,
};