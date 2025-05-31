const { heaightValidationSchema } = require("../validators/Heaight");
const HeaightModel = require("../models/Heaight.model");

exports.createHeaight = async (req, res) => {
  try {
    const { error } = heaightValidationSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const existingHeaight = await HeaightModel.findOne({
      name: req.body.name,
    });
    if (existingHeaight)
      return res.status(400).json({ message: "Height already exists" });
    const heaight = await HeaightModel.create(req.body);
    res.status(201).json({
      message: "Height created successfully",
      data: heaight,
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.getAllHeights = async (req, res) => {
  try {
    const heights = await HeaightModel.find().populate("authorities.user");
    res.json({
      message: "All heights retrieved successfully",
      data: heights,
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
