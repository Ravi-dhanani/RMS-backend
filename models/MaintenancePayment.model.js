const mongoose = require("mongoose");

const maintenancePaymentSchema = new mongoose.Schema({
  maintenanceID: { type: mongoose.Schema.Types.ObjectId, ref: "Maintenance" },
  flatID: { type: mongoose.Schema.Types.ObjectId, ref: "Flat" },
  status: { type: String, enum: ["Pending", "Complete"], default: "Pending" },
  paymentType: { type: String, enum: ["Cash", "Online"], default: null },
});

module.exports = mongoose.model("MaintenancePayment", maintenancePaymentSchema);
