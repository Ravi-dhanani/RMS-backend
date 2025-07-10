const { buildingValidationSchema } = require("../validators/Building");
const BuildingModel = require("../models/Building.model");
const HeaightModel = require("../models/Heaight.model");
const getUserIdFromToken = require("../middleware/Auth");
const authModel = require("../models/Auth.model");

exports.createBuilding = async (req, res) => {
  try {
    const { error } = buildingValidationSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const building = await BuildingModel.create(req.body);
    res.status(201).json({
      message: "Building created successfully",
      data: building,
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.getBuildings = async (req, res) => {
  try {
    const buildings = await BuildingModel.find({
      heaight: req.params.id,
    }).populate("heaight");
    res.json({
      message: "Buildings fetched successfully",
      data: buildings,
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.updateBuildingById = async (req, res) => {
  try {
    const { error } = buildingValidationSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const updatedBuilding = await BuildingModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({
      message: "Building updated successfully",
      data: updatedBuilding,
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.deleteBuildingById = async (req, res) => {
  try {
    const deletedBuilding = await BuildingModel.findByIdAndDelete(
      req.params.id
    );
    if (!deletedBuilding)
      return res
        .status(404)
        .json({ message: "Building not found", status: false });

    res.json({
      message: "Building deleted successfully",
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.getBuildingByUserId = async (req, res) => {
  try {
    const id = await getUserIdFromToken(req.headers.authorization);
    const buildingUsers = await BuildingModel.find({
      user: id,
    });
    const heaight = await HeaightModel.findOne(
      {
        "authorities.user": id,
      },
      { "authorities.user": 1, _id: 0 }
    ).populate("authorities.user");
    const result = {
      // authorityUsers: buildingUsers.flatMap(
      //   (building) =>
      //     building.heaight?.authorities?.map((auth) => auth.user) || []
      // ),
      heaight: heaight,
      building: buildingUsers,
    };

    res.json({
      message: "Buildings fetched successfully",
      data: result,
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", status: false });
  }
};

// exports.getSocietyByBuilding = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search = "" } = req.query;

//     const filter = {
//       heaight: req.params.id,
//       buildingName: { $regex: search, $options: "i" },
//     };

//     const buildings = await BuildingModel.find(filter)
//       .skip((page - 1) * limit)
//       .limit(Number(limit));

//     const totalBuildings = await BuildingModel.countDocuments(filter);
//     const heaights = await HeaightModel.findById(req.params.id);

//     if (!heaights)
//       return res
//         .status(404)
//         .json({ message: "Heaight not found", status: false });

//     const imagesHeights = await HeaightModel.findById(req.params.id)
//       .select("images")
//       .lean();
//     const authorHeights = await authModel.find(
//       {
//         heaightID: req.params.id,
//         role: "PRAMUKH",
//       },
//       {
//         name: 1,
//         email: 1,
//         phone: 1,
//         profile_pic: 1,
//         role: 1,
//         _id: 1,
//         heaightID: 1,
//       }
//     );
//     // const flattenedAuthorities = heaights.authorities.map((auth) => {
//     //   const { _id, name, email, phone, role, profile_pic } = auth.user || {};
//     //   return {
//     //     _id: auth._id,
//     //     name,
//     //     email,
//     //     phone,
//     //     role,
//     //     profile_pic,
//     //   };
//     // });
//     res.json({
//       message: "Heaight fetched successfully",
//       data: {
//         total: totalBuildings,
//         page: Number(page),
//         limit: Number(limit),
//         result: {
//           buildings,
//           authorities: authorHeights,
//           heightsImage: imagesHeights,
//         },
//       },
//       status: true,
//     });
//   } catch (err) {
//     console.error("Error:", err);
//     res.status(500).json({ message: "Server Error", status: false });
//   }
// };

exports.getSocietyByBuilding = async (req, res) => {
  try {
    // Direct filter only by heaight ID (no search, no pagination)
    const filter = { heaight: req.params.id };

    const buildings = await BuildingModel.find(filter);

    const heaights = await HeaightModel.findById(req.params.id);
    if (!heaights)
      return res
        .status(404)
        .json({ message: "Heaight not found", status: false });

    const imagesHeights = await HeaightModel.findById(req.params.id)
      .select("images")
      .lean();

    const authorHeights = await authModel.find(
      {
        heaightID: req.params.id,
        role: "PRAMUKH",
      },
      {
        name: 1,
        email: 1,
        phone: 1,
        profile_pic: 1,
        role: 1,
        _id: 1,
        heaightID: 1,
      }
    );

    res.json({
      message: "Heaight fetched successfully",
      data: {
        result: {
          buildings,
          authorities: authorHeights,
          heightsImage: imagesHeights,
        },
      },
      status: true,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server Error", status: false });
  }
};
