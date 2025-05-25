const mongoose = require("mongoose");

const flatSchema = new mongoose.Schema({
  flatName: String,
  flourId: { type: mongoose.Schema.Types.ObjectId, ref: "Flour" },
  isBooked: {
    type: String,
    enum: ["Booked", "UnBooked"],
    default: "UnBooked",
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Flat", flatSchema);
