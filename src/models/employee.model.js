// Import the mongoose library
const mongoose = require("mongoose");

// Destructure the Schema object from mongoose
const { Schema } = mongoose;

/**
 * Employee Schema
 * @description Defines the schema for the Employee model
 */
const EmployeeSchema = new Schema(
  {
    /**
     * user - Reference to the "User" model
     * @type {mongoose.Schema.Types.ObjectId}
     * @ref "User"
     * @required
     */
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    /**
     * local - Reference to the "Local" model
     * @type {mongoose.Schema.Types.ObjectId}
     * @ref "Local"
     * @required
     */
    local: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Local",
      required: true,
    },

    /**
     * permissions - Array of references to the "Permission" model
     * @type {Array<mongoose.Schema.Types.ObjectId>}
     * @ref "Permission"
     * @required
     */
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
        required: true,
      },
    ],
  },
  // Enable timestamps for the schema
  { timestamps: true }
);

// Export the Employee model based on the EmployeeSchema
module.exports = mongoose.model("Employee", EmployeeSchema);
