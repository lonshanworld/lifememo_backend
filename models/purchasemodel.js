const mongoose = require("mongoose");

const purchaseScheme = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true,
    },
    packageId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "package",
        required : true,
    },
    createDate : {
        type : Date,
        required : false,
        default : Date.now
    },
    permittedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : false,
    },
    permittedAt : {
        type : Date,
        required : false,
    }
});

module.exports = mongoose.model("purchase", purchaseScheme);