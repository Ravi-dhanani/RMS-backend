const getUserIdFromToken = require("../middleware/Auth");
const User = require("../models/Auth.model");
const Notice = require("../models/Notice.model");

exports.createNotice = async (req, res) => {
  try {
    const { title, description } = req.body;
    const id = await getUserIdFromToken(req.headers.authorization);

    const user = await User.findById(id)
      .select("role heaightID buildingID")
      .lean();

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const noticeData = {
      title,
      description,
      createdBy: user._id,
    };

    if (user.role === "MAIN_PRAMUKH") {
      if (!user.heaightID) {
        return res.status(400).json({
          status: false,
          message: "Height ID is not assigned to this user",
        });
      }
      noticeData.heaightID = user.heaightID;
    } else if (user.role === "PRAMUKH") {
      if (!user.buildingID) {
        return res.status(400).json({
          status: false,
          message: "Building ID is not assigned to this user",
        });
      }
      noticeData.buildingID = user.buildingID;
    } else {
      return res.status(403).json({
        status: false,
        message: "You are not allowed to create notice",
      });
    }

    const notice = await Notice.create(noticeData);

    res.status(201).json({
      status: true,
      message: "Notice created successfully",
      data: notice,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getNotice = async (req, res) => {
  try {
    const { type } = req.query;

    const id = await getUserIdFromToken(req.headers.authorization);
    const user = await User.findById(id)
      .select("role heaightID buildingID")
      .lean();

    let query = {};

    if (type === "all") {
      query = {};
    } else if (type === "heights") {
      if (!user.heaightID) {
        return res
          .status(400)
          .json({ status: false, message: "User does not have height access" });
      }
      query.heaightID = user.heaightID;
    } else if (type === "building") {
      if (!user.buildingID) {
        return res.status(400).json({
          status: false,
          message: "User does not have building access",
        });
      }
      query.buildingID = user.buildingID;
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Invalid type parameter" });
    }

    const notices = await Notice.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name role")
      .lean();

    res.status(200).json({
      status: true,
      message: "Notice fetched successfully",
      data: notices,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
