const express = require('express');
const router = express.Router();
const {userProfile, addfriend, getProfiledata, removefriend, findpeople, updateProfile} = require("../../controllers/usercontroller");
const {protectAuth} = require("../../middleware/tokenauthmiddleware");


router.get("/profile",[protectAuth],userProfile);
router.post("/addfriend",[protectAuth], addfriend);
router.post("/removefriend",[protectAuth], removefriend);
router.get("/",[protectAuth], getProfiledata);
router.get("/findpeople",[protectAuth],findpeople);
router.post("/updateprofile",[protectAuth],updateProfile)

module.exports = router;



// multipart formdata using multer
// router.post("/", upload.fields([{name: "age", name: "pokemonimage" }]),function(req, res, next){
//   console.log(req.body);
//   console.log(req.files);
//   res.json({
//     name: req.body.name,
//     age: req.body.age,
//     image: req.files.pokemonimage
//   });
// });

// router.post("/", upload.any(),function(req, res, next){
//   // console.log(req.body);
//   // console.log(req.files.toString("utf8"));
//   res.json({
//     name: req.body.name,
//     age: req.body.age,
//     image: req.files[0].buffer.toString('base64'),
//   });
// });


// router.post("/", function(req, res,next){
//   console.log(req.body);
// });

// router.post("/", upload.any(),function(req, res, next){
//   console.log(req.body);
//   console.log(req.files.toString("utf8"));
//   res.json({
//     name: req.body.name,
//     age: req.body.age,
//     image: req.files[0].buffer,
//   });
// });

/* GET users listing. */

// router.post("/createUser",upload.any(), function(req, res, next){
//   const newUser = new UserModel({
//     userName: req.body.userName,
//     email: req.body.email,
//     password: req.body.password,
//     birthDate: req.body.birthDate, 
//   });

//   users.push(newUser);
//   res.json(newUser);
// });