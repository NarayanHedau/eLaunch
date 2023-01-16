const mongoose = require("mongoose");

const Comments = mongoose.Schema({
    comment: { type: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
    commentedOn: { type: mongoose.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Comments", Comments);
