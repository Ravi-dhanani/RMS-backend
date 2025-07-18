const { heaightValidationSchema } = require("../validators/Heaight");
const HeaightModel = require("../models/Heaight.model");
const BuildingModel = require("../models/Building.model");

const getUserIdFromToken = require("../middleware/Auth");
exports.createHeaight = async (req, res) => {
  try {
    const { error } = heaightValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const existingHeaight = await HeaightModel.findOne({ name: req.body.name });
    if (existingHeaight) {
      return res.status(400).json({ message: "Height already exists" });
    }
    const heaight = await HeaightModel.create({
      name: req.body.name,
      address: req.body.address,
      images: req.body.images,
      city: req.body.city,
      pincode: req.body.pincode,
    });

    res.status(201).json({
      message: "Height created successfully",
      data: heaight,
      status: true,
    });
  } catch (err) {
    console.error("Error in createHeaight:", err);
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.getAllHeights = async (req, res) => {
  try {
    const heights = await HeaightModel.find();
    res.json({
      message: "All heights retrieved successfully",
      data: heights,
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.getHeightsByID = async (req, res) => {
  try {
    const heights = await HeaightModel.findById({
      _id: req.params.id,
    }).populate("authorities.user");
    const building = await BuildingModel.find({
      heaight: heights._id,
    });
    res.json({
      message: "All heights retrieved successfully",
      data: {
        authorities: heights.authorities,
        building: building,
      },
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.updateHeight = async (req, res) => {
  try {
    const { error } = heaightValidationSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const height = await HeaightModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!height) return res.status(404).json({ message: "Height not found" });
    res.json({
      message: "Height updated successfully",
      data: height,
      status: true,
    });
  } catch (err) {
    if (err.kind === "ObjectId")
      return res.status(404).json({ message: "Height not found" });
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.deleteHeight = async (req, res) => {
  try {
    const height = await HeaightModel.findByIdAndDelete(req.params.id);
    if (!height)
      return res
        .status(404)
        .json({ message: "Height not found", status: false });
    res.json({
      message: "Height deleted successfully",
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};
