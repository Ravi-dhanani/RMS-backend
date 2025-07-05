const { heaightValidationSchema } = require("../validators/Heaight");
const HeaightModel = require("../models/Heaight.model");
const BuildingModel = require("../models/Building.model");
const cloudinary = require("../config/cloudinary");

// exports.createHeaight = async (req, res) => {
//   try {
//     const { error } = heaightValidationSchema.validate(req.body);
//     if (error)
//       return res.status(400).json({ message: error.details[0].message });
//     const existingHeaight = await HeaightModel.findOne({
//       name: req.body.name,
//     });
//     if (existingHeaight)
//       return res.status(400).json({ message: "Height already exists" });
//     const heaight = await HeaightModel.create(req.body);
//     res.status(201).json({
//       message: "Height created successfully",
//       data: heaight,
//       status: true,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server Error", status: false });
//   }
// };


exports.createHeaight = async (req, res) => {
  try {
    const files = req.files || [];
    if (!req.body) {
      return res.status(400).json({ message: "Missing 'data' field in request" });
    }

    let body;
    try {
      body = {
        name: req.body.name,
        address: req.body.address,
        authorities: JSON.parse(req.body.authorities),
      }
    } catch (err) {
      return res.status(400).json({ message: "Invalid JSON in 'data' field" });
    }

    const uploadedImages = await Promise.all(
      files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "heights" },
            (err, result) => {
              if (err) return reject(err);
              resolve({
                image: result.secure_url,
                id: result.public_id,
              });
            }
          );
          stream.end(file.buffer);
        });
      })
    );

    // Step 3: Attach images to body
    body.images = uploadedImages;

    // Step 4: Joi validation
    const { error } = heaightValidationSchema.validate(body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Step 5: Check for existing
    const existingHeaight = await HeaightModel.findOne({ name: body.name });
    if (existingHeaight) {
      return res.status(400).json({ message: "Height already exists" });
    }
    // Step 6: Create and respond
    const heaight = await HeaightModel.create({
      name: body.name,
      address: body.address,
      authorities: body.authorities.map((item) => ({ user: item.user })),
      images: body.images
    });
    res.status(201).json({
      message: "Height created successfully",
      data: heaight,
      status: true,
    });
  } catch (err) {
    console.error("Error in createHeaight:", err);
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

exports.getHeightsByID = async (req, res) => {
  try {
    const heights = await HeaightModel.findById({
      _id: req.params.id,
    }).populate("authorities.user");
    const building = await BuildingModel.find({
      heaight: heights._id,
    });
    res.json({
      message: "All heights retrieved successfully",
      data: {
        authorities: heights.authorities,
        building: building,
      },
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
