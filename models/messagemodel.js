const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    txt : {type: String, required: true},
    userId : {type: mongoose.Schema.Types.ObjectId, ref: "user", required: true},
    createDate: {type: Date, required: true,default: Date.now},
});

module.exports = mongoose.model("message", messageSchema);