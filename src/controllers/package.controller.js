const express = require("express");
const path = require("path");
const uuid = require("uuid");

const Package = require("../models/package.model.js");
const { routes } = require("../config/routes.js");
const authjwt = require("../middleware/authjwt.js");

const router = express.Router();

/* Package routes */

// Getting all packages
router.get(
  routes.index,
  [authjwt.verifyToken, authjwt.isAdmin],
  async (req, res) => {
    const package = await Package.find();
    res.json(package);
  }
);

// Getting all packages by state
router.get(
  routes.indexByState,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    const package = await Package.find({ state: "Publicado" });
    res.json(package);
  }
);

// Getting all packages by propietor
router.get(
  routes.proprietor,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    const package = await Package.find({ proprietor: req.userId });

    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.json(package);
  }
);

// Getting a package by id
router.get(routes.show, async (req, res) => {
  const { id } = req.params;

  const package = await Package.findById(id);

  if (!package) {
    return res.status(404).json({ message: "Package not found" });
  }
  res.json(package);
});

// Getting a package image
router.get(routes.image, async (req, res) => {
  try {
    const { image } = req.params;

    const imagePath = path.join(__dirname, "../public/images/", image);
    res.sendFile(imagePath);
  } catch (error) {
    console.error(error);
  }
});

// Creating a package
router.post(
  routes.create,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    const {
      description,
      weight,
      receiverName,
      receiverSurname,
      receiverCity,
      receiverStreet,
      receiverPhone,
    } = req.body;
    const { image } = req.files;

    if (
      !description ||
      !weight ||
      !image ||
      !receiverName ||
      !receiverSurname ||
      !receiverCity ||
      !receiverStreet ||
      !receiverPhone
    ) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    let imageFilter = uuid.v4() + image.name.replace(/ /g, "").toLowerCase();

    image.mv(`./public/images/${imageFilter}`, (error) => {
      if (error) return res.status(500).json({ message: error.message });
    });

    const newPackage = new Package({
      description: description,
      weight: weight,
      image: imageFilter,
      receiverName: receiverName,
      receiverSurname: receiverSurname,
      receiverCity: receiverCity,
      receiverStreet: receiverStreet,
      receiverPhone: receiverPhone,
      state: "Publicado",
      proprietor: req.userId,
    });

    await Package.create(newPackage)
      .then(() => {
        res.json({ message: "The package has been created correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The package could not be performed: " + error.message,
        });
      });
  }
);

// Updating a package
router.put(
  routes.update,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    const { id } = req.params;
    const {
      description,
      weight,
      receiverName,
      receiverSurname,
      receiverCity,
      receiverStreet,
      receiverPhone,
    } = req.body;
    const { image } = req.files;

    if (
      !description ||
      !weight ||
      !image ||
      !receiverName ||
      !receiverSurname ||
      !receiverCity ||
      !receiverStreet ||
      !receiverPhone
    ) {
      return res.status(400).json({ message: "Complete all fields" });
    }

    const packageUpdated = {
      description: description,
      weight: weight,
      image: image,
      receiverName: receiverName,
      receiverSurname: receiverSurname,
      receiverCity: receiverCity,
      receiverStreet: receiverStreet,
      receiverPhone: receiverPhone,
    };

    await Package.findByIdAndUpdate(id, packageUpdated)
      .then(() => {
        res.json({ message: "The package has been updated correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The package could not be performed: " + error.message,
        });
      });
  }
);

// Deleting a package
router.delete(
  routes.delete,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    const { id } = req.params;

    const package = await Package.findById(id);

    Package.deleteOne(package._id)
      .then(() => {
        res.json({ message: "The package has been deleted correctly" });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({
          message: "The package could not be performed: " + error.message,
        });
      });
  }
);

module.exports = router;
