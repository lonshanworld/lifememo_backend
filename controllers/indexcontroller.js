const asyncHandler = require("express-async-handler");
const {generateToken, getToken} = require("../utils/generateToken");
const multer = require("multer");
// const express = require("express");
// const passport = require("passport");
const imageModel = require("../models/imagemodel");
const userModel = require("../models/usermodel");
const upload = multer();
const bcrypt = require("bcryptjs");
const {body, validationResult} = require("express-validator");

const signupUser = [
    upload.any(),
    body("userName").trim().isLength({min:1, max: 200}).escape().withMessage("Username must not be empty"),
    body("email").trim().isEmail().withMessage("This email is not valid"),
    body("password").trim().isLength({min:1, max: 20}).isStrongPassword().withMessage("Password must contain minumun Lowercase: 1, Uppercase: 1, Numbers: 1, Symbols: 1"),
    body("birthDate","Invalid date of birth").trim().optional({checkFalsy: true}).isISO8601().toDate(),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        let imageId = null;
        let newImage;
        if(req.files[0] !== undefined){
            newImage = new imageModel({
                image: req.files[0].buffer,
            });
    
            imageId = newImage._id;
        }
    
        let newUser;

        bcrypt.hash(req.body.password, 12,async(err, hashedPassword) =>{
            if(err){
                // res.status(500).json({
                //     message: err.toString(),
                // });
                res.status(500);
                res.statusMessage = err.toString();
                res.end();
            }else{
                newUser = new userModel({
                    userName: req.body.userName,
                    email: req.body.email,
                    password: hashedPassword, //Aa@2dddd
                    birthDate: req.body.birthDate,
                    profileImg: imageId,
                });

                if(!errors.isEmpty()){

                    let errorarray = errors.array().map(function(cur){
                        return cur["msg"];
                    });
        
                    // res.status(404).json({
                    //     message: errorarray.join(".  "),
                    // });
                    res.status(404);
                    res.statusMessage = errorarray.join(".  ");
                    res.end();
                }else{
                    const findUser = await userModel.findOne({email : req.body.email});
                    
                    if(findUser === null){
                        try{
                            if(newImage !== undefined){
                                newImage.userId = newUser._id;
                                await newImage.save();
                            }
                            await newUser.save();
                            generateToken(res, newUser._id);
                            res.status(200).send({
                                message: "User account created successfully",
                                token: getToken(newUser._id),
                            });
                        }catch(err){
                            // console.log(err);
                            // res.status(500).json({
                            //     message: "Error creating new user"
                            // });
                            res.status(500);
                            res.statusMessage = "Error creating new user";
                            res.end();
                        }
                    }else{
                        // res.status(409).json({
                        //     message: "User already exists",
                        // })
                        res.status(500);
                        res.statusMessage = "User already exists";
                        res.end();
                    }
                }
            }
        });
    
        
    }),
];


const loginUser = [
    upload.any(),
    body("email").trim().not().isEmpty().withMessage("Email must not empty").isEmail().withMessage("This email is not invalid"),
    body("password").trim().not().isEmpty().withMessage("Password must not empty"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            let errorarray = errors.array().map(function(cur){
                return cur["msg"];
            });
           
            res.status(404);
            res.statusMessage = errorarray.join(".  ");
            res.end();
        }else{
            const findUser = await userModel.findOne({email: req.body.email});
            if(!findUser){
               
                res.status(401);
                res.statusMessage = "User not found";
                res.end();
            }else{
                bcrypt.compare(req.body.password,findUser.password,function(err,response){
                    if(response === false){
                        res.statusMessage = "Incorrect Password";
                        res.status(401);
                        res.end();
                    }else{
                        generateToken(res, findUser._id);
                        res.status(200).send({
                            message: "User found",
                            token: getToken(findUser._id),
                        });
                    }
                });
            }
        }
    }),
];


const logoutUser = asyncHandler(async(req, res)=>{
    // res.cookie(process.env.JWT_WEBTOKEN_KEY,"",{
    //     httpOnly: true,
    //     expires: new Date(0),
    // });

    res.clearCookie("jwtforlifememory");

    res.status(200).send({
        message: "User logout successfully", 
    });
});


module.exports = {
    signupUser,
    loginUser,
    logoutUser,
};