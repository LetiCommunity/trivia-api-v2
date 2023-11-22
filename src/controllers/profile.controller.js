const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/user.model.js");
const { routes } = require("../config/routes.js");
const authjwt = require("../middleware/authjwt.js");

const router = express.Router();

router.put(
  routes.profile,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    const id = req.userId;
    const { name, surname, email, username, image } = req.body;

    if (!name || !surname || !username) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    const userUpdated = {
      name: name,
      surname: surname,
      email: email,
      username: username,
      image: image,
    };

    await User.findByIdAndUpdate(id, userUpdated)
      .then(() => {
        res.json({ message: "The user has been updated correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The user could not be performed: " + error.message,
        });
      });
  }
);

router.patch(
  routes.update,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    try {
      const id = req.userId;
      const { currentPassword, newPassword } = req.body;
      if (!id || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "Complete all fields" });
      }
      const userExisting = await User.findById(id);
      if (!userExisting) {
        return res.status(409).json({ message: "User not found" });
      }
      // Check if the user password is correct
      if (!bcrypt.compareSync(currentPassword, userExisting.password)) {
        return res.status(400).json({ message: "Incorrect password" });
      }
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);
      const passwordUpdated = {
        password: hashedPassword,
      };
      await User.findByIdAndUpdate(id, passwordUpdated)
        .then(() => {
          res.json({ message: "The password has been updated correctly" });
        })
        .catch((error) => {
          res.status(500).json({
            message: "The password could not be updated " + error.message,
          });
        });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

router.delete(
  routes.delete,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    try {
      const id = req.userId;
      const statusUpdated = {
        status: false,
      };
      await User.findByIdAndUpdate(id, statusUpdated)
        .then(() => {
          res.json({ message: "The account has been disabled correctly" });
        })
        .catch((error) => {
          res.status(500).json({
            message: "The password account not be disabled " + error.message,
          });
        });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
