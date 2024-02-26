const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/user.model");
const Role = require("../models/role.model");
const verifySignUp = require("../middleware/verifySignUp");
const { routes } = require("../config/routes");
const { JWT_SECRET, TOKEN_EXPIRATION } = require("../config/environment");

const router = express.Router();

/* Login route */

/**
 * Signup route
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object with a message
 */
router.post(
  routes.signup,
  [verifySignUp.checkDuplicateUsername],
  async (req, res) => {
    try {
      // Destructure request body
      const { name, surname, phoneNumber, email, username, password } =
        req.body;

      // Check for required fields
      if (!name || !surname || !phoneNumber || !username || !password) {
        return res
          .status(400)
          .json({ message: "Complete the required fields" });
      }

      // Lowercase the username
      const lowerUsername = username.toLowerCase();
      // Generate salt and hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Find user role
      const role = await Role.findOne({ name: "USER_ROLE" }, { _id: 1 });

      // Create new user
      const newUser = new User({
        name: name,
        surname: surname,
        phoneNumber: phoneNumber,
        email: email,
        username: lowerUsername,
        password: hashedPassword,
        roles: [role],
        state: true,
      });

      // Save new user
      await newUser.save();
      res.json({ message: "The user has been created correctly" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * Login route
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object with a token
 */
router.post(routes.signin, async (req, res) => {
  try {
    // Destructure request body
    const { username, password } = req.body;

    // Check for required fields
    if (!username || !password) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    // Lowercase the username
    const lowerUsername = username.toLowerCase();
    // Find user and populate roles
    const userExisting = await User.findOne({
      username: lowerUsername,
    }).populate("roles");

    // Check if user exists
    if (!userExisting) {
      return res
        .status(400)
        .json({ message: "Incorrect username or password" });
    }

    // Check if user account is active
    if (!userExisting.state) {
      return res.status(400).json({ message: "This account has been deleted" });
    }
    //Compare passwords
    const isPasswordValid = await bcrypt.compare(
      password,
      userExisting.password
    );
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Incorrect username or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: userExisting._id }, JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: TOKEN_EXPIRATION,
    });
    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * Reset password route
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object with a message
 */
router.patch(routes.resetPassword, async (req, res) => {
  try {
    // Destructure request body
    const { phoneNumber, newPassword } = req.body;

    // Check for required fields
    if (!phoneNumber || !newPassword) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    // Find user by phone number
    const userExisting = await User.findOne({ phoneNumber });

    // Check if user exists
    if (!userExisting) {
      return res.status(409).json({ message: "User not found" });
    }

    // Generate salt and hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(userExisting._id, {
      password: hashedPassword,
    });
    res.json({ message: "The password has been updated correctly" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * Sign out route
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object with a message
 */
router.post(routes.signout, async (req, res) => {
  try {
    // Clear session
    req.session = null;
    return res.json({ message: "You've been signed out!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
