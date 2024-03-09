const express = require("express");
const bcrypt = require("bcryptjs");
const path = require("path");
const uuid = require("uuid");

const User = require("../models/user.model.js");
const { routes } = require("../config/routes.js");
const authjwt = require("../middleware/authjwt.js");

const router = express.Router();

router.get(routes.profile, [authjwt.verifyToken], async (req, res) => {
  try {
    const id = req.userId;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get(routes.image, async (req, res) => {
  try {
    const { image } = req.params;
    const imagePath = path.join(__dirname, "../public/images/", image);
    res.sendFile(imagePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put(routes.profile, [authjwt.verifyToken], async (req, res) => {
  const id = req.userId;
  const { name, surname, email, username } = req.body;

  if (!name || !surname || !email || !username) {
    return res.status(400).json({ message: "Complete all fields" });
  }

  const userUpdated = {
    name: name,
    surname: surname,
    email: email,
    username: username,
  };

  await User.findByIdAndUpdate(id, userUpdated)
    .then((user) => {
      return res.json({
        user: user,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "The user could not be performed: " + error.message,
      });
    });
});

router.patch(routes.changePassword, [authjwt.verifyToken], async (req, res) => {
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
});

router.patch(
  routes.changeProfileImage,
  [authjwt.verifyToken],
  async (req, res) => {
    try {
      const { image } = req.files;
      const id = req.userId;
      let imageFilter;
      if (image) {
        imageFilter = uuid.v4() + image.name.replace(/ /g, "").toLowerCase();
        image.mv(`./public/images/${imageFilter}`, (error) => {
          if (error) return res.status(500).json({ message: error.message });
        });
      }
      const imageProfileUpdated = {
        image: imageFilter,
      };
      await User.findByIdAndUpdate(id, imageProfileUpdated)
        .then((user) => {
          return res.json({
            user: user,
          });
        })
        .catch((error) => {
          res.status(500).json({
            message: "The user could not be performed: " + error.message,
          });
        });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

router.delete(routes.delete, [authjwt.verifyToken], async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    User.deleteOne(user._id)
      .then(() => {
        res.json({ message: "The user has been deleted correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The user could not be performed: " + error.message,
        });
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
