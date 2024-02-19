const mongoose = require("mongoose");
const { Schema } = mongoose;

const EmployeeSchema = new Schema({
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  local: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Local", required: true },
  ],
  permission: { type: String, required: true },
});

EmployeeSchema.set("timestamps", true);

module.exports = mongoose.model("Employee", EmployeeSchema);
