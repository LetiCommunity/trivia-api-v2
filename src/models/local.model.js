// Import the mongoose library
const mongoose = require("mongoose");

// Destructure the Schema object from mongoose
const { Schema } = mongoose;

/**
 * Represents the Local model schema.
 * @typedef {Object} LocalSchema
 * @property {string} country - The country of the local.
 * @property {string} city - The city of the local.
 * @property {string} direction - The direction of the local.
 * @property {string} phoneNumber - The phone number of the local (unique).
 */

// Create a new schema for the "Local" model
const LocalSchema = new Schema(
  {
    country: { type: String, required: true },
    city: { type: String, required: true },
    direction: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Local", LocalSchema);
