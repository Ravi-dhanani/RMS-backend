const mongoose = require("mongoose");

const flatSchema = new mongoose.Schema({
  flatName: { type: String, required: true },
  flourId: { type: mongoose.Schema.Types.ObjectId, ref: "Flour" },
  isBooked: {
    type: String,
    enum: ["Booked", "UnBooked"],
    default: "UnBooked",
  },
  currentMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    default: null,
  },
});

module.exports = mongoose.model("Flat", flatSchema);
