const mongoose = require("mongoose");

const callSchema = new mongoose.Schema({
    callType : {
        type : String,
        required : true,
        enum : ["voice", "video"],
        default : "voice",
    },
    isSuccess : {
        type: Boolean,
        required : true,
        default : false,
    },
    createDate : {type : Date, default : Date.now},
});

module.exports = mongoose.model("call", callSchema);