const tokenUser = require("../utils/getIdfromToken");
const {query, validationResult, matchedData} = require("express-validator");
const asyncHandler = require("express-async-handler");
const usermodel = require("../models/usermodel");
const chatmodel = require("../models/chatmodel");
const messagemodel = require("../models/messagemodel");
const { all } = require("../api/v1/chat");

const getchatId = [
    query("friendId").notEmpty().escape().withMessage("Something wrong with your query"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const data = matchedData(req);
            const userData = await tokenUser(req);
            const friendata = await usermodel.findById(data.friendId).exec();
            if(friendata){
                const checkId = await chatmodel.findOne({users : {$all : [userData._id, friendata._id]}}).exec();
                if(checkId){
                    // await chatmodel.deleteMany({});
                    res.status(200).send({
                        chatId : checkId._id
                    });
                }else{
                    const newchatId = new chatmodel({
                        users : [userData._id, friendata._id],
                    });
                    await newchatId.save().then(async(success)=>{
                        userData.chats.push(newchatId._id);
                        friendata.chats.push(newchatId._id);
                        await userData.save();
                        await friendata.save();
                        res.status(200).send({
                            chatId : newchatId._id,
                        });
                    }).catch((err)=>{
                        res.status(400);
                        res.statusMessage = err.toString();
                        res.end();
                    });
                }    
 
            }else{
                res.status(400);
                res.statusMessage = "User not found";
                res.end();
            }
        }else{
            res.status(400);
            res.statusMessage = "Wrong query";
            res.end();
        }
    }),
];

const getchatlist = [
    query("chatId").notEmpty().escape().withMessage("Chat Id cannot be empty"),
    query("startnum").notEmpty().escape().withMessage("Something wrong with your query"),
    query("amount").notEmpty().escape().withMessage("Something wrong with your query"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const data = matchedData(req);

            // const allchatlist = await chatmodel.findById(data.chatId,{chatList : {$slice : [0,3]}}).exec();
            const allchatlist = await chatmodel.findById(data.chatId).select("chatList").exec();

           
            // allchatlist["chatList"].forEach((e)=>{
            //     alllist.push(e);
            // });
            let alllist = [];
            const reversedchatlist = allchatlist["chatList"].reverse();
            const startint = parseInt(data.startnum);
            const amount = parseInt(data.amount);
            for(let b = startint ; b< amount; b++){
                const msg = await messagemodel.findById(reversedchatlist[b]).exec();

                if(msg !== null){
                    alllist.push(msg);
                }
        
                
            }
            res.status(200).send(alllist);

        }else{
            res.status(400);
            res.statusMessage = "Wrong query";
            res.end();
        }
    }),
];

module.exports = {
    getchatId,
    getchatlist,
};