const express = require("express");

const Travel = require("../models/travel.model.js");
const { routes } = require("../config/routes.js");
const authjwt = require("../middleware/authjwt.js");

const router = express.Router();

/* User routes */

/**
 * Get all travels
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Array} - Array of travel objects
 */
router.get(
  routes.index,
  [authjwt.verifyToken, authjwt.isAdmin],
  async (req, res) => {
    try {
      const travels = await Travel.find()
        .populate("traveler")
        .sort({ date: -1 })
        .lean(); // Use lean() for read-only operations
      res.json(travels);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * Get all next travels
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Array} - Array of travel objects
 */
router.get(routes.indexByDate, async (req, res) => {
  try {
    const currentDate = new Date();
    const travels = await Travel.find({
      date: { $gt: currentDate },
      state: true,
      availableWeight: { $gt: 0 },
    })
      .populate("traveler")
      .sort({ date: 1 })
      .lean(); // Use lean() for read-only operations
    res.json(travels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Get all next travels by origin and destination
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Array} - Array of travel objects
 */
router.get(routes.indexByCity, async (req, res) => {
  try {
    const { origin, destination } = req.query; // Use req.query instead of req.params
    const currentDate = new Date();
    const travels = await Travel.find({
      date: { $gt: currentDate },
      origin: origin,
      destination: destination,
      state: true,
      availableWeight: { $gt: 0 },
    })
      .populate("traveler")
      .sort({ date: 1 })
      .lean(); // Use lean() for read-only operations
    res.json(travels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Get all travels by proprietor
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Array} - Array of travel objects
 */
router.get(
  routes.proprietor,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    try {
      const travels = await Travel.find({ traveler: req.userId, state: true })
        .sort({ date: -1 })
        .exec();
      res.json(travels);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * Get a travel by id
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Object} - The travel object
 */
router.get(routes.show, async (req, res) => {
  try {
    const { id } = req.params;
    const travel = await Travel.findById(id).populate("traveler").exec();
    if (!travel) {
      return res.status(404).json({ message: "Travel not found" });
    }
    res.json(travel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Create a travel
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Object} - The result of the creation operation
 */

router.post(
  routes.create,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    const {
      origin,
      destination,
      date,
      airport,
      terminal,
      company,
      billingTime,
      availableWeight,
    } = req.body;

    if (
      !origin ||
      !destination ||
      !date ||
      !airport ||
      !terminal ||
      !company ||
      !billingTime ||
      !availableWeight
    ) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    if (origin === destination) {
      return res
        .status(400)
        .json({ message: "Origin and destination cannot be the same" });
    }

    const convertedDate = new Date(date);
    const currentDate = new Date();

    if (convertedDate < currentDate) {
      return res.status(400).json({ message: "Please enter a correct date" });
    }

    const existingTravel = await Travel.findOne({
      traveler: req.userId,
      date: { $gt: currentDate },
    }).exec();

    if (existingTravel) {
      return res.status(409).json({ message: "You have a current travel" });
    }

    const newTravel = new Travel({
      origin,
      destination,
      date,
      airport,
      terminal,
      company,
      billingTime,
      availableWeight,
      traveler: req.userId,
      state: true,
    });

    try {
      await newTravel.save();
      res.json({ message: "The travel has been created correctly" });
    } catch (error) {
      res.status(500).json({
        message: "The travel could not be performed: " + error.message,
      });
    }
  }
);

/**
 * Update a travel
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Object} - The result of the update operation
 */
router.put(
  routes.update,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    const { id } = req.params;
    const {
      origin,
      destination,
      date,
      airport,
      terminal,
      company,
      billingTime,
      availableWeight,
    } = req.body;

    if (
      !origin ||
      !destination ||
      !date ||
      !airport ||
      !terminal ||
      !company ||
      !billingTime ||
      !availableWeight
    ) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    if (origin === destination) {
      return res
        .status(400)
        .json({ message: "Origin and destination cannot be the same" });
    }

    const convertedDate = new Date(date);
    const currentDate = new Date();

    if (convertedDate < currentDate) {
      return res.status(400).json({ message: "Please enter a correct date" });
    }

    const travelUpdated = {
      origin,
      destination,
      date,
      airport,
      terminal,
      company,
      billingTime,
      availableWeight,
    };

    try {
      await Travel.findByIdAndUpdate(id, travelUpdated);
      res.json({ message: "The travel has been updated correctly" });
    } catch (error) {
      res.status(500).json({
        message: "The travel could not be performed: " + error.message,
      });
    }
  }
);

/**
 * Cancel a travel
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Object} - The result of the cancelation operation
 */
router.delete(
  routes.travelPublishCancelation,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    const { travel } = req.params;
    const travelUpdated = {
      state: false,
    };
    try {
      await Travel.findByIdAndUpdate(travel, travelUpdated);
      res.json({ message: "The travel has been canceled correctly" });
    } catch (error) {
      res.status(500).json({
        message: "The travel could not be canceled: " + error.message,
      });
    }
  }
);

/**
 * Delete a travel
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Object} - The result of the deletion operation
 */
router.delete(
  routes.delete,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    const { id } = req.params;
    try {
      await Travel.findByIdAndDelete(id);
      res.json({ message: "The travel has been deleted correctly" });
    } catch (error) {
      res.status(500).json({
        message: "The travel could not be performed: " + error.message,
      });
    }
  }
);

module.exports = router;
