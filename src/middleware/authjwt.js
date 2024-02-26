const jwt = require("jsonwebtoken"); // Importing the jsonwebtoken library for handling JWT tokens

const User = require("../models/user.model.js"); // Importing the User model from the user.model.js file
const { JWT_SECRET } = require("../config/environment"); // Importing the JWT_SECRET from the environment configuration

/**
 * Middleware to verify the JWT token
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {void}
 */
const verifyToken = (req, res, next) => {
  const token = req.headers.token; // Extracting the token from the request headers

  if (!token) {
    return res.status(403).send({ message: "No token provided!" }); // Sending an error response if no token is provided
  }

  jwt.verify(token, JWT_SECRET, (error, decoded) => {
    // Verifying the token using the JWT_SECRET
    if (error) {
      return res
        .status(401)
        .send({ message: "Unauthorized! " + error.message }); // Sending an error response if the token is unauthorized
    }
    req.userId = decoded.id; // Setting the userId in the request object from the decoded token
    next(); // Calling the next middleware function
  });
};

/**
 * Function to check user role
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @param {string} roleName - The role name to check
 * @returns {Promise<void>}
 */
const checkUserRole = async (req, res, next, roleName) => {
  try {
    const user = await User.findById(req.userId).populate("roles").exec(); // Finding the user by userId and populating the roles
    for (let i = 0; i < user.roles.length; i++) {
      if (user.roles[i].name === roleName) {
        return next(); // Calling the next middleware function if the user has the specified role
      }
    }
    return res.status(403).json({ message: `Require ${roleName} role` }); // Sending an error response if the user does not have the specified role
  } catch (error) {
    return res
      .status(500)
      .json({
        message: `Unable to validate ${roleName} role! ${error.message}`,
      }); // Sending an error response if unable to validate the role
  }
};

/**
 * Middleware functions to check user roles
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {void}
 */
const isSuperAdmin = (req, res, next) =>
  checkUserRole(req, res, next, "SUPER_ADMIN_ROLE"); // Middleware function to check if the user is a super admin

/**
 * Middleware functions to check user roles
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {void}
 */
const isAdmin = (req, res, next) => checkUserRole(req, res, next, "ADMIN_ROLE"); // Middleware function to check if the user is an admin

/**
 * Middleware functions to check user roles
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {void}
 */
const isUser = (req, res, next) => checkUserRole(req, res, next, "USER_ROLE"); // Middleware function to check if the user is a regular user

// Object containing all the middleware functions
const authJwt = {
  verifyToken,
  isSuperAdmin,
  isAdmin,
  isUser,
};

module.exports = authJwt; // Exporting the authJwt object containing the middleware functions
