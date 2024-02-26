// Import the mongoose library
const mongoose = require("mongoose");

// Destructure the Schema object from mongoose
const { Schema } = mongoose;

/**
 * Represents the Role model schema
 * @param {String} name - The name of the role (required, unique)
 * @returns {Object} - The Role model schema
 */
const RoleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true }, // Define the name field with type, required, and unique properties
  },
  { timestamps: true } // Enable timestamps for the RoleSchema
);

// Export the Role model using the RoleSchema
module.exports = mongoose.model("Role", RoleSchema);
