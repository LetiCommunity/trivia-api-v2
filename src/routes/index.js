// Import the express module
const express = require("express");

// Create an instance of the express application
const app = express();

// List of controllers
const controllers = [
  "auth.dashboard.controller.js",
  "auth.controller.js",
  "employee.controller.js",
  "user.controller.js",
  "profile.controller.js",
  //"role.controller.js",
  "travel.controller.js",
  "package.controller.js",
  "package.dashboard.controller.js",
  "local.controller.js",
  "permission.controller.js",
  //"comment.controller.js"
];

/**
 * Iterate through the controllers array
 * @param {string} controller - The name of the controller file
 */
controllers.forEach((controller) => {
  // Extract the route from the controller filename
  const route = "/" + controller.split(".")[0];
  // Use the route and require the corresponding controller file
  app.use(route, require(`../controllers/${controller}`));
});

// Export the express application
module.exports = app;
