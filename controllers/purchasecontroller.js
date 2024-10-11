const asyncHandler = require("express-async-handler");
const packagemodel = require("../models/packagemodel");
const {body,query, validationResult, matchedData} = require("express-validator");
const tokenUser = require("../utils/getIdfromToken");
const usermodel = require("../models/usermodel");
const purchasemodel = require("../models/purchasemodel");

const purchasePackage = [
    body("packageId").trim().notEmpty().withMessage("Package Id must not empty"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const userData = await tokenUser(req);
            const findUser = await usermodel.findById(userData._id).exec();
            if(!findUser && findUser.role !== "user"){
               
                return res.status(400).json({
                    error : "User not found"
                });
            }else{
                const newPurchase = new purchasemodel({
                    userId : findUser._id,
                    packageId : req.body.packageId
                });
                await newPurchase.save();
                const packageData = await packagemodel.findById(req.body.packageId);
                console.log("is here?",packageData);
                if(packageData.packageType === "moment"){
                    console.log(" heree?")                

                    // await usermodel.findByIdAndUpdate(
                    //     {_id : findUser._id},
                    //     {
                    //         postPurchaseId : newPurchase._id,
                    //         postLimit : findUser.postLimit + packageData.limit,
                    //     },
                    //     {new : true, safe : true},
                    // );
                    findUser.postPurchaseId = newPurchase._id;
                    findUser.postLimit = findUser.postLimit + packageData.limit;
                    await findUser.save();
                }else if(packageData.packageType === "video"){   
                    // console.log("reach heree?")                
                    // await usermodel.findByIdAndUpdate(
                    //     {_id : findUser._id},
                    //     {
                    //        videoCallPurchaseId : newPurchase._id,
                    //     },
                    //     {new : true, safe : true},
                    // );
                    findUser.videoCallPurchaseId = newPurchase._id;
                    await findUser.save();
                }else if(packageData.packageType === "voice"){
                    // const result = await usermodel.findByIdAndUpdate(
                    //      findUser._id,
                    //     {
                    //        voiceCallPurchaseId : newPurchase._id,
                    //     },
                    //     {new : true, safe : true},
                    // );
                    findUser.voiceCallPurchaseId = newPurchase._id;
                    await findUser.save();
                }
                return res.status(200).json({
                    message : "Purchase package successfully"
                });
            }
        }else{
            return res.status(400).json({});
        }
    })
];

const adminPermitted = [
    body("purchaseId").notEmpty().withMessage("PurchaseId required"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const userData = await tokenUser(req);
            const findUser = await usermodel.findById(userData._id).exec();
            if(!findUser && findUser.role !== "admin"){
               
                return res.status(400).json({
                    error : "admin not found"
                });
            }else{
                await purchasemodel.findByIdAndUpdate(
                    {_id : req.body.purchaseId},
                    {
                        permittedBy : findUser._id,
                        permittedAt : Date.now(),
                    },
                    {new : true, safe : true}
                );
                const purchaseData = await purchasemodel.findById(req.body.purchaseId);
                const findCustomer = await usermodel.findById(purchaseData.userId);
                const packageData = await packagemodel.findById(purchaseData.packageId);
                if(packageData.packageType === "moment"){
                    await usermodel.findByIdAndUpdate(
                        {_id : purchaseData.userId},
                        {
                            postPurchaseId : req.body.purchaseId,
                            postLimit : findCustomer.postLimit + packageData.limit,
                        },
                        {new : true, safe : true},
                    );
                }else if(packageData.packageType === "video"){
                    await usermodel.findByIdAndUpdate(
                        {_id : purchaseData.userId},
                        {
                           videoCallId : req.body.purchaseId,
                        },
                        {new : true, safe : true},
                    );
                }else if(packageData.packageType === "voice"){
                    await usermodel.findByIdAndUpdate(
                        {_id : purchaseData.userId},
                        {
                           voiceCallId : req.body.purchaseId,
                        },
                        {new : true, safe : true},
                    );
                }
                res.status(200);
                res.statusMessage ="Admin permitted successfully"
                res.end();
            }
        }else{
            return res.status(400).json({});
        }
    }),
]

const getPurchaseRequests = asyncHandler(async(req, res)=>{
    const dataList = await purchasemodel.find({
        permittedBy : null,
    });

    return res.status(200).json({
        dataList,
    })
})

module.exports = {
    purchasePackage,
    adminPermitted,
    getPurchaseRequests,
}