const mongoose = require("mongoose");

const FamilyMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    relation: { type: String, required: true },
    age: { type: Number },
    occupation: { type: String },
    contactNo: { type: String },
  },
  { _id: false }
);

const BusinessDetailSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    type: { type: String },
    ownerName: { type: String },
    address: { type: String },
    contactNo: { type: String },
    gstNo: { type: String },
  },
  { _id: false }
);

const VehicleDetailSchema = new mongoose.Schema(
  {
    vehicleType: { type: String, required: true },
    vehicleNo: { type: String, required: true },
  },
  { _id: false }
);

const memberSchema = new mongoose.Schema(
  {
    flatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: true,
    },

    name: { type: String, required: true },
    mobileNo: { type: String, required: true },
    profileImg: { type: String },

    familyMembers: [FamilyMemberSchema],
    businessDetails: [BusinessDetailSchema],
    vehicleDetails: [VehicleDetailSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
