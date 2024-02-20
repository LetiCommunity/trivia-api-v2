const express = require("express");

const Permission = require("../models/permission.model.js");
const { routes } = require("../config/routes.js");
const authjwt = require("../middleware/authjwt.js");

const router = express.Router();

/* User routes */

// Getting all permissions
router.get(
  routes.index,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    try {
      const permission = await Permission.find();
      res.json(permission);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Getting a permission by id
router.get(
  routes.show,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    try {
      const { id } = req.params;
      const permission = await Permission.findById(id);
      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }
      res.json(permission);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Creating a permission
router.post(
  routes.create,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    const newPermission = new Permission({
      name: name,
    });

    await Permission.create(newPermission)
      .then(() => {
        res.json({ message: "The permission has been created correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The permission could not be performed: " + error.message,
        });
      });
  }
);

// Updating a permission
router.put(
  routes.update,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    const updatedPermission = {
      name: name,
    };

    await Permission.findByIdAndUpdate(id, updatedPermission)
      .then(() => {
        res.json({ message: "The permission has been updated correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The permission could not be performed: " + error.message,
        });
      });
  }
);

// Deleting a permission
router.delete(
  routes.delete,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    const { id } = req.params;
    const permission = await Permission.findById(id);

    Permission.deleteOne(permission._id)
      .then(() => {
        res.json({ message: "The permission has been deleted correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The permission could not be performed: " + error.message,
        });
      });
  }
);

module.exports = router;
