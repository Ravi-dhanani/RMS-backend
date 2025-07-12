const mongoose = require("mongoose");

const profilePicSchema = new mongoose.Schema(
  {
    image: { type: String, required: false },
    id: { type: String, required: false },
  },
  { _id: false }
);

const authModelSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["USER", "ADMIN", "MAIN_PRAMUKH", "PRAMUKH"],
      required: true,
    },

    profile_pic: {
      type: profilePicSchema,
      required: function () {
        return this.role === "USER";
      },
    },
    heaightID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Heaight",
      require: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", authModelSchema);
