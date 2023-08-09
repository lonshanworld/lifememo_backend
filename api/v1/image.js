const express = require("express");
const router = express.Router();
const {protectAuth} = require("../../middleware/tokenauthmiddleware");
const {imageDetail, createImage} = require("../../controllers/imagecontroller");

router.get("/",[protectAuth],imageDetail);
router.post("/createimage",[protectAuth], createImage)

module.exports = router;