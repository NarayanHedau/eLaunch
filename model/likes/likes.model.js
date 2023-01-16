const mongoose = require("mongoose");

const Likes = new mongoose.Schema(
  {
    isLike: { type: Boolean, default: false },
    likedBy: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Likes", Likes);
