const express = require("express");
const path = require("path");
const uuid = require("uuid");

const Package = require("../models/package.model.js");
const Travel = require("../models/travel.model.js");
const { routes } = require("../config/routes.js");
const authjwt = require("../middleware/authjwt.js");

const router = express.Router();

/* Package routes */

// Getting all packages
router.get(
  routes.index,
  [authjwt.verifyToken, authjwt.isAdmin],
  async (req, res) => {
    try {
      const packages = await Package.find();
      res.json(packages);
    } catch (error) {
      res.json({ message: error.message });
    }
  }
);

// Getting all packages whose state is published
router.get(
  routes.indexByState,
  [authjwt.verifyToken, authjwt.isAdmin],
  async (req, res) => {
    try {
      const packages = await Package.find({ state: "Publicado" });
      res.json(packages);
    } catch (error) {
      res.json({ message: error.message });
    }
  }
);

// Getting all packages whose state is not published
router.get(
  routes.indexIsNotPublished,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    try {
      const packages = await Package.find({
        state: { $ne: "Publicado" },
      });
      res.json(packages);
    } catch (error) {
      res.json({ message: error.message });
    }
  }
);

// Getting package send request
router.get(
  routes.indexByRequest,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    try {
      const packages = await Package.find({
        $and: [{ traveler: req.userId }, { state: "Proceso" }],
      });
      res.json(packages);
    } catch (error) {
      res.json({ message: error.message });
    }
  }
);

// Getting package by Match
router.get(
  routes.indexByMatch,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    try {
      const currentDate = new Date();
      const travel = await Travel.findOne({
        $and: [{ traveler: req.userId }, { date: { $gt: currentDate } }],
      });
      const packages = await Package.findOne({
        $and: [{ receiverCity: travel.destination }, { state: "Publicado" }],
      });
      res.json(packages);
    } catch (error) {
      res.json({ message: error.message });
    }
  }
);

// Getting accepted package
router.get(
  routes.indexByAcceptedRequest,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    try {
      const packages = await Package.find({
        $and: [{ traveler: req.userId }, { state: "Aceptado" }],
      });
      res.json(packages);
    } catch (error) {
      res.json({ message: error.message });
    }
  }
);

// Getting all packages by propietor
router.get(
  routes.proprietor,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    try {
      const packages = await Package.find({
        $and: [{ proprietor: req.userId }, { state: { $ne: "Cancelado" } }],
      });
      if (!packages) {
        return res.status(404).json({ message: "Package not found" });
      }
      res.json(packages);
    } catch (error) {
      res.json({ message: error.message });
    }
  }
);

// Getting all packages by propietor and whose state is not Published
router.get(
  routes.proprietor,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    try {
      const packages = await Package.find({
        proprietor: req.userId,
        state: "Proceso",
      });
      if (!packages) {
        return res.status(404).json({ message: "Package not found" });
      }
      res.json(packages);
    } catch (error) {
      res.json({ message: error.message });
    }
  }
);

// Getting a package by id
router.get(routes.show, async (req, res) => {
  try {
    const { id } = req.params;
    const package = await Package.findById(id);
    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.json(package);
  } catch (error) {
    res.json({ message: error.message });
  }
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
      traveler: null,
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

// Creating a package whit send request
router.post(
  routes.packageSendRequest,
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
    const { traveler } = req.params;
    if (
      !description ||
      !weight ||
      !image ||
      !receiverName ||
      !receiverSurname ||
      !receiverCity ||
      !receiverStreet ||
      !receiverPhone ||
      !traveler
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
      state: "Proceso",
      proprietor: req.userId,
      traveler: traveler,
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

// To confirm package send request
router.get(
  routes.packageSendRequestConfirmation,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    const { package } = req.params;
    const packageUpdated = {
      state: "Aprobado",
    };

    await Package.findByIdAndUpdate(package, packageUpdated)
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

// To confirm package send suggestion
router.get(
  routes.packageSendSuggestionConfirmation,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    const { package } = req.params;
    const packageUpdated = {
      state: "Aceptado",
      traveler: req.userId,
    };

    await Package.findByIdAndUpdate(package, packageUpdated)
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

// To Reject package send
router.get(
  routes.packageSendRequestRejection,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    const { package } = req.params;
    const packageUpdated = {
      state: "Publicado",
    };

    await Package.findByIdAndUpdate(package, packageUpdated)
      .then(() => {
        res.json({ message: "The package has been rejected" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The package could not be rejected: " + error.message,
        });
      });
  }
);

// To cancel package send
router.delete(
  routes.packageSendCancelation,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    const { package } = req.params;
    const packageUpdated = {
      state: "Cancelado",
    };

    await Package.findByIdAndUpdate(package, packageUpdated)
      .then(() => {
        res.json({ message: "The package has been calceled correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The package could not be calceled: " + error.message,
        });
      });
  }
);

// Deleting a package
router.delete(
  routes.delete,
  [authjwt.verifyToken, authjwt.isSuperAdmin],
  async (req, res) => {
    const { id } = req.params;
    const package = await Package.findById(id);

    await Package.deleteOne(package._id)
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
