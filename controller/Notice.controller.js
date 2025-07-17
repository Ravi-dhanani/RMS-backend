const getUserIdFromToken = require("../middleware/Auth");
const User = require("../models/Auth.model");
const Notice = require("../models/Notice.model");

exports.createNotice = async (req, res) => {
  try {
    const { title, description, heaightID, buildingID } = req.body;
    const id = await getUserIdFromToken(req.headers.authorization);
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    if (user.role === "MAIN_PRAMUKH") {
      if (!heaightID) {
        return res
          .status(400)
          .json({ status: false, message: "Height ID required" });
      }

      const notice = await Notice.create({
        title,
        description,
        createdBy: user._id,
        heaightID,
      });

      return res.status(201).json({
        status: true,
        message: "Notice created for height",
        data: notice,
      });
    }

    if (user.role === "PRAMUKH") {
      if (!buildingID) {
        return res
          .status(400)
          .json({ status: false, message: "Building ID required" });
      }

      const notice = await Notice.create({
        title,
        description,
        createdBy: user._id,
        buildingID,
      });

      return res.status(201).json({
        status: true,
        message: "Notice created for building",
        data: notice,
      });
    }

    return res
      .status(403)
      .json({ status: false, message: "You are not allowed to create notice" });
  } catch (error) {
    console.error("Create Notice Error:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.getNotice = async (req, res) => {
  try {
    const { heaightID, buildingID } = req.query;

    let query = {};

    if (buildingID) query.buildingID = buildingID;
    else if (heaightID) query.heaightID = heaightID;

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
    console.error("Get Notice Error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};
