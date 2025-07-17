const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    heaightID: { type: mongoose.Schema.Types.ObjectId, ref: "Heaight" },
    buildingID: { type: mongoose.Schema.Types.ObjectId, ref: "Building" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);
