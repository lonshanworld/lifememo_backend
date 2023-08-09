const asyncHandler = require("express-async-handler");
const postModel = require("../models/postmodel");
const imageModel = require("../models/imagemodel");
const messageModel = require("../models/messagemodel");
const userModel = require("../models/usermodel");
const multer = require("multer");
const tokenUser = require("../utils/getIdfromToken");
const {query, validationResult, matchedData} = require("express-validator");
const getImageUrl = require("../utils/imageconvert");
const imagemodel = require("../models/imagemodel");

const upload = multer();

const sendPost = [
    upload.any(),
    asyncHandler(async(req, res)=>{
        let newmessage;
        let newImage;
        if(req.body.txt){
            newmessage = new messageModel({
                txt: req.body.txt,
            });
        }

        if(req.files.length !== 0){
            newImage = new imageModel({
                image:  req.files[0].buffer,
            });
        }

        let newpost = new postModel({
            bodyText: newmessage ? newmessage._id : null,
            bodyImage: newImage ? newImage._id : null,
            postType : req.body.postType,
        });

        let user = await tokenUser(req);
        if(user){
            if(newImage){
                newImage.userId = user._id;
                await newImage.save()
            };

            if(newmessage){
                newmessage.userId = user._id;
                await newmessage.save();
            }

            await newpost.save();

            user.posts.push(newpost._id);
            await user.save();

            res.status(200).send({
                message : "Posted successfully",
            });
        }else{
            res.status(404);
            res.statusMessage = "You cannot post";
            res.end();    
        }
    }),
];


const deletepost = [
    query("postId").notEmpty().escape().withMessage("Something wrong with your query"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const data = matchedData(req);
            const userData = await tokenUser(req);
            const otheruser = await userModel.findOne({posts : data.postId}).exec();
        
            if(userData._id.equals(otheruser._id)){
                await postModel.findByIdAndRemove(data.postId).then(async(success)=>{
                    await userModel.findByIdAndUpdate(
                        {_id : otheruser._id},
                        {$pull : {posts : data.postId}},
                        {new : true, safe : true},
                    ).then((suc)=>{
                        res.status(200).end();
                    }).catch((err)=>{
                        res.status(500);
                        res.statusMessage = "Something went wrong";
                        res.end();
                    });

                }).catch((err)=>{
                    res.status(404);
                    res.statusMessage = "Post not found";
                    res.end();
                });
            }else{
                res.status(400);
                res.statusMessage = "You don't have enough permission to delete the post";
                res.end();
            }
        }else{
            res.status(400);
            res.statusMessage = "Wrong query";
            res.end();
        }
    }),
];


const getPost = [
    query("postId").notEmpty().escape().withMessage("Something wrong with your query."),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const data = matchedData(req);
            const postdetailInfo = await postModel.findById(data.postId);

            if(postdetailInfo){
                const imagedata = postdetailInfo.bodyImage === null ? null : await imageModel.findById(postdetailInfo.bodyImage._id).select("-_id -__v -createDate -userId");
                const txtdata =  postdetailInfo.bodyText === null ? null : await messageModel.findById(postdetailInfo.bodyText._id).select("-_id -__v -createDate -userId");
                const userdata = await userModel.findOne({posts : postdetailInfo._id}).exec();

            
                const postdetail = {
                    postId : postdetailInfo._id,
                    userId : userdata._id,
                    userName: userdata.userName,
                    createDate : postdetailInfo.createDate,
                    image : imagedata === null ? null : imagedata.image,
                    text : txtdata === null ? null : txtdata.txt,
                    likes : postdetailInfo.likedBy,
                    contributes : postdetailInfo.shares,
                    messages : postdetailInfo.messages,
                }

                res.status(200).send({
                    message: {postdetail},
                });
            }else{
                res.status(404);
                res.statusMessage = "Post not found";
                res.end();
            }
        }else{
            res.status(400);
            res.statusMessage = "Wrong query";
            res.end();
        }
    }),
];


const getPostbyNum = [
    query("startnum").notEmpty().escape().withMessage("Something wrong with your query"),
    query("amount").notEmpty().escape().withMessage("Something wrong with your query"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const data = matchedData(req);


            const allposts = await postModel.find({postType : "public"}).skip(data.startnum).limit(data.amount).sort({createDate : "desc"}).select("_id").exec();
        

            res.status(200).send({
                "message" : {allposts}
            });

        }else{
            res.status(400);
            res.statusMessage = "Wrong query";
            res.end();
        }
    }),
];


