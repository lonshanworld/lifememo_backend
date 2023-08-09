const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({hello : "Heyyyy in v2"})
});

module.exports = router;
