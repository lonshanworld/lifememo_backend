const express = require('express');
// const multer = require("multer");
// const imageModel = require("../../models/imagemodel");
// const userModel = require("../../models/usermodel");
const router = express.Router();
// const upload = multer();
// const asyncHandler = require("express-async-handler");
// const {body, validator} = require("express-validator");
const {signupUser, loginUser, logoutUser} = require("../../controllers/indexcontroller");

/* GET home page. */
// router.get('/', function(req, res) {
//   res.status(200).json({hello : `Hello in v1 with ${process.env.TESTING_STRING_02}`})
// });

// router.post("/createUser",upload.any(),async function(req, res, next){
//   console.log(req.files[0].buffer);
//   const newImage = new imageModel({
//     image : req.files[0].buffer,
//   });
  
//   const newUser = new userModel({
//     userName: req.body.userName,
//     email: req.body.email,
//     password: req.body.password,
//     birthDate: req.body.birthDate,
//     profileImg: newImage._id,
//   }) 
//   await newImage.save();
//   await newUser.save();
//   res.json(newUser);
// });

router.post("/signup",signupUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

module.exports = router;
