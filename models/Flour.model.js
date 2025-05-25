const mongoose = require("mongoose");

const flourSchema = new mongoose.Schema({
  flourName: {
    type: String,
    required: true,
  },
  buildingId: { type: mongoose.Schema.Types.ObjectId, ref: "Building" },
});

module.exports = mongoose.model("Flour", flourSchema);
