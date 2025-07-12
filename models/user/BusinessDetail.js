const mongoose = require("mongoose");

const BusinessDetailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessName: { type: String, required: true },
    type: { type: String },
    ownerName: { type: String },
    address: { type: String },
    contactNo: { type: String },
    gstNo: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessDetail", BusinessDetailSchema);
