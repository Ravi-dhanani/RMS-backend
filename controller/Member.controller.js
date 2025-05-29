const MemberModel = require("../models/Member.model");
const FlatModel = require("../models/Flat.model");

exports.createMember = async (req, res) => {
  try {
    const existingMember = await MemberModel.findOne({
      flatId: req.body.flatId,
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ message: "Member already exists In Flat", status: false });
    }
    const newMember = await MemberModel.create(req.body);
    await FlatModel.findByIdAndUpdate(
      {
        _id: req.body.flatId,
      },
      {
        currentMember: newMember._id,
        isBooked: "Booked",
      },
      {
        new: true,
      }
    );
    res.json({
      message: "Member created successfully",
      data: newMember,

      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.getAllMembers = async (req, res) => {
  try {
    const result = await MemberModel.find();
    res.json({
      message: "Members fetched successfully",
      data: result,
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.updateMemberById = async (req, res) => {
  try {
    const updatedMember = await MemberModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedMember) {
      return res
        .status(404)
        .json({ message: "Member not found", status: false });
    }
    res.json({
      message: "Member updated successfully",
      data: updatedMember,
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.deleteMemberById = async (req, res) => {
  try {
    const deletedMember = await MemberModel.findByIdAndDelete(req.params.id);

    if (!deletedMember) {
      return res
        .status(404)
        .json({ message: "Member not found", status: false });
    }
    await FlatModel.findByIdAndUpdate(
      {
        _id: deletedMember.flatId,
      },
      {
        currentMember: null,
        isBooked: "UnBooked",
      },
      {
        new: true,
      }
    );
    res.json({
      message: "Member deleted successfully",
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.getFlatByUser = async (req, res) => {
  try {
    const getmember = await MemberModel.findOne({
      flatId: req.params.id,
    });
    if (!getmember) {
      return res.status(404).json({ message: "Flat not found" });
    }
    res.json({
      message: "Flat fetched successfully",
      data: getmember,
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};
