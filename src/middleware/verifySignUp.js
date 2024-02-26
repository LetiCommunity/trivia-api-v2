// Importing the User and Role models
const User = require("../models/user.model");
const Role = require("../models/role.model");

/**
 * Middleware to check for duplicate username
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {Object} - Returns a JSON object with a message if the username already exists
 */
const checkDuplicateUsername = async (req, res, next) => {
  try {
    // Convert the username to lowercase
    const lowerUsername = req.body.username.toLowerCase();
    // Check if the user with the given username already exists
    const userExisting = await User.exists({ username: lowerUsername });

    // If the user already exists, return a 409 status code with a message
    if (userExisting) {
      return res.status(409).json({ message: "This username already exists" });
    }
    // If the user does not exist, call the next middleware function
    next();
  } catch (error) {
    // If an error occurs, return a 500 status code with an error message
    return res.status(500).json({ message: "Unable to validate Username!" });
  }
};

/**
 * Middleware to check if roles exist
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {Object} - Returns a JSON object with a message if a role does not exist
 */
const checkRolesExisted = (req, res, next) => {
  // Check if the request body contains roles
  if (req.body.roles) {
    // Iterate through the roles in the request body
    for (let i = 0; i < req.body.roles.length; i++) {
      // Check if the role exists in the Role model
      if (!Role.exists({ name: req.body.roles[i] })) {
        // If the role does not exist, return a 400 status code with a message
        return res
          .status(400)
          .json({ message: `Role ${req.body.roles[i]} does not exist` });
      }
    }
  }
  // If all roles exist, call the next middleware function
  next();
};

// Object containing the middleware functions
const verifySignUp = {
  checkDuplicateUsername,
  checkRolesExisted,
};

module.exports = verifySignUp;
