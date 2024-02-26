const express = require("express"); // Import the express module for creating the router
const jwt = require("jsonwebtoken"); // Import the jsonwebtoken module for handling JSON web tokens
const bcrypt = require("bcryptjs"); // Import the bcryptjs module for hashing passwords

const Employee = require("../models/employee.model"); // Import the Employee model
const User = require("../models/user.model"); // Import the User model
const { routes } = require("../config/routes"); // Import the routes object from the routes configuration
const { JWT_SECRET, TOKEN_EXPIRATION } = require("../config/environment"); // Import the JWT_SECRET and TOKEN_EXPIRATION from the environment configuration

const router = express.Router(); // Create a new router using the express.Router() method

/* Dashboard login route */

/**
 * Handles user login
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - JSON object with user roles, permissions, and token
 */
router.post(routes.signin, async (req, res) => {
  // Define a POST route for user login
  try {
    const { username, password } = req.body; // Destructure username and password from the request body

    if (!username || !password) {
      // Check if username or password is missing
      return res.status(400).json({ message: "Complete all fields" }); // Return an error message if fields are incomplete
    }

    const lowerUsername = username.toLowerCase(); // Convert the username to lowercase
    const userExisting = await User.findOne({ username: lowerUsername })
      .populate("roles")
      .exec(); // Find the user by username and populate the roles
    const employeeExisting = await Employee.findOne({ user: userExisting })
      .populate("permissions")
      .exec(); // Find the employee associated with the user and populate the permissions

    if (
      !userExisting ||
      !userExisting.state ||
      !bcrypt.compareSync(password, userExisting.password)
    ) {
      // Check if the user does not exist, is inactive, or the password is incorrect
      return res
        .status(400)
        .json({ message: "Incorrect username or password" }); // Return an error message for incorrect username or password
    }

    const tokenPayload = { id: userExisting._id }; // Create a token payload with the user ID
    const tokenOptions = {
      algorithm: "HS256", // Set the algorithm for the token
      expiresIn: TOKEN_EXPIRATION, // Set the expiration for the token
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, tokenOptions); // Generate a JSON web token

    if (!employeeExisting) {
      // Check if the employee does not exist
      if (userExisting.roles.some((role) => role.name === "SUPER_ADMIN_ROLE")) {
        // Check if the user has the SUPER_ADMIN_ROLE
        return res.json({ roles: userExisting.roles, token: token }); // Return user roles and token for super admin
      } else {
        return res
          .status(400)
          .json({ message: "Incorrect username or password" }); // Return an error message for incorrect username or password
      }
    }

    return res.json({
      // Return user roles, employee permissions, and token
      roles: userExisting.roles,
      permissions: employeeExisting.permissions,
      token: token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message }); // Return an error message for server error
  }
});

/**
 * Handles user signout
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - JSON object with signout message
 */
router.post(routes.signout, async (req, res) => {
  // Define a POST route for user signout
  try {
    req.session = null; // Clear the session
    return res.json({ message: "You've been signed out!" }); // Return a signout message
  } catch (error) {
    return res.status(500).json({ message: error.message }); // Return an error message for server error
  }
});

module.exports = router;
