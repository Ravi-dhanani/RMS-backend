const mongoose = require("mongoose");

const VehicleDetailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicleType: { type: String, required: true },
    vehicleNo: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VehicleDetail", VehicleDetailSchema);
