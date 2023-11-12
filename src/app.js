const express = require("express");
const fileUpload = require('express-fileupload')
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const bodyParser = require("body-parser");
const path = require("path");
const app = express();

const { mongoose } = require("./config/database");
const { PORT } = require("./config/environment");
const init = require("./bin/init");
const syntaxError = require("./middleware/syntaxError");

init();

/* Middlewares */

// Cors middleware
app.use(cors());
// To log all communication to the server
app.use(morgan("dev"));
// Parse cookies
app.use(cookieParser());
// Parse application/json
app.use(bodyParser.json());
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// SyntaxError control
app.use(fileUpload());
// Upload file
app.use(syntaxError);
//Routes
app.use("/api/trivia", require("./routes/index"));

//Static files
app.use(express.static(path.join(__dirname, "public")));

//Starting server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
