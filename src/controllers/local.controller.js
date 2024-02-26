const express = require("express"); // Import the express module

const Local = require("../models/local.model.js"); // Import the Local model
const { routes } = require("../config/routes.js"); // Import the routes configuration
const authjwt = require("../middleware/authjwt.js"); // Import the authjwt middleware

const router = express.Router(); // Create a new router using express.Router()
const authMiddleware = [authjwt.verifyToken, authjwt.isSuperAdmin]; // Define an array of middleware functions for authentication

/* User routes */

/**
 * Get all locals
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Array} - An array of local objects
 */
router.get(routes.index, authMiddleware, async (req, res) => {
  // Define a route to handle GET requests for all locals
  try {
    const locals = await Local.find(); // Retrieve all local objects from the database
    res.json(locals); // Send the array of local objects as a JSON response
  } catch (error) {
    res.status(500).json({ message: error.message }); // Send an error response with the error message
  }
});

/**
 * Get a local by id
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The local object
 */
router.get(routes.show, authMiddleware, async (req, res) => {
  // Define a route to handle GET requests for a specific local by id
  try {
    const { id } = req.params; // Extract the id parameter from the request
    const local = await Local.findById(id); // Find the local object by id in the database
    if (!local) {
      return res.status(404).json({ message: "Local not found" }); // Send a 404 response if the local object is not found
    }
    res.json(local); // Send the local object as a JSON response
  } catch (error) {
    res.status(500).json({ message: error.message }); // Send an error response with the error message
  }
});

/**
 * Create a local
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The created local object
 */
router.post(routes.create, authMiddleware, async (req, res) => {
  // Define a route to handle POST requests to create a new local
  const { country, city, direction, phoneNumber } = req.body; // Extract the required fields from the request body

  if (!country || !city || !direction || !phoneNumber) {
    return res.status(400).json({ message: "Complete all fields" }); // Send a 400 response if any required field is missing
  }

  const newLocal = new Local({
    // Create a new Local object with the provided data
    country,
    city, // Added missing comma
    direction,
    phoneNumber,
  });

  try {
    await newLocal.save(); // Save the new local object to the database
    res.json({ message: "The local has been created correctly" }); // Send a success message as a JSON response
  } catch (error) {
    res.status(500).json({
      message: "The local could not be created: " + error.message, // Send an error response with the error message
    });
  }
});

/**
 * Update a local
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The updated local object
 */
router.put(routes.update, authMiddleware, async (req, res) => {
  // Define a route to handle PUT requests to update a local by id
  const { id } = req.params; // Extract the id parameter from the request
  const { country, city, direction, phoneNumber } = req.body; // Extract the updated fields from the request body

  if (!country || !city || !direction || !phoneNumber) {
    return res.status(400).json({ message: "Complete all fields" }); // Send a 400 response if any required field is missing
  }

  const updatedLocal = {
    // Create an object with the updated local data
    country,
    city, // Added missing comma
    direction,
    phoneNumber,
  };

  try {
    await Local.findByIdAndUpdate(id, updatedLocal); // Find and update the local object in the database
    res.json({ message: "The local has been updated correctly" }); // Send a success message as a JSON response
  } catch (error) {
    res.status(500).json({
      message: "The local could not be updated: " + error.message, // Send an error response with the error message
    });
  }
});

/**
 * Delete a local
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The deleted local object
 */
router.delete(routes.delete, authMiddleware, async (req, res) => {
  // Define a route to handle DELETE requests to delete a local by id
  const { id } = req.params; // Extract the id parameter from the request

  try {
    await Local.findByIdAndDelete(id); // Find and delete the local object from the database
    res.json({ message: "The local has been deleted correctly" }); // Send a success message as a JSON response
  } catch (error) {
    res.status(500).json({
      message: "The local could not be deleted: " + error.message, // Send an error response with the error message
    });
  }
});

module.exports = router; // Export the router for use in other modules
