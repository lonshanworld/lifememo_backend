const mongoose = require("mongoose");

const packageScheme = new mongoose.Schema({
    packageName : {type : String, required : true},
    packageType : {type : String, required : true ,  enum : ["voice", "video", "post"]},
    content : { type : String, required : true},
    limit : {type : Number, required : false , default : 0},
    isUnlimited : { type : Boolean, required : false , default : false},
    createDate : {type : Date, required : false, default : Date.now},
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true,
    }
});

module.exports = mongoose.model("package" , packageScheme);