const givelikes = [
    query("postId").notEmpty().escape().withMessage("Something wrong with your query"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const data = matchedData(req);
            const userData = await tokenUser(req);

            await postModel.findByIdAndUpdate(
                {_id : data.postId},
                {$addToSet : {likedBy : userData._id}},
                {new : true, safe:true}
            ).exec().then((success) =>{
                res.status(200);
                // res.statusMessage = success.toString();
                res.end();
            }).catch((err)=>{
                res.status(400);
                // res.statusMessage = err.toString();
                res.end();
            });

            // const oldpost = await postModel.findById(data.postId);
            // res.status(200).send(userData._id);
        }else{
            res.status(400);
            res.statusMessage = "Wrong query";
            res.end();
        }
    }),
];


const deletelike = [
    query("postId").notEmpty().escape().withMessage("Something wrong with your query"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const data = matchedData(req);
            const userdata = await tokenUser(req);

            await postModel.findByIdAndUpdate(
                {_id : data.postId},
                {$pull : {likedBy : userdata._id}},
                {new : true, safe:true},
            ).then((success)=>{
                res.status(200).end();
            }).catch((err)=>{
                res.status(500);
                res.statusMessage = "Something went wrong. Please try again later";
                res.end();
            });
        }else{
            res.status(400);
            res.statusMessage = "Wrong query";
            res.end();
        }
    }),
];


const givecomment = [
    upload.any(),
    query("postId").notEmpty().escape().withMessage("Something wrong with your query"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const data = matchedData(req);
            const userData = await tokenUser(req);
            const newmessage = new messageModel({
                txt: req.body.text,
                userId : userData._id,
            });
            await newmessage.save();
            await postModel.findByIdAndUpdate(
                {_id: data.postId},
                {$addToSet : {messages : newmessage._id}},
                {new : true, safe:true},
            ).exec().then((success) =>{
                res.status(200);
                res.end();
            }).catch((err)=>{
                res.status(400);
                res.statusMessage = err.toString();
                res.end();
            });
        }else{
            res.status(400);
            res.statusMessage = "Wrong query";
            res.end();
        }
    }),
];


const deletecomment = [
    query("postId").notEmpty().escape().withMessage("Something wrong with your query"),
    query("commentId").notEmpty().escape().withMessage("Something went wrong with your query"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const data = matchedData(req);
    
            await postModel.findByIdAndUpdate(
                {_id : data.postId},
                {$pull : {messages : data.commentId}},
                {new : true, safe:true},
            ).exec().then(async(success)=>{
                await messageModel.findByIdAndDelete(data.commentId).exec().then((success)=>{
                    res.status(200).end();
                }).catch((err)=>{
                    res.status(500);
                    res.statusMessage = "Something went wrong. Please try again later";
                    res.end();
                });
            }).catch(()=>{
                res.status(500);
                res.statusMessage = "Something went wrong. Please try again later";
                res.end();
            });
        }else{
            res.status(400);
            res.statusMessage = "Wrong query";
            res.end();
        }
    }),
];


const share = [
    query("postId").notEmpty().escape().withMessage("Something wrong with your query"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const data = matchedData(req);
            const userData = await tokenUser(req);

            await postModel.findByIdAndUpdate(
                {_id : data.postId},
                {$addToSet : {shares : userData._id}},
                {new : true, safe:true},
            ).exec().then(async(success) =>{

                userData.shareposts.push(data.postId);
                await userData.save().then((ok)=>{
                    res.status(200);
                    // res.statusMessage = success.toString();
                    res.end();
                }).catch((e)=>{
                    res.status(400);
                    // res.statusMessage = err.toString();
                    res.end();
                })
                
            }).catch(async(err)=>{
                res.status(400);
                // res.statusMessage = err.toString();
                res.end();
            });
        }else{
            res.status(400);
            res.statusMessage = "Wrong query";
            res.end();
        }
    }),
];


const removeshare = [
    query("postId").notEmpty().escape().withMessage("Something wrong with your query"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const data = matchedData(req);
            const userData = await tokenUser(req);

            await postModel.findByIdAndUpdate(
                {_id : data.postId},
                {$pull : {shares : userData._id}},
                {new : true, safe:true},
            ).exec().then((success)=>{
                res.status(200).end();
            }).catch((err)=>{
                res.status(500);
                res.statusMessage = "Something went wrong. Please try again later";
                res.end();
            });
        }else{
            res.status(400);
            res.statusMessage = "Wrong query";
            res.end();
        }
    }),
];


