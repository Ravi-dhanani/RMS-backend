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
      enum: ["USER", "ADMIN"],
      required: true,
    },
    subRoles: {
      type: [String],
      enum: ["HEAD", "PRAMUKH"],
      default: [],
    },
    profile_pic: {
      type: profilePicSchema,
      required: function () {
        return this.role === "USER" || this.subRoles.includes("HEAD") || this.subRoles.includes("PRAMUKH");
      },
    },
    heaightID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Heaight",
      require: false
    },


    familyMembers: [FamilyMemberSchema],

    businessDetails: [BusinessDetailSchema],
    vehicleDetails: [VehicleDetailSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", authModelSchema);
