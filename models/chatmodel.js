const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    }],
    createDate: {type: Date, default: Date.now},
    chatList: [{
        type: String,
        default: [],
    }],
});

chatSchema.path("users").validate(function (value) {
    return value.length <= 2;
  }, "Chat user exceeds the limit of 2");
  

module.exports = mongoose.model("chat", chatSchema);