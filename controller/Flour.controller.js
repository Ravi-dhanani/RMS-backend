const FlourModel = require("../models/Flour.model");
const { flourSchema } = require("../validators/Flour");

exports.getFlour = async (req, res) => {
  try {
    const flours = await FlourModel.find();
    res.json({ data: flours, status: true });
  } catch (error) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.addFlour = async (req, res) => {
  try {
    const { error } = flourSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
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
