const express = require("express"); // Importing the express module
const path = require("path"); // Importing the path module
const uuid = require("uuid"); // Importing the uuid module for generating unique identifiers

const Package = require("../models/package.model.js"); // Importing the Package model
const Travel = require("../models/travel.model.js"); // Importing the Travel model
const { routes } = require("../config/routes.js"); // Importing the routes configuration
const authjwt = require("../middleware/authjwt.js"); // Importing the authentication middleware

const router = express.Router(); // Creating a new router using express

/* Package routes */

/**
 * Get all packages whose state is not published
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Array} - Array of packages
 */
router.get(
  routes.indexIsNotPublished, // Route path
  [authjwt.verifyToken, authjwt.isUser], // Middleware for authentication
  async (req, res) => {
    // Asynchronous route handler function
    try {
      const packages = await Package.find({
        // Finding all packages with state not equal to "Publicado"
        state: { $ne: "Publicado" },
      }).lean(); // Converting the result to plain JavaScript objects
      res.json(packages); // Sending the packages as a JSON response
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * Getting package send request
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Array} - Array of packages
 */
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
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * Getting package by Match
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Array} - Array of packages
 */
router.get(
  routes.indexByMatch,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    try {
      const currentDate = new Date();
      const travel = await Travel.findOne({
        $and: [{ traveler: req.userId }, { date: { $gt: currentDate } }],
      });
      if (travel) {
        const packages = await Package.find({
          $and: [
            { receiverCity: travel.destination },
            { state: "Publicado" },
            { proprietor: { $ne: req.userId } },
          ],
        });
        res.json(packages);
      } else {
        res
          .status(404)
          .json({ message: "You do not a travel to receive sugestiones" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * Getting accepted package
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Array} - Array of packages
 */
router.get(
  routes.indexByAcceptedRequest,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    try {
      const packages = await Package.find({
        $and: [{ proprietor: req.userId }, { state: "Aprobado" }],
      });
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * Getting all packages by propietor
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Array} - Array of packages
 */
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
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * Getting all packages by propietor and whose state is not Published
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Array} - Array of packages
 */
// router.get(
//   routes.proprietor,
//   [authjwt.verifyToken, authjwt.isUser],
//   async (req, res) => {
//     try {
//       const packages = await Package.find({
//         proprietor: req.userId,
//         state: "Proceso",
//       });
//       if (!packages) {
//         return res.status(404).json({ message: "Package not found" });
//       }
//       res.json(packages);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );

/**
 * Get a package by id
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The package object
 */
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

/**
 * Get a package image
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Image} - The package image
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
 * Create a package
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The created package object
 */
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

/**
 * Create a package with send request
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The created package object
 */
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

/**
 * Update a package
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The updated package object
 */
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

/**
 * Confirm package send request
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The updated package object
 */
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

/**
 * Confirm package send suggestion
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The updated package object
 */
router.get(
  routes.packageSendSuggestionConfirmation,
  [authjwt.verifyToken, authjwt.isUser],
  async (req, res) => {
    const { package } = req.params;
    const packageUpdated = {
      state: "Aprobado",
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

/**
 * Reject package send
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The updated package object
 */
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

/**
 * Cancel package send
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The updated package object
 */
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

module.exports = router;
