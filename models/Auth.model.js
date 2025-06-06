const mongoose = require("mongoose");

const authModelSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile_pic: { type: String, required: false },
    role: {
      type: String,
      enum: ["USER", "ADMIN", "HEAD", "PRAMUKH"],
      required: true,
    },
    heaightID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Heaight",
      required: function () {
        return this.role === "USER";
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", authModelSchema);
