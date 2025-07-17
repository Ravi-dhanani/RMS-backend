const { string } = require("joi");
const mongoose = require("mongoose");

const maintenancePaymentSchema = new mongoose.Schema({
  maintenanceID: { type: mongoose.Schema.Types.ObjectId, ref: "Maintenance" },
  flatID: { type: mongoose.Schema.Types.ObjectId, ref: "Flat" },
  status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
});

module.exports = mongoose.model("MaintenancePayment", maintenancePaymentSchema);
