const express = require("express"); // Importing the express module
const bcrypt = require("bcryptjs"); // Importing the bcryptjs module for password hashing
const path = require("path"); // Importing the path module for working with file and directory paths
const uuid = require("uuid"); // Importing the uuid module for generating unique identifiers

const User = require("../models/user.model.js"); // Importing the User model from the user.model.js file
const { routes } = require("../config/routes.js"); // Importing the routes object from the routes.js file
const authjwt = require("../middleware/authjwt.js"); // Importing the authjwt middleware for authentication

const router = express.Router(); // Creating an instance of an Express router

/**
 * Get user profile
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The user profile
 */
router.get(routes.profile, [authjwt.verifyToken], async (req, res) => {
  try {
    const user = await User.findById(req.userId); // Finding a user by their ID
    if (!user) {
      return res.status(404).json({ message: "User not found" }); // Returning a 404 status if the user is not found
    }
    res.json(user); // Sending the user profile as a JSON response
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handling and returning an error message with a 500 status
  }
});

/**
 * Get image
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {File} - The requested image file
 */
router.get(routes.image, async (req, res) => {
  try {
    const { image } = req.params; // Extracting the image parameter from the request
    const imagePath = path.join(__dirname, "../public/images/", image); // Constructing the file path for the requested image
    res.sendFile(imagePath); // Sending the requested image file
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handling and returning an error message with a 500 status
  }
});

/**
 * Update user profile
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The updated user profile
 */
router.put(routes.profile, [authjwt.verifyToken], async (req, res) => {
  const id = req.userId; // Extracting the user ID from the request
  const { name, surname, email, username } = req.body; // Extracting user details from the request body

  if (!name || !surname || !email || !username) {
    return res.status(400).json({ message: "Complete all fields" }); // Returning a 400 status if required fields are not provided
  }

  const userUpdated = {
    name,
    surname,
    email,
    username,
  };

  try {
    const user = await User.findByIdAndUpdate(id, userUpdated, { new: true }); // Updating the user profile and returning the updated user
    res.json({ user }); // Sending the updated user profile as a JSON response
  } catch (error) {
    res
      .status(500)
      .json({ message: "The user could not be updated: " + error.message }); // Handling and returning an error message with a 500 status
  }
});

/**
 * Change user password
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The result of the password change operation
 */
router.patch(routes.changePassword, [authjwt.verifyToken], async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body; // Extracting the current and new passwords from the request body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Complete all fields" }); // Returning a 400 status if required fields are not provided
    }
    const user = await User.findById(req.userId); // Finding a user by their ID
    if (!user) {
      return res.status(409).json({ message: "User not found" }); // Returning a 409 status if the user is not found
    }
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ message: "Incorrect password" }); // Returning a 400 status if the current password is incorrect
    }
    const hashedPassword = bcrypt.hashSync(newPassword, 10); // Hashing the new password
    await User.findByIdAndUpdate(req.userId, { password: hashedPassword }); // Updating the user's password
    res.json({ message: "The password has been updated correctly" }); // Sending a success message as a JSON response
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handling and returning an error message with a 500 status
  }
});

/**
 * Change user profile image
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The result of the profile image change operation
 */
router.patch(
  routes.changeProfileImage,
  [authjwt.verifyToken],
  async (req, res) => {
    try {
      const { image } = req.files; // Extracting the image file from the request
      const id = req.userId; // Extracting the user ID from the request
      if (image) {
        const imageFilter =
          uuid.v4() + image.name.replace(/ /g, "").toLowerCase(); // Generating a unique image name
        await image.mv(path.join(__dirname, "../public/images/", imageFilter)); // Moving the image file to the specified directory
        await User.findByIdAndUpdate(id, { image: imageFilter }); // Updating the user's profile image
        res.json({ message: "Profile image updated successfully" }); // Sending a success message as a JSON response
      } else {
        res.status(400).json({ message: "No image provided" }); // Returning a 400 status if no image is provided
      }
    } catch (error) {
      res.status(500).json({ message: error.message }); // Handling and returning an error message with a 500 status
    }
  }
);

/**
 * Disable user account
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The result of the account disabling operation
 */
router.delete(routes.delete, [authjwt.verifyToken], async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { state: false }); // Disabling the user account by updating the state
    res.json({ message: "The account has been disabled correctly" }); // Sending a success message as a JSON response
  } catch (error) {
    res
      .status(500)
      .json({ message: "The account could not be disabled: " + error.message }); // Handling and returning an error message with a 500 status
  }
});

module.exports = router; // Exporting the router for use in other modules
