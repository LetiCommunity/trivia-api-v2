const express = require("express");
const path = require("path");

const { routes } = require("../config/routes.js");

const router = express.Router();

// Getting a package image
router.get(routes.app, async (req, res) => {
  try {
    const appPath = path.join(__dirname, "../public/others/", "app.apk");
    res.sendFile(appPath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
