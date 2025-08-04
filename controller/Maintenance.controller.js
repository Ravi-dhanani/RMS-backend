const getUserIdFromToken = require("../middleware/Auth");
const Maintenance = require("../models/Maintenance.model");
const User = require("../models/Auth.model");
const Building = require("../models/Building.model");
const Flat = require("../models/Flat.model");
const Flour = require("../models/Flour.model");
const MaintenancePayment = require("../models/MaintenancePayment.model");

exports.createMaintenance = async (req, res) => {
  const session = await Maintenance.startSession();
  session.startTransaction();
  try {
    const { title, month, description, amount, dueDate, heaightID } = req.body;
    const id = await getUserIdFromToken(req.headers.authorization);

    const user = await User.findById(id).session(session);
    if (!user)
      return res.status(404).json({ status: false, message: "User not found" });

    if (user.role !== "MAIN_PRAMUKH") {
      return res.status(403).json({
        status: false,
        message: "You are not allowed to create maintenance",
      });
    }

    if (!heaightID) {
      return res
        .status(400)
        .json({ status: false, message: "Height ID required" });
    }

    const buildings = await Building.find({ heaight: heaightID })
      .session(session)
      .lean();

    if (!buildings.length) {
      return res.status(400).json({
        status: false,
        message: "No buildings found under this Height",
      });
    }

    let allPayments = [];

    const maintenanceList = await Promise.all(
      buildings.map(async (building) => {
        const [maintenance] = await Maintenance.create(
          [
            {
              title,
              month,
              description,
              amount,
              dueDate,
              heaightID,
              buildingID: building._id,
              createdBy: user._id,
            },
          ],
          { session }
        );

        const floors = await Flour.find({ buildingId: building._id })
          .session(session)
          .lean();
        const flats = await Flat.find({
          flourId: { $in: floors.map((f) => f._id) },
        })
          .session(session)
          .lean();

        const payments = flats.map((flat) => ({
          maintenanceID: maintenance._id,
          flatID: flat._id,
          status: "Pending",
        }));
        allPayments.push(...payments);

        return maintenance;
      })
    );

    if (allPayments.length) {
      await MaintenancePayment.insertMany(allPayments, { session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: true,
      message: `Maintenance created for ${buildings.length} buildings and assigned payments to flats.`,
      data: maintenanceList,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getMaintenance = async (req, res) => {
  try {
    const { heaightID, buildingID, month } = req.query;

    let maintenanceQuery = {};

    if (heaightID) maintenanceQuery.heaightID = heaightID;
    if (buildingID) maintenanceQuery.buildingID = buildingID;

    if (month) maintenanceQuery.month = month;

    const maintenanceList = await Maintenance.find(maintenanceQuery)
      .populate("buildingID", "buildingName")
      .populate("heaightID", "name")
      .lean();

    if (!maintenanceList.length) {
      return res
        .status(404)
        .json({ status: false, message: "No maintenance found" });
    }

    if (buildingID) {
      for (let maintenance of maintenanceList) {
        const floors = await Flour.find({ buildingId: buildingID }).lean();
        for (let floor of floors) {
          floor.flats = await Flat.find({ flourId: floor._id })
            .select("flatName currentMember isBooked")
            .populate("currentMember", "name")
            .lean();

          floor.flats = floor.flats.map((flat) => ({
            ...flat,
            paymentStatus: flat.isBooked === "Booked" ? "Pending" : "Complete",
          }));
        }
        maintenance.floors = floors;
      }
    }

    res.status(200).json({
      status: true,
      message: "Maintenance fetched successfully",
      data: maintenanceList,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.getMaintenanceMonthWise = async (req, res) => {
  try {
    const id = await getUserIdFromToken(req.headers.authorization);
    const userFlat = await Flat.findOne({ currentMember: id })
      .populate({
        path: "currentMember",
        select: "name",
      })
      .populate({
        path: "flourId",
        populate: {
          path: "buildingId",
          select: "heaight",
        },
      })
      .lean();

    if (!userFlat) {
      return res.status(404).json({
        status: false,
        message: "User flat not found",
      });
    }

    const heightID = userFlat.flourId?.buildingId?.heaight;

    if (!heightID) {
      return res.status(404).json({
        status: false,
        message: "Height not found for user",
      });
    }

    const monthData = await Maintenance.aggregate([
      {
        $match: { heaightID: heightID },
      },
      {
        $group: {
          _id: "$month",
          firstEntry: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$firstEntry" },
      },
      {
        $sort: { month: -1 },
      },
    ]);

    if (!monthData.length) {
      return res.status(404).json({
        status: false,
        message: "No maintenance found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Maintenance fetched month-wise successfully",
      data: monthData,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getUserMaintenance = async (req, res) => {
  try {
    const { userID } = req.params;
    const { status } = req.query;

    const user = await User.findById(userID)
      .populate("flatID", "flatName flourId")
      .populate("buildingID", "buildingName")
      .lean();

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    if (!user.flatID) {
      return res
        .status(404)
        .json({ status: false, message: "User has no flat assigned" });
    }

    // ✅ Find all maintenance for user's building
    const maintenances = await Maintenance.find({ buildingID: user.buildingID })
      .select("title month description amount createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const maintenanceWithPaymentStatus = await Promise.all(
      maintenances.map(async (maintenance) => {
        const payment = await MaintenancePayment.findOne({
          maintenanceID: maintenance._id,
          flatID: user.flatID._id,
        }).lean();

        const paymentStatus = payment ? payment.status : "Pending";

        return {
          ...maintenance,
          paymentStatus,
        };
      })
    );

    let filteredData = maintenanceWithPaymentStatus;
    if (status) {
      filteredData = maintenanceWithPaymentStatus.filter(
        (item) => item.paymentStatus.toLowerCase() === status.toLowerCase()
      );
    }

    res.status(200).json({
      status: true,
      message: "User maintenance fetched successfully",
      data: filteredData,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { flatID, maintenanceID, paymentType, status } = req.body;
    const id = await getUserIdFromToken(req.headers.authorization);

    const user = await User.findById(id);
    if (!["MAIN_PRAMUKH", "PRAMUKH"].includes(user.role)) {
      return res.status(403).json({
        status: false,
        message: `You are not allowed (${user.role}) to update payment status`,
      });
    }

    // Input validation
    if (!flatID || !maintenanceID) {
      return res.status(400).json({
        status: false,
        message: "flatID and maintenanceID are required",
      });
    }

    if (!["Pending", "Complete"].includes(status)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid status value" });
    }

    if (status === "Complete" && !["Cash", "Online"].includes(paymentType)) {
      return res.status(400).json({
        status: false,
        message: "Payment type is required when status is Paid",
      });
    }

    const payment = await MaintenancePayment.findOne({ flatID, maintenanceID });

    if (!payment) {
      return res
        .status(404)
        .json({ status: false, message: "Payment record not found" });
    }

    payment.status = status;
    payment.paymentType = status === "Complete" ? paymentType : null;

    await payment.save();

    return res.status(200).json({
      status: true,
      message: "Payment status updated successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getCurrentMonthMaintenance = async (req, res) => {
  try {
    const id = await getUserIdFromToken(req.headers.authorization);

    const userFlat = await Flat.findOne({ currentMember: id })
      .populate({
        path: "currentMember",
        select: "name",
      })
      .populate({
        path: "flourId",
        populate: {
          path: "buildingId",
          select: "heaight",
        },
      })
      .lean();

    if (!userFlat) {
      return res.status(404).json({
        status: false,
        message: "User flat not found",
      });
    }

    const heightID = userFlat.flourId?.buildingId?.heaight;

    if (!heightID) {
      return res.status(404).json({
        status: false,
        message: "Height not found for user",
      });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    const currentMaintenance = await Maintenance.findOne({
      heaightID: heightID,
      month: currentMonth,
    })
      .populate("buildingID", "buildingName")
      .populate("heaightID", "name")
      .lean();

    if (!currentMaintenance) {
      return res.status(404).json({
        status: false,
        message: "No maintenance found for current month",
      });
    }

    res.status(200).json({
      status: true,
      message: "Current month maintenance fetched successfully",
      data: currentMaintenance,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};
