const jwt = require("jsonwebtoken");
const config = { "jwt_secret": "secreteKey"}
module.exports = {
  verify: async (req, res, next) => {
    try {
      const header = req.headers.authorization;
      const token = header.split(" ")[1];
      const isVerified = jwt.verify(token, config.jwt_secret);
      if (isVerified) {
        req["userId"] = isVerified._id;
        next();
      } else {
        return res.status(401).json({
          message: "Unauthorized access.",
        });
      }
    } catch (error) {
      res.status(401).json({
        message: "Invalid Token",
      });
    }
  },
};
