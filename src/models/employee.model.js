const mongoose = require("mongoose");
const { Schema } = mongoose;

const EmployeeSchema = new Schema({
  permission: { type: String, required: true },
  local: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Local", required: true },
  ],
});

EmployeeSchema.set("timestamps", true);

module.exports = mongoose.model("Employee", EmployeeSchema);
