// Import the mongoose library
const mongoose = require("mongoose");

// Destructure the Schema object from mongoose
const { Schema } = mongoose;

/**
 * @description Represents the Permission schema
 * @property {String} name - The name of the permission (required, unique)
 */
const PermissionSchema = new Schema(
  {
    name: { type: String, required: true, unique: true }, // Define the 'name' field with type, required, and unique properties
  },
  { timestamps: true } // Enable timestamps for the RoleSchema
);

// Export the Permission model based on the PermissionSchema
module.exports = mongoose.model("Permission", PermissionSchema);
