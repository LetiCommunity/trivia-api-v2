const express = require("express");

const Travel = require("../models/travel.model.js");
const { routes } = require("../config/routes.js");
const authjwt = require("../middleware/authjwt.js");

const router = express.Router();

/* User routes */

// Getting all travels
router.get(routes.index, async (req, res) => {
  const travel = await Travel.find();
  res.json(travel);
});

// Getting a travel by id
router.get(routes.show, async (req, res) => {
  const { id } = req.params;

  const travel = await Travel.findById(id);

  if (!travel) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(travel);
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
      billingDate,
      availableWeight,
    } = req.body;

    if (
      !origin ||
      !destination ||
      !date ||
      !airport ||
      !terminal ||
      !company ||
      !billingDate ||
      !availableWeight
    ) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    const newTravel = new Travel({
      origin: origin,
      destination: destination,
      date: date,
      airport: airport,
      terminal: terminal,
      company: company,
      billingDate: billingDate,
      availableWeight: availableWeight,
    });

    await Travel.create(newTravel)
      .then(() => {
        res.json({ message: "The travel has been created correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The travel could not be performed: " + error.message,
        });
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
      billingDate,
      availableWeight,
    } = req.body;

    if (
      !origin ||
      !destination ||
      !date ||
      !airport ||
      !terminal ||
      !company ||
      !billingDate ||
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
      billingDate: billingDate,
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

// Deleting a travel
router.delete(
  routes.delete,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    const { id } = req.params;

    Travel.deleteOne(id)
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
