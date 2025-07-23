const { flatValidationSchema } = require("../validators/Flat");
const FlatModel = require("../models/Flat.model");
const FlourModel = require("../models/Flour.model");
const FamilyMember = require("../models/user/FamilyMemberDetail");
const BusinessDetail = require("../models/user/BusinessDetail");
const VehicleDetail = require("../models/user/VehicleDetail");

exports.createFlat = async (req, res) => {
  try {
    const { error } = flatValidationSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const Flour = await FlourModel.findById(req.body.flourId);
    if (!Flour) return res.status(400).json({ message: "Flour not found" });

    const existingFlat = await FlatModel.findOne({
      flatName: req.body.flatName,
      flourId: req.body.flourId,
    });

    if (existingFlat) {
      return res
        .status(400)
        .json({ message: "Flat number already exists in this floor" });
    }
    const flat = await FlatModel.create({
      currentMember: req.body.currentMember || null,
      flatName: req.body.flatName,
      flourId: req.body.flourId,
      isBooked: req.body.currentMember ? "Booked" : "UnBooked",
    });
    res.status(201).json({
      message: "Flat created successfully",
      data: flat,
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.getFlats = async (req, res) => {
  try {
    const flats = await FlatModel.find({
      flourId: req.params.id,
    })
      .populate("flourId")
      .populate("currentMember");

    res.json({
      message: "Flats fetched successfully",
      data: flats,
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.getFlatById = async (req, res) => {
  try {
    const flat = await FlatModel.findById(req.params.id).populate("flourId");
    if (!flat) return res.status(404).json({ message: "Flat not found" });
    res.json({
      message: "Flat fetched successfully",
      data: flat,
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.updateFlat = async (req, res) => {
  try {
    const { error } = flatValidationSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const updatedFlat = await FlatModel.findByIdAndUpdate(
      req.params.id,
      {
        currentMember: req.body.currentMember || null,
        flatName: req.body.flatName,
        flourId: req.body.flourId,
        isBooked: req.body.currentMember ? "Booked" : "UnBooked",
      },
      { new: true }
    ).populate("flourId");
    if (!updatedFlat)
      return res.status(404).json({ message: "Flat not found" });
    res.json({
      message: "Flat updated successfully",
      data: updatedFlat,
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.deleteFlat = async (req, res) => {
  try {
    const deletedFlat = await FlatModel.findByIdAndDelete(req.params.id);
    if (!deletedFlat)
      return res.status(404).json({ message: "Flat not found" });
    res.json({
      message: "Flat deleted successfully",
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.getFlatsByFlour = async (req, res) => {
  try {
    const flats = await FlatModel.find({ flourId: req.params.id }).populate(
      "flourId"
    );
    res.json({
      message: "Flats fetched successfully",
      data: flats,
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.getFlatByUser = async (req, res) => {
  try {
    const flat = await FlatModel.findById(
      {
        _id: req.params.id,
      },
      {
        currentMember: 1,
      }
    )
      .populate("currentMember", "name email phone role profile_pic")
      .lean();

    console.log(flat);

    const [family, business, vehicle] = await Promise.all([
      FamilyMember.find({ userId: flat.currentMember._id }),
      BusinessDetail.findOne({ userId: flat.currentMember._id }),
      VehicleDetail.find({ userId: flat.currentMember._id }),
    ]);

    if (!flat) return res.status(404).json({ message: "Flat not found" });

    const member = flat.currentMember;

    res.json({
      message: "User Details fetched successfully",
      data: {
        flatId: flat._id,
        userId: member._id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role,
        profile_pic: member.profile_pic,
        family,
        business,
        vehicle,
      },

      status: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error", status: false });
  }
};
