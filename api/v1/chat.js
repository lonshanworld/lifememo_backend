
const express = require("express");
const router = express.Router();
const {getchatId, getchatlist} = require("../../controllers/chatcontroller");

const {protectAuth} = require("../../middleware/tokenauthmiddleware");

router.get("/",[protectAuth],getchatId);
router.get("/getmessages", [protectAuth], getchatlist);





module.exports = router;