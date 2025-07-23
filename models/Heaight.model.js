const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true, // typo fixed: "require" → "required"
    },
    id: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const heaightSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    // admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // authorities: [authoritySchema],
    images: [imageSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Heaight", heaightSchema);
