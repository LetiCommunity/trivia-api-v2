const mongoose = require("mongoose");
const { Schema } = mongoose;

const PackageSchema = new Schema({
  description: { type: String, required: true },
  weight: { type: Number, required: true },
  image: { type: String, required: true },
  receiverName: { type: String, required: true },
  receiverSurname: { type: String, required: true },
  receiverCity: { type: String, required: true },
  receiverStreet: { type: String, required: true },
  receiverPhone: { type: String, required: true },
  state: { type: String, required: true },
  proprietor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  traveler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

PackageSchema.set("timestamps", true);

module.exports = mongoose.model("Package", PackageSchema);
