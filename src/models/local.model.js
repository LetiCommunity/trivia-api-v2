const mongoose = require("mongoose");
const { Schema } = mongoose;

const LocalSchema = new Schema({
  country: { type: String, required: true },
  city: { type: String, required: true },
  direction: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
});

LocalSchema.set("timestamps", true);

module.exports = mongoose.model("Local", LocalSchema);
