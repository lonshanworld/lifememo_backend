const express = require('express');
const router = express.Router();
const {protectAuth} = require("../../middleware/tokenauthmiddleware");
const {sendPost, getPost, getPostbyNum, givelikes, givecomment, share, deletepost, deletelike, removeshare, deletecomment, postdetail} = require("../../controllers/postcontroller");

router.get("/getpost",[protectAuth], getPost);
router.get("/",[protectAuth], getPostbyNum);

router.post("/sendpost",[protectAuth], sendPost);
router.post("/deletepost",[protectAuth], deletepost);
router.post("/givelikes",[protectAuth], givelikes);
router.post("/deletelike",[protectAuth],deletelike);
router.post("/givecomment",[protectAuth], givecomment);
router.post("/deletecomment",[protectAuth], deletecomment);
router.post("/share",[protectAuth],share);
router.post("/removeshare",[protectAuth], removeshare);

router.get("/postdetail",[protectAuth], postdetail);


module.exports = router;