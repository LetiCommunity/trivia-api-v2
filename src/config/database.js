/*
* Description: This module establishes a connection to the MongoDB database using Mongoose.
*/

const mongoose = require("mongoose"); // Importing the Mongoose library
const { MONGO_HOST, MONGO_DATABASE } = require("./environment"); // Importing the MONGO_HOST and MONGO_DATABASE from the environment module

/*
* Description: Constructs the URI for connecting to the MongoDB database
* Input: MONGO_HOST (string), MONGO_DATABASE (string)
* Output: URI (string)
*/
const URI = `${MONGO_HOST}${MONGO_DATABASE}`;

// Connecting to the MongoDB database
mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true }) // Added options object to the connect method to avoid deprecation warnings
  .then(() => console.log("Connected to database")) // Successful connection message
  .catch((err) => console.error("Error connecting to database", err)); // Error message if connection fails

module.exports = mongoose; // Exporting the mongoose object for use in other modules
