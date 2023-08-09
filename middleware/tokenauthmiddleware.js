const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const userModel = require("../models/usermodel");

const protectAuth = asyncHandler(async(req, res, next)=>{
    // let token;

    // token = req.cookies.jwtforlifememory;

    // if(token){
    //     try{
    //         const decodeduserid = jwt.verify(token,process.env.JWT_SECRETKEY);
    
    //         req.user = await userModel.findById(decodeduserid.userId).select("_id");
    //         console.log("this is from token auth middleware");
    //         console.log(req.user);
    //         next();
    //     }catch(err){
    //        res.status(401).json({
    //             message: "Invalid token",
    //        }); 
    //     }
    // }else{
    //     res.status(401).json({
    //         message: "User not authorized. no token",
    //     })
    // }
    const bearerHeader = req.headers["authorization"];
    if(typeof bearerHeader !== undefined){
        const bearer = bearerHeader.split(" ");
        const bearertoken = bearer[1];

        if(bearertoken){
            try{
                const decodeduserid = jwt.verify(bearertoken,process.env.JWT_SECRETKEY);
        
                req.user = await userModel.findById(decodeduserid.userId).select("_id");
                next();
            }catch(err){
            //    res.status(401).json({
            //         message: "Invalid token",
            //    }); 
                res.status(401);
                res.statusMessage = "Invalid Token";
                res.end();
            }
        }else{
            // res.status(401).json({
            //     message: "User not authorized",
            // })
            res.status(401);
            res.statusMessage = "User not authorized";
            res.end();
        }
    }else{
        // res.status(401).json({
        //     message: "No token",
        // })
        res.status(401);
        res.statusMessage = "No Token";
        res.end();
    }
});

module.exports = {
    protectAuth,
}