const asyncHandler = require("express-async-handler");
const packagemodel = require("../models/packagemodel");
const {body,query, validationResult, matchedData} = require("express-validator");
const tokenUser = require("../utils/getIdfromToken");
const usermodel = require("../models/usermodel");

const createPackage = [
    
    body("packageName").trim().not().isEmpty().withMessage("Package Name must not empty"),
    body("packageType").trim().not().isEmpty().withMessage("Package Type must not empty"),
    body("content").trim().not().isEmpty().withMessage("content must not empty"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const userData = await tokenUser(req);
            const findUser = await usermodel.findById(userData._id).exec();
            if(findUser.role === "user"){
                return res.status(400).json({
                    error : "User cannot create package",
                });
            }
            const newPackage = new packagemodel({
                packageName : req.body.packageName,
                packageType : req.body.packageType,
                price : req.body.price ?? 0,
                content : req.body.content,
                limit : req.body.limit,
                isUnlimited : req.body.isUnlimited,
                createdBy : findUser._id
            });
            const result = await newPackage.save();
            console.log("result after create", result);
            return res.status(200).json({
                message : "Package Created Successfully",
            })
        }else{
            console.log("what is error", errors);
            res.status(400);
            res.statusMessage = "Unexpected Error occured. Please try again later";
            res.end();
        }
    })
];

const deletePackage = [
    body("packageId").trim().notEmpty().withMessage("PackageId required"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            await packagemodel.findByIdAndRemove(req.body.packageId);
            return res.status(200).json({});
        }else{
            res.status(400);
            res.statusMessage("Delete not successful");
            res.end();
        }
    })
];

const getPackages = asyncHandler(async(req, res)=>{
    const dataList = await packagemodel.find();
    console.log("where packages", dataList);
    return res.status(200).json({
        packages : dataList
    })
});

module.exports = {
    createPackage,
    deletePackage,
    getPackages,
}