const express = require('express');
const router = express.Router();
const {protectAuth} = require("../../middleware/tokenauthmiddleware");
const { getPurchaseRequests, purchasePackage, adminPermitted } = require('../../controllers/purchasecontroller');

router.get("/getPurchaseRequest", [protectAuth], getPurchaseRequests);
router.post("/purchasePackage", [protectAuth], purchasePackage);
// router.put("/adminPermitted", [protectAuth], adminPermitted);

module.exports = router;