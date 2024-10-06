const express = require('express');
const router = express.Router();
const {protectAuth} = require("../../middleware/tokenauthmiddleware");
const {createPackage, deletePackage, getPackages} = require("../../controllers/packagecontroller");

router.post("/createPackage",[protectAuth], createPackage );
router.delete("/deletePackage", [protectAuth], deletePackage);
router.get("/getPackages", [protectAuth], getPackages);

module.exports = router;