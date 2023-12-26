const mongoose = require("mongoose");
const { Schema } = mongoose;

const TravelSchema = new Schema({
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  date: { type: Date, required: true },
  airport: { type: String, required: true },
  terminal: { type: String, required: true },
  company: { type: String, required: true },
  billingTime: { type: Date, required: true },
  availableWeight: { type: Date, required: true },
  traveler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

TravelSchema.set("timestamps", true);

module.exports = mongoose.model("Travel", TravelSchema);
