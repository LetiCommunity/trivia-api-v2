const express = require("express");

const Travel = require("../models/travel.model.js");
const { routes } = require("../config/routes.js");
const authjwt = require("../middleware/authjwt.js");

const router = express.Router();

/* User routes */

// Getting all travels
router.get(
  routes.index,
  [authjwt.verifyToken, authjwt.isAdmin],
  async (req, res) => {
    try {
      const travel = await Travel.find()
        .populate("traveler")
        .sort({ date: -1 })
        .exec();
      res.json(travel);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Getting all next travels
router.get(routes.indexByDate, async (req, res) => {
  try {
    const currentDate = new Date();
    const travel = await Travel.find({
      date: { $gt: currentDate },
      state: true,
      availableWeight: { $gt: 0 },
    })
      .populate("traveler")
      .sort({ date: 1 })
      .exec();
    res.json(travel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Getting all next travels by origin and destination
router.get(routes.indexByCity, async (req, res) => {
  try {
    const { origin, destination } = req.params;
    const currentDate = new Date();
    const travel = await Travel.find({
      date: { $gt: currentDate },
      origin: origin,
      destination: destination,
      state: true,
      availableWeight: { $gt: 0 },
    })
      .populate("traveler")
      .sort({ date: 1 })
      .exec();
    res.json(travel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Getting all travels by proprietor
router.get(
  routes.proprietor,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    try {
      const travel = await Travel.find({ traveler: req.userId, state: true })
        .sort({ date: -1 })
        .exec();
      res.json(travel);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Getting a travel by id
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

// Creating a travel
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

    const travel = await Travel.findOne({
      traveler: req.userId,
      date: { $gt: currentDate },
    }).exec();

    if (travel) {
      return res.status(409).json({ message: "You have a current travel" });
    }

    const newTravel = new Travel({
      origin: origin,
      destination: destination,
      date: date,
      airport: airport,
      terminal: terminal,
      company: company,
      billingTime: billingTime,
      availableWeight: availableWeight,
      traveler: req.userId,
      state: true,
    });

    await Travel.create(newTravel)
      .then(() => {
        res.json({ message: "The travel has been created correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The travel could not be performed: " + error.message,
        });
        console.error(error.message);
      });
  }
);

// Updating a travel
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

    const travelUpdated = {
      origin: origin,
      destination: destination,
      date: date,
      airport: airport,
      terminal: terminal,
      company: company,
      billingTime: billingTime,
      availableWeight: availableWeight,
    };

    await Travel.findByIdAndUpdate(id, travelUpdated)
      .then(() => {
        res.json({ message: "The travel has been updated correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The travel could not be performed: " + error.message,
        });
      });
  }
);

// Canceling travel
router.delete(
  routes.travelPublishCancelation,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    const { travel } = req.params;
    const travelUpdated = {
      state: false,
    };
    await Travel.findByIdAndUpdate(travel, travelUpdated)
      .then(() => {
        res.json({ message: "The travel has been canceled correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The travel could not be canceled: " + error.message,
        });
      });
  }
);

// Deleting a travel
router.delete(
  routes.delete,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    const { id } = req.params;
    const travel = await Travel.findById(id);

    await Travel.deleteOne(travel._id)
      .then(() => {
        res.json({ message: "The travel has been deleted correctly" });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({
          message: "The travel could not be performed: " + error.message,
        });
      });
  }
);

module.exports = router;
