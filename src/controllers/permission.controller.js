const express = require("express");

// Import the Permission model and routes configuration
const Permission = require("../models/permission.model.js");
const { routes } = require("../config/routes.js");
const authjwt = require("../middleware/authjwt.js");

const router = express.Router();

/* User routes */

/**
 * Get all permissions
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Array} - An array of permissions
 */
router.get(
  routes.index,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    try {
      // Retrieve all permissions from the database
      const permissions = await Permission.find();
      // Send the permissions as a JSON response
      res.json(permissions);
    } catch (error) {
      // Handle any errors and send an error response
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * Get a permission by id
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Object} - The permission object
 */
router.get(
  routes.show,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    try {
      // Extract the id from the request parameters
      const { id } = req.params;
      // Find the permission by id in the database
      const permission = await Permission.findById(id);
      // If the permission is not found, send a 404 response
      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }
      // Send the permission as a JSON response
      res.json(permission);
    } catch (error) {
      // Handle any errors and send an error response
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * Create a permission
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Object} - The created permission object
 */
router.post(
  routes.create,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    const { name } = req.body;

    // Check if the name field is provided in the request body
    if (!name) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    try {
      // Create a new Permission instance with the provided name
      const newPermission = new Permission({
        name: name,
      });
      // Save the new permission to the database
      await newPermission.save();
      // Send a success message as a JSON response
      res.json({ message: "The permission has been created correctly" });
    } catch (error) {
      // Handle any errors and send an error response
      res.status(500).json({
        message: "The permission could not be created: " + error.message,
      });
    }
  }
);

/**
 * Update a permission
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Object} - The updated permission object
 */
router.put(
  routes.update,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    // Check if the name field is provided in the request body
    if (!name) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    try {
      // Create an object with the updated name
      const updatedPermission = {
        name: name,
      };
      // Update the permission in the database using the provided id
      await Permission.findByIdAndUpdate(id, updatedPermission);
      // Send a success message as a JSON response
      res.json({ message: "The permission has been updated correctly" });
    } catch (error) {
      // Handle any errors and send an error response
      res.status(500).json({
        message: "The permission could not be updated: " + error.message,
      });
    }
  }
);

/**
 * Delete a permission
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Object} - The deleted permission object
 */
router.delete(
  routes.delete,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    const { id } = req.params;

    try {
      // Delete the permission from the database using the provided id
      await Permission.findByIdAndDelete(id);
      // Send a success message as a JSON response
      res.json({ message: "The permission has been deleted correctly" });
    } catch (error) {
      // Handle any errors and send an error response
      res.status(500).json({
        message: "The permission could not be deleted: " + error.message,
      });
    }
  }
);

module.exports = router;
