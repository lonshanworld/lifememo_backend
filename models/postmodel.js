const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    bodyText : {type: mongoose.Schema.Types.ObjectId, ref: "message", required: false, default:null },
    bodyImage : {type: mongoose.Schema.Types.ObjectId, required: false, default: null},
    postType : {
        type: String,
        required: true,
        enum: ["public", "onlyfriend", "onlyme"],
        default: "public",
    },
    createDate: {type: Date, default: Date.now},
    likedBy : [{type: mongoose.Schema.Types.ObjectId, ref: "user", required: false, default: []}],
    messages : [{type: mongoose.Schema.Types.ObjectId, ref: "message", required: false, default: []}],
    images : [{type: mongoose.Schema.Types.ObjectId, ref : "image", required :false, default : []}],
    shares : [{type: mongoose.Schema.Types.ObjectId, ref: "user", required: false, default: []}],
});

module.exports = mongoose.model("post", postSchema);