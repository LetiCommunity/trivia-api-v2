const express = require("express");

const Local = require("../models/local.model.js");
const { routes } = require("../config/routes.js");
const authjwt = require("../middleware/authjwt.js");

const router = express.Router();

/* User routes */

// Getting all locals
router.get(
  routes.index,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    try {
      const locals = await Local.find();
      res.json(locals);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Getting a local by id
router.get(
  routes.show,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    try {
      const { id } = req.params;
      const local = await Local.findById(id);
      if (!local) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(local);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Creating a local
router.post(
  routes.create,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    const { country, city, direction, phoneNumber } = req.body;

    if (!country || !city || !direction || !phoneNumber) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    const newLocal = new Local({
      country: country,
      city: city,
      direction: direction,
      phoneNumber: phoneNumber,
    });

    await Local.create(newLocal)
      .then(() => {
        res.json({ message: "The local has been created correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The local could not be performed: " + error.message,
        });
      });
  }
);

// Updating a local
router.put(
  routes.update,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    const { id } = req.params;
    const { country, city, direction, phoneNumber } = req.body;

    if (!country || !city || !direction || !phoneNumber) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    const updatedLocal = {
      country: country,
      city: city,
      direction: direction,
      phoneNumber: phoneNumber,
    };

    await Local.findByIdAndUpdate(id, updatedLocal)
      .then(() => {
        res.json({ message: "The local has been updated correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The local could not be performed: " + error.message,
        });
      });
  }
);

// Deleting a local
router.delete(
  routes.delete,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    const { id } = req.params;
    const local = await Local.findById(id);

    Local.deleteOne(local._id)
      .then(() => {
        res.json({ message: "The local has been deleted correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The local could not be performed: " + error.message,
        });
      });
  }
);

module.exports = router;
