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
    console.error("Create Maintenance Error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

exports.getMaintenance = async (req, res) => {
  try {
    const { heaightID, buildingID } = req.query;

    let maintenanceQuery = {};
    if (heaightID) maintenanceQuery.heaightID = heaightID;
    if (buildingID) maintenanceQuery.buildingID = buildingID;

    // ✅ Get Maintenance
    const maintenanceList = await Maintenance.find(maintenanceQuery)
      .populate("buildingID", "buildingName")
      .populate("heaightID", "name")
      .lean();

    if (!maintenanceList.length) {
      return res
        .status(404)
        .json({ status: false, message: "No maintenance found" });
    }

    // ✅ If buildingID provided, show floors & flats details
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
    console.error("Error fetching maintenance:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.getUserMaintenance = async (req, res) => {
  try {
    const { userID } = req.params;
    const { status } = req.query;
    console.log(userID);
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
      .populate("buildingID", "buildingName")
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
          flat: {
            flatID: user.flatID._id,
            flatName: user.flatID.flatName,
          },
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
    console.error("Error fetching user maintenance:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { flatID, maintenanceID, paymentType, status } = req.body;
    const id = await getUserIdFromToken(req.headers.authorization);

    const user = await User.findById(id);
    console.log(user);
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
    console.error("Error updating payment status:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
