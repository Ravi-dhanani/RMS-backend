const mongoose = require("mongoose");

const FamilyMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    relation: { type: String, required: true },
    age: { type: Number },
    occupation: { type: String },
    contactNo: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FamilyMember", FamilyMemberSchema);
