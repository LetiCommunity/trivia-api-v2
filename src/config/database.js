const mongoose = require("mongoose");
const { MONGO_HOST, MONGO_DATABASE } = require("./environment");

const URI = MONGO_HOST + MONGO_DATABASE;
mongoose
  .connect(URI)
  .then((db) => console.log("Connected to database"))
  .catch((err) => console.log("Error connecting to database", err));

module.exports = mongoose;
