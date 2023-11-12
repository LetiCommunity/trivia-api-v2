const express = require("express");
const app = express();

app.use("/auth", require("../controllers/auth.controller.js"));
app.use("/users", require("../controllers/user.controller.js"));
//app.use("/roles", require("../controllers/role.controller.js"));
app.use("/travels", require("../controllers/travel.controller.js"));
app.use("/packages", require("../controllers/package.controller.js"));
//app.use("/comments", require("../controllers/comment.controller.js"));
//app.use("/locations", require("../controllers/location.controller.js"));

module.exports = app;