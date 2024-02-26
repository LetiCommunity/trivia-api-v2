// Import the mongoose library
const mongoose = require("mongoose");

// Destructure the Schema object from mongoose
const { Schema } = mongoose;

/**
 * User Schema
 * @description Represents the schema for the User model
 */
const UserSchema = new Schema(
  {
    name: { type: String, required: true }, // User's name
    surname: { type: String, required: true }, // User's surname
    phoneNumber: { type: String, required: true, unique: true }, // User's phone number (unique)
    email: { type: String }, // User's email
    image: { type: String }, // User's image URL
    username: { type: String, required: true, unique: true }, // User's username (unique)
    password: { type: String, required: true }, // User's password
    roles: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true }, // Array of user roles
    ],
    state: { type: Boolean, required: true }, // User's state (active/inactive)
  },
  { timestamps: true }
); // Enable timestamps for createdAt and updatedAt

// Create and export the User model
module.exports = mongoose.model("User", UserSchema);
