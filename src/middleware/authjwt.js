const jwt = require("jsonwebtoken");

const User = require("../models/user.model.js");
const { JWT_SECRET } = require("../config/environment");

verifyToken = (req, res, next) => {
  //const token = req.cookies.token;
  const token = req.headers.token;

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).send({ message: "Unauthorized! " + error.message });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate("Role");

    for (let i = 0; i < user.roles.length; i++) {
      if (user.roles[i].name === "ADMIN_ROLE") {
        return next();
      }
    }

    return res.status(403).json({ message: "Require Admin role" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to validate User role!" });
  }
};

isUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate("Role");

    for (let i = 0; i < user.roles.length; i++) {
      if (user.roles[i].name === "USER_ROLE") {
        return next();
      }
    }

    return res.status(403).json({ message: "Require Admin role" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to validate User role!" });
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
  isUser,
};

module.exports = authJwt;
