const User = require("../models/user.model");
const Role = require("../models/role.model");
//const { check } = require("express-validator");

checkDuplicateUsername = async (req, res, next) => {
  try {
    const lowerUsername = req.body.username.toLowerCase();
    const userExisting = await User.findOne({ username: lowerUsername });

    if (userExisting) {
      return res.status(409).json({ message: "This username already exists" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Unable to validate Username!" });
  }
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.role.length; i++) {}
  }
};

const verifySignUp = {
  checkDuplicateUsername,
  checkRolesExisted,
};

module.exports = verifySignUp;
