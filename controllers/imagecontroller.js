const asyncHandler = require("express-async-handler");
const imageModel = require("../models/imagemodel");
const {query, validationResult, matchedData} = require("express-validator");
const multer = require("multer");
const tokenUser = require("../utils/getIdfromToken");
const upload = multer();

const imageDetail = [
    query("imageId").notEmpty().escape(),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const data = matchedData(req);

            const imageDetailInfo = await imageModel.findById(data.imageId);

            if(imageDetailInfo){
                res.status(200).send({
                    message : {imageDetailInfo}
                });
            }else{
                // res.status(404).json({
                //     message: "Image not found",
                // });
                res.status(500);
                res.statusMessage = "Image not found";
                res.end();
            }
        }else{
            res.status(404);
            res.statusMessage = "Something went wrong";
            res.end();
        }
    }),
];

const createImage = [
    upload.any(),
    asyncHandler(async(req, res) =>{
        const userdata = await tokenUser(req);
        try{
            const newImage = new imageModel({
                image: req.files[0].buffer,
                userId : userdata._id,
            });
    
            await newImage.save();
            res.status(200).send({
                message: "Image saved successfully"
            })
        }catch(err){
            // console.log(err);
            // res.status(500).json({
            //     message: "Save image failed"
            // })
            res.status(500);
            res.statusMessage = "Save image failed";
            res.end();
        }
    }),
];

module.exports = {
    imageDetail,
    createImage,
};