const asyncHandler = require("express-async-handler");
const userModel = require("../models/usermodel");
const getImageUrl = require("../utils/imageconvert");
const tokenUser = require("../utils/getIdfromToken");
const {body,query, validationResult, matchedData} = require("express-validator");
const usermodel = require("../models/usermodel");
const imagemodel = require("../models/imagemodel");
const multer = require("multer");
const upload = multer();
const bcrypt = require("bcryptjs");

const userProfile = asyncHandler(async(req, res)=>{
    // const bearerHeader = req.headers["authorization"];
    // const bearer = bearerHeader.split(" ");
    // const token = bearer[1];
    // const decodeduserid = jwt.verify(token,process.env.JWT_SECRETKEY);

    const userdata = await tokenUser(req);

    if(userdata){
        res.status(200).send({
            message: {userdata},
        });
    }else{
        // res.status(500).json({
        //     message: "Something went wrong with server.",
        // });
        res.status(500);
        res.statusMessage = "Something went wrong with server.";
        res.end();
    }
});

const updateProfile = [
    upload.any(),
    body("userName").trim().isLength({min:1, max: 200}).escape().withMessage("Username must not be empty"),
    body("email").trim().isEmail().withMessage("This email is not valid"),
    body("newpassword").trim().isLength({min:1, max: 20}).isStrongPassword().withMessage("Password must contain minumun Lowercase: 1, Uppercase: 1, Numbers: 1, Symbols: 1"),
    body("birthDate","Invalid date of birth").trim().optional({checkFalsy: true}).isISO8601().toDate(),
    asyncHandler(async(req,res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const userData = await tokenUser(req);
            const findUser = await userModel.findById(userData._id).exec();

            bcrypt.compare(req.body.oldpassword,findUser.password,async function(err,response){
                if(response === false){
                    res.statusMessage = "Old password is not correct";
                    res.status(401);
                    res.end();
                }else{
                    
                    bcrypt.hash(req.body.newpassword, 12, async(err, hashedpassword)=>{
                        if(err){
                            res.status(500);
                            res.statusMessage = err.toString();
                            res.end();
                        }else{
                            let imageId = null;
                            let newImage;
                            if(req.files[0] !== undefined){
                                newImage = new imagemodel({
                                    image: req.files[0].buffer,
                                    userId : findUser._id,
                                });
                        
                                imageId = newImage._id;
                                await newImage.save();
                            }
                            findUser.userName = req.body.userName;
                            findUser.email = req.body.email;
                            findUser.password = hashedpassword;
                            findUser.birthDate = req.body.birthDate;
                            if(imageId !== null){
                                findUser.profileImg = imageId;
                            }
                            await findUser.save().then((suc)=>{
                                res.status(200).end();
                            }).catch((err)=>{
                                res.statusMessage = "User profile cannot be updated";
                                res.status(449);
                                res.end();
                            });
                        }
                    });
                }
            });
        }else{
            let errorarray = errors.array().map(function(cur){
                return cur["msg"];
            });
           
            res.status(404);
            res.statusMessage = errorarray.join(".  ");
            res.end();
        }
    }),
];

const getProfiledata = [
    query("userId").notEmpty().escape().withMessage("Something went wrong with your query"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const data = matchedData(req);

            const userData = await userModel.findById(data.userId).select("-password");
            // let postList = [];
            // for(let a = 0; a < userData.posts.length; a++){

            // }
            if(userData){
                res.status(200).send({
                    "message" : {userData}
                });
            }else{
                res.status(404);
                res.statusMessage = "User not found";
                res.end();
            }
        }else{
            res.status(500);
            res.statusMessage = "Something went wrong with your query.";
            res.end();
        }
    }),
];


const addfriend = [
    query("friendId").notEmpty().escape().withMessage("Something went wrong with your query"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const data = matchedData(req);
            const userData = await tokenUser(req);

            const getfriendData = await userModel.findById(data.friendId).exec();
            if(getfriendData){
                userData.friends.push(getfriendData._id);
                getfriendData.friends.push(userData._id);
                await userData.save().then(async(success)=>{
                    await getfriendData.save().then((value)=>{
                        res.status(200).send({
                            message : "Friend added successfully"
                        });
                    });
                }).catch((err)=>{
                    res.status(500);
                    res.statusMessage = "Something went wrong with server while adding friend. Please try again later";
                    res.end();
                });
            }else{
                res.status(404);
                res.statusMessage = "Did not found the user";
                res.end();
            }

        }else{
            res.status(400);
            res.statusMessage = "Wrong query";
            res.end();
        }
    }),
];


const removefriend = [
    query("friendId").notEmpty().escape().withMessage("Something went wrong with your query"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const data = matchedData(req);
            const userData = await tokenUser(req);
            const getfrienddata = await usermodel.findById(data.friendId).exec();

            if(getfrienddata){
                await userModel.findByIdAndUpdate(
                    {_id : userData._id},
                    {$pull : {friends : getfrienddata._id}},
                    {new : true, safe : true}
                ).exec().then(async(success)=>{
                    await userModel.findByIdAndUpdate(
                        {_id : getfrienddata._id},
                        {$pull : {friends : userData._id}},
                        {new : true, safe : true}
                    ).exec().then((su)=>{
                        res.status(200).send({
                            message : "Friend removed successfully"
                        });
                    }).catch((er)=>{
                        res.status(500);
                        res.statusMessage = "Something went wrong. Please try again later";
                        res.end();
                    });
                }).catch((err)=>{
                    res.status(500);
                    res.statusMessage = "Something went wrong. Please try again later";
                    res.end();
                });
            }else{
                res.status(400);
                res.statusMessage = "Did not found the user";
                res.end();
            }
        }else{
            res.status(400);
            res.statusMessage = "Wrong query";
            res.end();
        }
    }),
];

const findpeople = [
    query("nametext").notEmpty().escape().withMessage("Input cannot be empty"),
    asyncHandler(async(req, res)=>{
        const error = validationResult(req);
        if(error.isEmpty()){
            const data = matchedData(req);
            // const userData = await tokenUser(req);

            const allusers = await userModel.find({
                userName : new RegExp( data.nametext, 'i'),
            }).select("_id profileImg userName").exec();
            let filterallusers = [];
         
            for(let a = 0; a< allusers.length; a++){
                const imagedata = allusers[a].profileImg === null ? null : await imagemodel.findById(allusers[a].profileImg).exec();
                const imageurl = allusers[a].profileImg === null ? null : await getImageUrl(imagedata.image.buffer);
                let data = {
                    _id : allusers[a]._id,
                    userName : allusers[a].userName,
                    profileImg : imageurl,
                };
                filterallusers.push(data);
            }
            res.status(200).send(filterallusers);
        }else{
            res.status(400);
            res.statusMessage = "Wrong query";
            res.end();
        }
    }),
];

module.exports = {
    userProfile,
    addfriend,
    removefriend,
    getProfiledata,
    findpeople,
    updateProfile,
};