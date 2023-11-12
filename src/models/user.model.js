const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String },
  Image: { type: String, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
  ],
});

module.exports = mongoose.model("User", UserSchema);
