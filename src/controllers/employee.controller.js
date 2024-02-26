const express = require("express"); // Importing the express module for creating the router
const bcrypt = require("bcryptjs"); // Importing the bcrypt module for password hashing

const Employee = require("../models/employee.model.js"); // Importing the Employee model
const User = require("../models/user.model.js"); // Importing the User model
const Role = require("../models/role.model.js"); // Importing the Role model
const { routes } = require("../config/routes.js"); // Importing the routes configuration
const authjwt = require("../middleware/authjwt.js"); // Importing the authentication middleware
const verifySignUp = require("../middleware/verifySignUp"); // Importing the sign-up verification middleware

const router = express.Router(); // Creating a new router using express

/* Employee routes */

/**
 * Get all employees
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Array} - Array of employee objects
 */
router.get(
  routes.index,
  [authjwt.verifyToken, authjwt.isSuperAdmin], // Middleware for verifying token and super admin role
  async (req, res) => {
    try {
      const employees = await Employee.find() // Finding all employees
        .populate("user") // Populating the user field
        .populate("permissions") // Populating the permissions field
        .lean() // Converting the result to plain JavaScript objects
        .exec(); // Executing the query
      res.json(employees); // Sending the array of employee objects as JSON response
    } catch (error) {
      res.status(500).json({ message: error.message }); // Handling and sending error message
    }
  }
);

/**
 * Get an employee by id
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Object} - Employee object
 */
router.get(
  routes.show,
  [authjwt.verifyToken, authjwt.isSuperAdmin], // Middleware for verifying token and super admin role
  async (req, res) => {
    try {
      const { id } = req.params; // Extracting the id from request parameters
      const employee = await Employee.findById(id) // Finding an employee by id
        .populate("user") // Populating the user field
        .lean() // Converting the result to plain JavaScript object
        .exec(); // Executing the query
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" }); // Handling and sending error message if employee not found
      }
      res.json(employee); // Sending the employee object as JSON response
    } catch (error) {
      res.status(500).json({ message: error.message }); // Handling and sending error message
    }
  }
);

/**
 * Create an employee
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Object} - Success message or error message
 */
router.post(
  routes.create,
  [
    verifySignUp.checkDuplicateUsername, // Middleware for checking duplicate username
    authjwt.verifyToken, // Middleware for verifying token
    authjwt.isSuperAdmin, // Middleware for verifying super admin role
  ],
  async (req, res) => {
    // Destructuring request body
    const {
      name,
      surname,
      phoneNumber,
      email,
      username,
      password,
      local,
      permissions,
    } = req.body;

    // Checking if all required fields are present
    if (
      !name ||
      !surname ||
      !phoneNumber ||
      !email ||
      !username ||
      !password ||
      !local ||
      !permissions
    ) {
      return res.status(400).json({ message: "Complete all fields" }); // Handling and sending error message if fields are missing
    }

    const lowerUsername = username.toLowerCase(); // Converting username to lowercase
    const roleExisting = await Role.find({
      name: { $ne: "SUPER_ADMIN_ROLE" }, // Finding roles excluding super admin role
    });

    const salt = bcrypt.genSaltSync(10); // Generating salt for password hashing
    const hashedPassword = bcrypt.hashSync(password, salt); // Hashing the password

    const newUser = new User({
      name: name,
      surname: surname,
      phoneNumber: phoneNumber,
      email: email,
      username: lowerUsername,
      password: hashedPassword,
      roles: roleExisting,
      state: true,
    });

    try {
      const savedUser = await User.create(newUser); // Creating a new user
      const newEmployee = new Employee({
        user: savedUser._id,
        local: local,
        permissions: [permissions],
      });
      await Employee.create(newEmployee); // Creating a new employee
      res.json({ message: "The employee has been created correctly" }); // Sending success message
    } catch (error) {
      res.status(500).json({
        message: "The employee could not be created: " + error.message,
      }); // Handling and sending error message
    }
  }
);

/**
 * Update an employee
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Object} - Success message or error message
 */
router.put(
  routes.update,
  [authjwt.verifyToken, authjwt.isSuperAdmin], // Middleware for verifying token and super admin role
  async (req, res) => {
    const { id } = req.params; // Extracting the id from request parameters
    const { name, surname, phoneNumber, email, local, permissions } = req.body; // Destructuring request body

    // Checking if all required fields are present
    if (!name || !surname || !phoneNumber || !email || !local || !permissions) {
      return res.status(400).json({ message: "Complete all fields" }); // Handling and sending error message if fields are missing
    }

    const updatedUser = {
      name: name,
      surname: surname,
      phoneNumber: phoneNumber,
      email: email,
    };

    try {
      const updatedUserDoc = await User.findByIdAndUpdate(
        id,
        updatedUser
      ).lean(); // Updating the user document
      const updatedEmployee = await Employee.findOneAndUpdate(
        { user: id },
        { local: local, permissions: [permissions] }
      ); // Updating the employee document
      res.json({ message: "The employee has been updated correctly" }); // Sending success message
    } catch (error) {
      res.status(500).json({
        message: "The employee could not be updated: " + error.message,
      }); // Handling and sending error message
    }
  }
);

/**
 * Delete an employee
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Object} - Success message or error message
 */
router.delete(
  routes.delete,
  [authjwt.verifyToken, authjwt.isSuperAdmin], // Middleware for verifying token and super admin role
  async (req, res) => {
    const { id } = req.params; // Extracting the id from request parameters
    try {
      await Employee.findByIdAndDelete(id); // Deleting the employee by id
      res.json({ message: "The employee has been deleted correctly" }); // Sending success message
    } catch (error) {
      res.status(500).json({
        message: "The employee could not be deleted: " + error.message,
      }); // Handling and sending error message
    }
  }
);

module.exports = router;
