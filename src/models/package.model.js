// Import the necessary modules
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Define the package schema
const PackageSchema = new Schema(
  {
    /**
     * Description of the package
     * @type {String}
     * @required
     */
    description: { type: String, required: true },

    /**
     * Weight of the package
     * @type {Number}
     * @required
     */
    weight: { type: Number, required: true },

    /**
     * Image URL of the package
     * @type {String}
     * @required
     */
    image: { type: String, required: true },

    /**
     * Name of the package receiver
     * @type {String}
     * @required
     */
    receiverName: { type: String, required: true },

    /**
     * Surname of the package receiver
     * @type {String}
     * @required
     */
    receiverSurname: { type: String, required: true },

    /**
     * City of the package receiver
     * @type {String}
     * @required
     */
    receiverCity: { type: String, required: true },

    /**
     * Street address of the package receiver
     * @type {String}
     * @required
     */
    receiverStreet: { type: String, required: true },

    /**
     * Phone number of the package receiver
     * @type {String}
     * @required
     */
    receiverPhone: { type: String, required: true },

    /**
     * State of the package
     * @type {String}
     * @required
     */
    state: { type: String, required: true },

    /**
     * Proprietor of the package
     * @type {Schema.Types.ObjectId}
     * @ref {User}
     * @required
     */
    proprietor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /**
     * Traveler carrying the package
     * @type {Schema.Types.ObjectId}
     * @ref {User}
     */
    traveler: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Create and export the Package model
module.exports = model("Package", PackageSchema);
