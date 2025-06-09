const FlourModel = require("../models/Flour.model");
const { flourSchema } = require("../validators/Flour");
const FlatModel = require("../models/Flat.model");

exports.getFlour = async (req, res) => {
  try {
    const flours = await FlourModel.find({
      buildingId: req.params.id,
    }).populate("buildingId");
    res.json({ message: "Flour List", data: flours, status: true });
  } catch (error) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.addFlour = async (req, res) => {
  try {
    const { error } = flourSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const exitingFlour = await FlourModel.findOne({
      flourName: req.body.flourName,
      buildingId: req.body.buildingId,
    });
    if (exitingFlour)
      return res.status(400).json({ message: "Flour already exists" });

    const newFlour = await FlourModel.create(req.body);

    res.json({
      message: "Flour added successfully",
      data: newFlour,
      status: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.deleteFlour = async (req, res) => {
  try {
    const deletedFlour = await FlourModel.findByIdAndDelete(req.params.id);
    if (!deletedFlour)
      return res.status(404).json({ message: "Flour not found" });
    res.json({
      message: "Flour deleted successfully",
      status: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.updateFlour = async (req, res) => {
  try {
    const { error } = flourSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const updatedFlour = await FlourModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedFlour)
      return res.status(404).json({ message: "Flour not found" });
    res.json({
      message: "Flour updated successfully",
      data: updatedFlour,
      status: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.getFlourByID = async (req, res) => {
  try {
    const flours = await FlourModel.findOne({ _id: req.params.id }).populate(
      "buildingId"
    );
    if (!flours) return res.status(404).json({ message: "Flours not found" });
    res.json({ message: "Flours", data: flours, status: true });
  } catch (error) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.getFlourByBuildingID = async (req, res) => {
  try {
    const flours = await FlourModel.find({
      buildingId: req.params.id,
    }).populate("buildingId");
    if (!flours) return res.status(404).json({ message: "Flours not found" });
    res.json({ message: "Flours", data: flours, status: true });
  } catch (error) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};


exports.getFlourAndFlat = async (req, res) => {
  try {
    const flours = await FlourModel.find({
      buildingId: req.params.id,
    }).populate("buildingId");



    const filterFlourAndFlat = await Promise.all(
      flours.map(async (flour) => {
        const flats = await FlatModel.find({ flourId: flour._id });

        return {
          _id: flour._id,
          flourName: flour.flourName,
          flats: flats,
        };
      })
    );
    res.json({ message: "Flour List", data: filterFlourAndFlat, status: true });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server Error", status: false });
  }
};
