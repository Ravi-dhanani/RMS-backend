const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    month: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    heaightID: { type: mongoose.Schema.Types.ObjectId, ref: "Heaight" },
    buildingID: { type: mongoose.Schema.Types.ObjectId, ref: "Building" },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Maintenance", maintenanceSchema);
