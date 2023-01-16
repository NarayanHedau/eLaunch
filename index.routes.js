const mongoose = require("mongoose");
const express = require("express");
const app = express();
app.use(express.json());
let jwt = require("jsonwebtoken");
let response = require("./helper/response")
require("./Database/db");
let secreteKey = "secreteKey"
let auth = require("./helper/auth")

require("./model/comments/comments.model");
require("./model/likes/likes.model");
require("./model/user/user.model");

const Comments = mongoose.model("Comments");
const Likes = mongoose.model("Likes");
const User = mongoose.model("User");

const bcrypt = require("bcrypt");
let saltRounds = 10;

app.post("/register", async (req, res) => {
  try {
    const userData = await User.findOne({
      $or: [{ email: req.body.email },
      { mobile: req.body.mobile },]
    })
    if (userData) {
      response.errorMsgResponse(res, 201, "User already registerd")
    } else {
      let data = req.body;
      bcrypt.genSalt(saltRounds, async function (err, salt) {
        bcrypt.hash(data.password, salt, async function (err, hash) {
          data["password"] = hash;
          var user = await new User(data).save();
          if (user) {
            response.successResponse(res, 201, "User registerd successfully", user)
          } else {
            response.errorMsgResponse(res, 301, "Something went wrong")
          }
        })
      });
    }
  } catch (error) {
    console.log(error)
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
})

app.post("/login", async (req, res) => {
  try {
    const { email, mobile, password } = req.body;
    let findUser = await User.findOne({
      $or: [{ email: email }, { mobile: mobile }],
    });

    if (!findUser) {
      response.errorMsgResponse(res, 400, "email or mobile number not found")
    } else {
      findUser = JSON.parse(JSON.stringify(findUser));
      let matchPasword = await bcrypt.compare(password, findUser.password);
      if (matchPasword) {
        let token = await jwt.sign(findUser, secreteKey, {
          expiresIn: "24h",
        });
        findUser["token"] = `Bearer ${token}`;
        response.successResponse(res, 200, "User login successfully", findUser)
      } else {
        response.errorMsgResponse(res, 400, "email or password is incorrect")
      }
    }
  } catch (error) {
    console.log(error);
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
});

app.get("/get/profile", auth.verify, async (req, res) => {
  try {
    let userId = req.userId
    let userData = await User.findOne({ _id: userId }).select("-password -createdAt -updatedAt -__v")
    response.successResponse(res, 200, "User data fetched successfully", userData)
  } catch (error) {
    console.log(error);
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
})

app.put("/update/profile", auth.verify, async (req, res) => {
  try {
    let userId = req.userId
    let updateUser = await User.findOneAndUpdate({ _id: userId }, { $set: req.body })
    if (updateUser) {
      updateUser = await User.findOne({ _id: userId })
      response.successResponse(res, 200, "User Updated successfully", updateUser)
    }
  } catch (error) {
    console.log(error);
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
})

app.post("/likeDislike", auth.verify, async (req, res) => {
  try {
    let userId = req.userId
    let updatedData
    let isLike = req.query.isLike

    let likeData = await Likes.findOne({ likedBy: userId });
    if (likeData) {
      updatedData = await Likes.findOneAndUpdate({ likedBy: userId }, { $set: { isLike: isLike } }, { $new: true });
      return response.successResponse(res, 200, "like updated successfully", {})
    }
    updatedData = await Likes({ likedBy: userId, isLike: isLike }).save()
    return response.successResponse(res, 200, "like added successfully", {})
  } catch (error) {
    console.log(error);
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
})

app.post("/addComment", auth.verify, async (req, res) => {
  try {
    let userId = req.userId
    let commentData = await Comments.findOne({ createdBy: userId , commentedOn: req.body.commentedOn})
    if (commentData) {
      response.successResponse(res, 409, "Comment already exist")
    } else {
      let addObj = { ...req.body, createdBy: userId }
      let addComment = await Comments(addObj).save();
      response.successResponse(res, 200, "Comment added successful", addComment)
    }
  } catch (error) {
    console.log(error);
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
})

app.get("/getLikeAndCommentcount", auth.verify, async (req, res) => {
  try {
    let userId = req.userId
    let likeCount = await Likes.countDocuments({ likedBy: userId })
    let commentCount = await Comments.countDocuments({ commentedOn: userId })
    let result = {
      likeCount: likeCount,
      commentCount: commentCount
    }
    response.successResponse(res, 200, "count fetched successfully", result)
  } catch (error) {
    console.log(error);
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
})

app.listen(3000, () => {
  console.log("Port is Connected on 3000");
});
