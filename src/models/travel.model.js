const mongoose = require("mongoose");
const { Schema } = mongoose;

const TravelSchema = new Schema({
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  date: { type: Date, required: true },
  airport: { type: String, required: true },
  terminal: { type: String, required: true },
  company: { type: String, required: true },
  billingTime: {
    type: String,
    validate: {
      validator: (v) => /^[0-2][0-9]:[0-5][0-9]$/.test(v),
      message: (props) =>
        `${props.value} is not a valid hour format. Please use HH:mm:ss`,
    },
    required: true,
  },
  availableWeight: { type: Number, required: true },
  traveler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  state: { type: Boolean, required: true },
});

TravelSchema.set("timestamps", true);

module.exports = mongoose.model("Travel", TravelSchema);
