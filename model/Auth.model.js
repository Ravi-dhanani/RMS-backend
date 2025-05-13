const mongoose = require("mongoose");

const authModelSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile_pic: { type: String },
    role: { type: String, enum: ["USER", "ADMIN", "HEAD"], required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", authModelSchema);
