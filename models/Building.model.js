const mongoose = require("mongoose");
const buildingSchema = new mongoose.Schema({
  buildingName: { type: String, required: true },
  heaight: { type: mongoose.Schema.Types.ObjectId, ref: "Heaight" },
});
module.exports = mongoose.model("Building", buildingSchema);
