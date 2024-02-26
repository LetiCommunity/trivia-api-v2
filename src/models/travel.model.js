// Import the mongoose library
const mongoose = require("mongoose");

// Destructure the Schema object from mongoose
const { Schema } = mongoose;

/**
 * @description Represents the Travel schema for storing travel information
 * @property {String} origin - The origin of the travel (required)
 * @property {String} destination - The destination of the travel (required)
 * @property {Date} date - The date of the travel (required)
 * @property {String} airport - The airport of the travel (required)
 * @property {String} terminal - The terminal of the travel (required)
 * @property {String} company - The company of the travel (required)
 * @property {String} billingTime - The billing time of the travel in HH:mm format (required)
 * @property {Number} availableWeight - The available weight for the travel (required)
 * @property {ObjectId} traveler - The reference to the User model for the traveler (required)
 * @property {Boolean} state - The state of the travel (required)
 */
const TravelSchema = new Schema(
  {
    // Define the origin field with type String and required
    origin: { type: String, required: true },
    // Define the destination field with type String and required
    destination: { type: String, required: true },
    // Define the date field with type Date and required
    date: { type: Date, required: true },
    // Define the airport field with type String and required
    airport: { type: String, required: true },
    // Define the terminal field with type String and required
    terminal: { type: String, required: true },
    // Define the company field with type String and required
    company: { type: String, required: true },
    // Define the billingTime field with type String and required
    billingTime: {
      type: String,
      validate: {
        // Add a custom validator for the hour format
        validator: (v) => /^[0-2][0-9]:[0-5][0-9]$/.test(v),
        message: (props) =>
          `${props.value} is not a valid hour format. Please use HH:mm:ss`,
      },
      required: true,
    },
    // Define the availableWeight field with type Number and required
    availableWeight: { type: Number, required: true },
    // Define the traveler field as a reference to the User model
    traveler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Define the state field with type Boolean and required
    state: { type: Boolean, required: true },
  },
  { timestamps: true }
);

// Create and export the Travel model using the TravelSchema
module.exports = mongoose.model("Travel", TravelSchema);
