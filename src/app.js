// Import required modules
const express = require("express"); // Importing the express module for creating the web server
const fileUpload = require("express-fileupload"); // Importing the fileUpload module for handling file uploads
const cors = require("cors"); // Importing the cors module for enabling Cross-Origin Resource Sharing
const cookieParser = require("cookie-parser"); // Importing the cookie-parser module for parsing cookies in the request object
const morgan = require("morgan"); // Importing the morgan module for HTTP request logging
const bodyParser = require("body-parser"); // Importing the body-parser module for parsing incoming request bodies
const path = require("path"); // Importing the path module for working with file and directory paths
const app = express(); // Creating an instance of the express application
const { mongoose } = require("./config/database"); // Importing the mongoose object for database connection
const { PORT } = require("./config/environment"); // Importing the PORT constant for defining the server port
const init = require("./bin/init"); // Importing the init module for initializing the database connection
const syntaxError = require("./middleware/syntaxError"); // Importing the syntaxError middleware for handling syntax errors

// Initialize database connection
init(); // Calling the init function to initialize the database connection

/* Middlewares */

// Define an array to combine middleware functions
const middlewares = [
  cors(), // Enabling CORS using the cors middleware
  morgan("dev"), // Logging HTTP requests using the morgan middleware with 'dev' format
  cookieParser(), // Parsing cookies in the request object using the cookie-parser middleware
  bodyParser.json(), // Parsing JSON bodies in the request object using the body-parser middleware
  bodyParser.urlencoded({ extended: true }), // Parsing URL-encoded bodies with extended mode using the body-parser middleware
  fileUpload(), // Handling file uploads using the fileUpload middleware
  syntaxError, // Handling syntax errors using the syntaxError middleware
];

// Apply middlewares using a loop
middlewares.forEach((middleware) => {
  app.use(middleware); // Applying each middleware to the express application
});

// Routes
app.use("/api/trivia", require("./routes/index")); // Using the index route for handling requests related to trivia API

// Serve static files
app.use(express.static(path.join(__dirname, "public"))); // Serving static files from the 'public' directory

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Starting the server and logging the port on which the server is running
});
