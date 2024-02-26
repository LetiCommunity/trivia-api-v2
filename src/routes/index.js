// Import the express module
const express = require("express");

// Create an instance of the express application
const app = express();

// List of controllers
app.use(
  "/auth/dashboard",
  require("../controllers/auth.dashboard.controller.js")
);
app.use("/auth", require("../controllers/auth.controller.js"));
app.use("/employees", require("../controllers/employee.controller.js"));
app.use("/users", require("../controllers/user.controller.js"));
app.use("/profiles", require("../controllers/profile.controller.js"));
//app.use("/roles", require("../controllers/role.controller.js"));
app.use("/travels", require("../controllers/travel.controller.js"));
app.use("/packages", require("../controllers/package.controller.js"));
app.use("/dashboard/packages", require("../controllers/package.dashboard.controller.js"));
app.use("/locals", require("../controllers/local.controller.js"));
app.use("/permissions", require("../controllers/permission.controller.js"));
//app.use("/comments", require("../controllers/comment.controller.js"));


// Export the express application
module.exports = app;
