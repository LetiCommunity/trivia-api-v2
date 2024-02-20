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
    try {
      const packages = await Package.find();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Getting all packages whose state is approved
router.get(
  routes.packageDelivered,
  [authjwt.verifyToken, authjwt.isAdmin],
  async (req, res) => {
    try {
      const packages = await Package.find({ state: "Aprobado" })
        .populate("proprietor")
        .exec();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Getting all packages whose state is delivered
router.get(
  routes.packageShipped,
  [authjwt.verifyToken, authjwt.isAdmin],
  async (req, res) => {
    try {
      const packages = await Package.find({ state: "Entregado" })
        .populate("traveler")
        .exec();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Getting all packages whose state is shipped
router.get(
  routes.packageReceived,
  [authjwt.verifyToken, authjwt.isAdmin],
  async (req, res) => {
    try {
      const packages = await Package.find({ state: "Enviado" })
        .populate("traveler")
        .exec();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Getting all packages whose state is completed
router.get(
  routes.packageCompleted,
  [authjwt.verifyToken, authjwt.isAdmin],
  async (req, res) => {
    try {
      const packages = await Package.find({ state: "Completado" });
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
});

// Getting a package image
router.get(routes.image, async (req, res) => {
  try {
    const { image } = req.params;
    const imagePath = path.join(__dirname, "../public/images/", image);
    res.sendFile(imagePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Creating a package
router.post(
  routes.create,
  [authjwt.verifyToken, authjwt.isAdmin],
  async (req, res) => {
    const {
      description,
      weight,
      receiverName,
      receiverSurname,
      receiverCity,
      receiverStreet,
      receiverPhone,
      proprietor,
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
      !receiverPhone ||
      !proprietor
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
      proprietor: proprietor,
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

// Updating a package
router.put(
  routes.update,
  [authjwt.verifyToken, authjwt.isAdmin],
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

// To confirm package delivered
router.get(
  routes.confirmPackageDelivered,
  [authjwt.verifyToken, authjwt.isAdmin],
  async (req, res) => {
    const { package } = req.params;
    const packageUpdated = {
      state: "Entregado",
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

// To confirm package shipped
router.get(
  routes.confirmPackageShipped,
  [authjwt.verifyToken, authjwt.isAdmin],
  async (req, res) => {
    const { package } = req.params;
    const packageUpdated = {
      state: "Enviado",
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

// To confirm package received
router.get(
  routes.confirmPackageReceived,
  [authjwt.verifyToken, authjwt.isAdmin],
  async (req, res) => {
    const { package } = req.params;
    const packageUpdated = {
      state: "Recibido",
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

// To confirm package completed
router.get(
  routes.confirmPackageCompleted,
  [authjwt.verifyToken, authjwt.isAdmin],
  async (req, res) => {
    const { package } = req.params;
    const packageUpdated = {
      state: "Completado",
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
