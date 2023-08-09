const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    userName: {type: String, required: true, maxlength: 200},
    email: {type: String, required: true, maxlength: 200},
    password: {type: String, required: true, minlength: 8, maxlength: 200},
    birthDate: {type: Date, required: true},
    createDate: {type: Date, required: false ,default: Date.now},
    profileImg: {type: mongoose.Schema.Types.ObjectId, ref:"image", required: false,},
    friends : [{type: mongoose.Schema.Types.ObjectId, ref: "user", required: false, default: []}],
    chats: [{type: mongoose.Schema.Types.ObjectId, ref: "chat", required: false, default: []}],
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: "post", required: false, default: []}],
    shareposts: [{type: mongoose.Schema.Types.ObjectId, ref: "post", required: false, default: []}],
});

module.exports = mongoose.model("user", userSchema);