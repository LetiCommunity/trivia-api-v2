const express = require("express"); // Importing the express module for creating the router
const bcrypt = require("bcryptjs"); // Importing the bcrypt module for password hashing

const User = require("../models/user.model.js"); // Importing the User model for database operations
const Role = require("../models/role.model.js"); // Importing the Role model for database operations
const { routes } = require("../config/routes.js"); // Importing the routes configuration
const authjwt = require("../middleware/authjwt.js"); // Importing the authentication middleware

const router = express.Router(); // Creating a new router using the express module

/* User routes */

/**
 * Get all users
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Array} - Array of user objects
 */
router.get(
  routes.index,
  [authjwt.verifyToken, authjwt.isSuperAdmin], // Middleware for verifying token and checking super admin role
  async (req, res) => {
    try {
      const users = await User.find().lean(); // Finding all users from the database
      res.json(users); // Sending the array of user objects as a JSON response
    } catch (error) {
      res.status(500).json({ message: error.message }); // Handling errors with status code 500
    }
  }
);

/**
 * Get a user by id
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Object} - User object
 */
router.get(
  routes.show,
  [authjwt.verifyToken, authjwt.isSuperAdmin], // Middleware for verifying token and checking super admin role
  async (req, res) => {
    try {
      const { id } = req.params; // Extracting the user id from the request parameters
      const user = await User.findById(id).lean(); // Finding a user by id from the database
      if (!user) {
        return res.status(404).json({ message: "User not found" }); // Handling user not found with status code 404
      }
      res.json(user); // Sending the user object as a JSON response
    } catch (error) {
      res.status(500).json({ message: error.message }); // Handling errors with status code 500
    }
  }
);

/**
 * Create a user
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Object} - Created user object
 */
router.post(
  routes.create,
  [authjwt.verifyToken, authjwt.isSuperAdmin], // Middleware for verifying token and checking super admin role
  async (req, res) => {
    const { name, surname, phoneNumber, email, username, password } = req.body; // Extracting user data from the request body

    if (!name || !surname || !phoneNumber || !email || !username || !password) {
      return res.status(400).json({ message: "Complete all fields" }); // Handling incomplete fields with status code 400
    }

    const lowerUsername = username.toLowerCase(); // Converting the username to lowercase
    const userExisting = await User.findOne({ username: lowerUsername }).lean(); // Checking if the username already exists

    if (userExisting) {
      return res.status(409).json({ message: "This username already exists" }); // Handling existing username with status code 409
    }

    const roleExisting = await Role.findOne(
      { name: "ADMIN_ROLE" },
      { _id: 1 }
    ).lean(); // Finding the admin role from the database
    const salt = bcrypt.genSaltSync(10); // Generating a salt for password hashing
    const hashedPassword = bcrypt.hashSync(password, salt); // Hashing the user's password

    const newUser = new User({
      name: name,
      surname: surname,
      phoneNumber: phoneNumber,
      email: email,
      username: lowerUsername,
      password: hashedPassword,
      roles: [roleExisting],
      state: true,
    }); // Creating a new user object with hashed password and admin role

    try {
      await newUser.save(); // Saving the new user to the database
      res.json({ message: "The user has been created correctly" }); // Sending success message as a JSON response
    } catch (error) {
      res
        .status(500)
        .json({ message: "The user could not be created: " + error.message }); // Handling errors with status code 500
    }
  }
);

/**
 * Update a user
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Object} - Updated user object
 */
router.put(
  routes.update,
  [authjwt.verifyToken, authjwt.isSuperAdmin], // Middleware for verifying token and checking super admin role
  async (req, res) => {
    const { id } = req.params; // Extracting the user id from the request parameters
    const { name, surname, phoneNumber, email, username } = req.body; // Extracting updated user data from the request body

    if (!name || !surname || !phoneNumber || !username) {
      return res.status(400).json({ message: "Complete all fields" }); // Handling incomplete fields with status code 400
    }

    const lowerUsername = username.toLowerCase(); // Converting the username to lowercase
    const userUpdated = {
      name: name,
      surname: surname,
      phoneNumber: phoneNumber,
      email: email,
      username: lowerUsername,
    }; // Creating an object with updated user data

    try {
      await User.findByIdAndUpdate(id, userUpdated); // Updating the user in the database
      res.json({ message: "The user has been updated correctly" }); // Sending success message as a JSON response
    } catch (error) {
      res
        .status(500)
        .json({ message: "The user could not be updated: " + error.message }); // Handling errors with status code 500
    }
  }
);

/**
 * Delete a user
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Object} - Deleted user object
 */
router.delete(
  routes.delete,
  [authjwt.verifyToken, authjwt.isSuperAdmin], // Middleware for verifying token and checking super admin role
  async (req, res) => {
    const { id } = req.params; // Extracting the user id from the request parameters

    try {
      await User.findByIdAndDelete(id); // Deleting the user from the database
      res.json({ message: "The user has been deleted correctly" }); // Sending success message as a JSON response
    } catch (error) {
      res
        .status(500)
        .json({ message: "The user could not be deleted: " + error.message }); // Handling errors with status code 500
    }
  }
);

module.exports = router; // Exporting the router for use in other modules
