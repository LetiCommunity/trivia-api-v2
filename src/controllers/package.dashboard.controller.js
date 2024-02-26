const express = require("express"); // Import the express module
const path = require("path"); // Import the path module
const uuid = require("uuid"); // Import the uuid module for generating unique identifiers

const Package = require("../models/package.model.js"); // Import the Package model
const { routes } = require("../config/routes.js"); // Import the routes configuration
const authjwt = require("../middleware/authjwt.js"); // Import the authentication middleware

const router = express.Router(); // Create a new router using express

/**
 * Middleware functions for authentication and authorization
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @param {function} next - The next middleware function
 */
const commonMiddleware = [authjwt.verifyToken, authjwt.isAdmin]; // Define common middleware functions for authentication and authorization

/**
 * Retrieve all packages
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
router.use(commonMiddleware, async (req, res) => {
  try {
    const packages = await Package.find()
      .populate("proprietor")
      .populate("traveler")
      .exec();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Retrieve all packages with state "Aprobado"
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
router.get(routes.packageDelivered, commonMiddleware, async (req, res) => {
  try {
    const packages = await Package.find({ state: "Aprobado" })
      .populate("proprietor")
      .exec();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Retrieve all packages with state "Entregado"
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
router.get(routes.packageShipped, commonMiddleware, async (req, res) => {
  try {
    const packages = await Package.find({ state: "Entregado" })
      .populate("traveler")
      .exec();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Retrieve all packages with state "Enviado"
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
router.get(routes.packageReceived, commonMiddleware, async (req, res) => {
  try {
    const packages = await Package.find({ state: "Enviado" })
      .populate("traveler")
      .exec();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Retrieve all packages with state "Completado"
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
router.get(routes.packageCompleted, commonMiddleware, async (req, res) => {
  try {
    const packages = await Package.find({ state: "Completado" });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Retrieve a package by id
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
router.get(routes.show, async (req, res) => {
  try {
    const { id } = req.params;
    const package = await Package.findById(id).lean();
    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.json(package);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Retrieve a package image
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
router.get(routes.image, async (req, res) => {
  try {
    const { image } = req.params;
    const imagePath = path.join(__dirname, "../public/images/", image);
    res.sendFile(imagePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Create a new package
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
router.post(routes.create, commonMiddleware, async (req, res) => {
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
});

/**
 * Update an existing package
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
router.put(routes.update, commonMiddleware, async (req, res) => {
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
});

/**
 * Confirm package delivery
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
router.get(
  routes.confirmPackageDelivered,
  commonMiddleware,
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

/**
 * Confirm package shipment
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
router.get(routes.confirmPackageShipped, commonMiddleware, async (req, res) => {
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
});

/**
 * Confirm package receipt
 * @param {object} req - The request object
 * @param {object} res - The response object
 */

router.get(
  routes.confirmPackageReceived,
  commonMiddleware,
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

/**
 * Confirm package receipt
 * @param {object} req - The request object
 * @param {object} res - The response object
 */

router.get(
  routes.confirmPackageCompleted,
  commonMiddleware,
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

/**
 * Cancel package shipment
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
router.delete(
  routes.packageSendCancelation,
  commonMiddleware,
  async (req, res) => {
    const { package } = req.params;
    const packageUpdated = {
      state: "Cancelado",
    };

    await Package.findByIdAndUpdate(package, packageUpdated)
      .then(() => {
        res.json({ message: "The package has been cancelled correctly" });
      })
      .catch((error) => {
        res.status(500).json({
          message: "The package could not be cancelled: " + error.message,
        });
      });
  }
);

/**
 * Delete a package
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
router.delete(routes.delete, commonMiddleware, async (req, res) => {
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
});

module.exports = router;
