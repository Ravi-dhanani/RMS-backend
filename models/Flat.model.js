const mongoose = require("mongoose");

const flatSchema = new mongoose.Schema({
  flatName: { type: String, required: true },
  flourId: { type: mongoose.Schema.Types.ObjectId, ref: "Flour" },
  isBooked: {
    type: String,
    enum: ["Booked", "UnBooked"],
    default: "UnBooked",
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  famalyMembers: [
    {
      firstName: { type: String, required: false },
      lastName: { type: String, required: false },
      age: { type: Number, required: false },
      occupation: { type: String, required: false },
      relationship: { type: String, required: false },
      contactNo: { type: String, required: false },
    },
  ],
});

module.exports = mongoose.model("Flat", flatSchema);
