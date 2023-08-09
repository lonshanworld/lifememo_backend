const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    image: {type: Buffer, required : true},
    userId : {type: mongoose.Schema.Types.ObjectId, ref: "user", required: true},
    createDate: {type: Date, required: true,default: Date.now},
});

module.exports = mongoose.model("image", imageSchema);