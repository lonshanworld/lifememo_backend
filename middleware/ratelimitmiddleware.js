const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 60*1000,
    max: 200,
    standaraHeaders: true,
    legacyHeaders:false,
    message: "Too many api calls. Pleas try again after a few minutes",
    statusCode: 429,
});

module.exports = limiter;