const postdetail = [
    query("postId").notEmpty().escape().withMessage("Something wrong with your query"),
    asyncHandler(async(req, res)=>{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            const data = matchedData(req);
            
            const singlepost = await postModel.findById(data.postId).exec();
            if(singlepost){
                
                const userdata = await userModel.findOne({posts : data.postId}).select("_id userName profileImg").exec();
                const userprofile = await imageModel.findById(userdata.profileImg).exec();
                const imageurl = userprofile === null ? null : await getImageUrl(userprofile.image.buffer);
                const posttext = singlepost.bodyText !== null ? await messageModel.findById(singlepost.bodyText).exec(): null;
                const txt = singlepost.bodyText !== null ? posttext.txt : null;
                const postimage = singlepost.bodyImage !== null ? await imagemodel.findById(singlepost.bodyImage).exec() : null;
                const postimageurl = singlepost.bodyImage !== null ? await getImageUrl(postimage.image.buffer) : null;

                let likeList = [];
                let shareList = [];
                let messageList = [];
                let imageList = [];
                // function getalldata(){
                //     likeList = singlepost.likedBy.map(async(id) =>{
                //         const likeperson = await userModel.findById(id).select("_id userName profileImg").exec();
                //         const imagedata = await imageModel.findById(userdata.profileImg).exec();
                //         const imagedataurl = await getImageUrl(imagedata.image.buffer);
                //         const singleLike = {
                //             id : likeperson._id,
                //             name : likeperson.userName,
                //         };
                //         return singleLike;
                //     });
                    
                // }

                for(let a = 0; a< singlepost.likedBy.length; a++){
                    const likeperson = await userModel.findById(singlepost.likedBy[a]).select("_id userName profileImg").exec();
                    const imagedata =likeperson.profileImg !== null ? await imageModel.findById(likeperson.profileImg).exec() : null;
                    const imagedataurl =likeperson.profileImg !== null ? await getImageUrl(imagedata.image.buffer) : null;
                    const singleLike ={
                        id : likeperson._id,
                        name : likeperson.userName,
                        image : imagedataurl,
                    };
                    likeList.push(singleLike);
                }

                for(let a = 0; a< singlepost.shares.length; a++){
                    const person = await userModel.findById(singlepost.shares[a]).select("_id userName profileImg").exec();
                    const imagedata =person.profileImg !== null ? await imageModel.findById(person.profileImg).exec() : null;
                    const imagedataurl =person.profileImg !== null ? await getImageUrl(imagedata.image.buffer) : null;
                    const singleshare ={
                        id : person._id,
                        name : person.userName,
                        image : imagedataurl,
                    };
                    shareList.push(singleshare);
                }


                for(let b = 0 ; b < singlepost.messages.length; b++){
                    const messagedata = await messageModel.findById(singlepost.messages[b]).exec();
                    const persondata = await userModel.findById(messagedata.userId).select("_id userName profileImg").exec();
                    const imagedata = persondata.profileImg !== null ? await imageModel.findById(persondata.profileImg).exec() : null;
                    const imagedataUrl = persondata.profileImg !== null ? await getImageUrl(imagedata.image.buffer) : null;

                    const singlemessage = {
                        id : persondata._id,
                        name : persondata.userName,
                        messageid : messagedata._id,
                        message : messagedata.txt,
                        createDate : messagedata.createDate,
                        image : imagedataUrl,
                    };
                    messageList.push(singlemessage);
                }

                for(let b = 0 ; b< singlepost.images.length; b++){
                    const commentimagedata = await imageModel.findById(singlepost.images[b]).exec();
                    const commentimageUrl = await getImageUrl(commentimagedata.image.buffer);
                    const persondata = await userModel.findById(commentimagedata.userId).select("_id userName profileImg").exec();
                    const personImage = persondata.profileImg !== null ? await imageModel.findById(persondata.profileImg).exec() : null;
                    const personImageUrl = persondata.profileImg !== null ? await getImageUrl(personImage.image.buffer) : null;

                    const singleImage = {
                        id : persondata._id,
                        name : persondata.userName,
                        imageid : commentimagedata._id,
                        personImage : personImageUrl,
                        commentImage : commentimageUrl,
                        createDate : commentimagedata.createDate,
                    };
                    imageList.push(singleImage);
                }
            
                // res.status(200).send(likeList);

                res.status(200).send({
                    postDetail : {
                        createrData : {
                            id : userdata._id,
                            userName : userdata.userName,
                            profileImg : imageurl,
                        },
                        postData : {
                            id : singlepost._id,
                            bodyText : txt,
                            bodyImageUrl : postimageurl,
                            postType : singlepost.postType,
                            createDate : singlepost.createDate,
                            likedBy : singlepost.likedBy,
                            messages : singlepost.messages,
                            images : singlepost.images,
                            shares : singlepost.shares,
                        },
                        likeList,
                        shareList,
                        messageList,
                        imageList,
                    },
                });
            }else{
                res.status(404);
                res.statusMessage = "Post not found";
                res.end();
            }
        }else{
            res.status(400);
            res.statusMessage = "Wrong query";
            res.end();
        }
    }),
];

module.exports = {
    sendPost,
    deletepost,
    getPost,
    getPostbyNum,
    givelikes,
    deletelike,
    givecomment,
    deletecomment,
    share,
    removeshare,
    postdetail,
};