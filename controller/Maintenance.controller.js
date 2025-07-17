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
          status: "Unpaid",
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
            paymentStatus: flat.isBooked === "Booked" ? "Unpaid" : "UnBooked",
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
