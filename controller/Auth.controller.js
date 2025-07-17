const authModel = require("../models/Auth.model");
const moment = require("moment");
const Flat = require("../models/Flat.model");
const {
  authValidationSchema,
  loginValidationSchema,
} = require("../validators/Auth");
const FamilyMember = require("../models/user/FamilyMemberDetail");
const BusinessDetail = require("../models/user/BusinessDetail");
const VehicleDetail = require("../models/user/VehicleDetail");
const jwt = require("jsonwebtoken");
const { familyMembersArraySchema } = require("../validators/Family");
const { businessDetailsArraySchema } = require("../validators/Business");
const { vehicleDetailsArraySchema } = require("../validators/Vehicle");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");
const Maintenance = require("../models/Maintenance.model");

exports.register = async (req, res) => {
  const session = await authModel.startSession();
  session.startTransaction();

  try {
    // 1. Validate main user data
    const { error: authError } = authValidationSchema.validate(req.body);
    if (authError) {
      return res.status(400).json({
        message: authError.details[0].message,
        status: false,
      });
    }

    const {
      name,
      email,
      phone,
      password,
      role,
      heaightID,
      buildingID,
      flourID,
      flatID,
      profile_pic,
      subRoles,
      familyMembers = [],
      businessDetails = [],
      vehicleDetails = [],
    } = req.body;

    // 2. Validate user-specific data
    if (role === "USER") {
      const { error: familyError } =
        familyMembersArraySchema.validate(familyMembers);
      console.log(familyError);
      if (familyError) {
        return res.status(400).json({
          message: "Invalid family member details",
          details: familyError.details,
          status: false,
        });
      }

      const { error: businessError } =
        businessDetailsArraySchema.validate(businessDetails);
      if (businessError) {
        return res.status(400).json({
          message: "Invalid business details",
          details: businessError.details,
          status: false,
        });
      }

      const { error: vehicleError } =
        vehicleDetailsArraySchema.validate(vehicleDetails);
      if (vehicleError) {
        return res.status(400).json({
          message: "Invalid vehicle details",
          details: vehicleError.details,
          status: false,
        });
      }
    }

    // 3. Check duplicate phone number
    const userExists = await authModel.findOne({ phone });
    if (userExists) {
      return res.status(400).json({
        message: "Phone Number already exists",
        status: false,
      });
    }

    // 4. Create user
    const newUser = await authModel.create(
      [
        {
          name,
          email,
          phone,
          password,
          role,
          heaightID,
          buildingID,
          flourID,
          flatID,
          subRoles,
          profile_pic: profile_pic
            ? { id: profile_pic.id, image: profile_pic.image }
            : null,
        },
      ],
      { session }
    );

    const userId = newUser[0]._id;
    if (flatID) {
      await Flat.findByIdAndUpdate(
        flatID,
        { currentMember: userId, isBooked: "Booked" },
        { session }
      );
    }
    // 5. Create related documents
    if (familyMembers.length) {
      const familyWithUser = familyMembers.map((item) => ({ ...item, userId }));
      await FamilyMember.insertMany(familyWithUser, { session });
    }

    if (businessDetails.length) {
      const businessWithUser = businessDetails.map((item) => ({
        ...item,
        userId,
      }));
      await BusinessDetail.insertMany(businessWithUser, { session });
    }

    if (vehicleDetails.length) {
      const vehicleWithUser = vehicleDetails.map((item) => ({
        ...item,
        userId,
      }));
      await VehicleDetail.insertMany(vehicleWithUser, { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "User registered successfully",
      data: newUser[0],
      status: true,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      message: "Server Error",
      error: err.message,
      status: false,
    });
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      name = "",
      phone = "",
      flat = "",
      vehicleNo = "",
      businessCategory = "",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const matchStage = { heaightID: new mongoose.Types.ObjectId(id) };
    const flatAssignedFilter = { "flatInfo._id": { $ne: null } };

    // Dynamic Manual Search Filter
    const searchConditions = [];

    if (name)
      searchConditions.push({ name: { $regex: new RegExp(name, "i") } });
    if (phone)
      searchConditions.push({ phone: { $regex: new RegExp(phone, "i") } });
    if (flat)
      searchConditions.push({
        "flatInfo.flatName": { $regex: new RegExp(flat, "i") },
      });
    if (vehicleNo)
      searchConditions.push({
        "vehicleDetails.vehicleNo": { $regex: new RegExp(vehicleNo, "i") },
      });
    if (businessCategory)
      searchConditions.push({
        "businessDetails.type": { $regex: new RegExp(businessCategory, "i") },
      });

    const pipeline = [
      { $match: matchStage },

      {
        $lookup: {
          from: "flats",
          localField: "_id",
          foreignField: "currentMember",
          as: "flatInfo",
        },
      },
      { $unwind: { path: "$flatInfo", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "businessdetails",
          localField: "_id",
          foreignField: "userId",
          as: "businessDetails",
        },
      },
      {
        $lookup: {
          from: "vehicledetails",
          localField: "_id",
          foreignField: "userId",
          as: "vehicleDetails",
        },
      },

      { $match: flatAssignedFilter },

      ...(searchConditions.length > 0
        ? [{ $match: { $and: searchConditions } }]
        : []),

      {
        $project: {
          name: 1,
          phone: 1,
          profile_pic: 1,
          flatId: "$flatInfo._id",
          flatName: "$flatInfo.flatName",
          businessType: { $arrayElemAt: ["$businessDetails.type", 0] },
          vehicleNo: { $arrayElemAt: ["$vehicleDetails.vehicleNo", 0] },
        },
      },

      { $skip: skip },
      { $limit: parseInt(limit) },
    ];

    const [data, totalCountArr] = await Promise.all([
      authModel.aggregate(pipeline),
      authModel.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "flats",
            localField: "_id",
            foreignField: "currentMember",
            as: "flatInfo",
          },
        },
        { $unwind: { path: "$flatInfo", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "businessdetails",
            localField: "_id",
            foreignField: "userId",
            as: "businessDetails",
          },
        },
        {
          $lookup: {
            from: "vehicledetails",
            localField: "_id",
            foreignField: "userId",
            as: "vehicleDetails",
          },
        },
        { $match: flatAssignedFilter },
        ...(searchConditions.length > 0
          ? [{ $match: { $and: searchConditions } }]
          : []),
        { $count: "total" },
      ]),
    ]);

    const totalCount = totalCountArr[0]?.total || 0;

    res.status(200).json({
      message: "User list fetched successfully",
      data,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalUsers: totalCount,
      status: true,
    });
  } catch (error) {
    console.error("Error in getAllUser:", error);
    res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.login = async (req, res) => {
  try {
    const { error } = loginValidationSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message, status: false });
    }
    const { phone, password } = req.body;
    const user = await authModel.findOne({ phone: phone, password: password });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid phone or password", status: false });
    }
    const currentMonth = moment().format("YYYY-MM");

    const maintenance = await Maintenance.findOne({
      month: currentMonth,
      $or: [{ buildingID: user.buildingID }, { heaightID: user.heaightID }],
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({
      message: "Logged in successfully",
      data: user,
      token: token,
      maintenance: maintenance,
      status: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.getUserHead = async (req, res) => {
  try {
    const listOfUser = await authModel.find({
      role: "HEAD",
    });

    if (!listOfUser) {
      res.status(400).json({ message: "HEAD Not found", status: false });
    }

    res.status(200).json({
      message: "User list",
      data: listOfUser,
      status: true,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error", status: false });
  }
};

//pramukh and user

exports.getProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Image is required", status: false });
    }
    const fileBuffer = req.file.buffer.toString("base64");
    const fileDataUri = `data:${req.file.mimetype};base64,${fileBuffer}`;
    const result = await cloudinary.uploader.upload(fileDataUri, {
      folder: "profile_pics",
    });
    res.json({
      message: "Profile Pic",
      data: {
        id: result.public_id,
        url: result.secure_url,
      },
      status: true,
    });
  } catch (err) {
    console.error("Get Profile Pic Error:", err);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.updateProfilePic = async (req, res) => {
  try {
    const { oldImageId } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Image is required", status: false });
    }

    if (oldImageId) {
      try {
        await cloudinary.uploader.destroy(oldImageId);
      } catch (deleteErr) {
        console.warn("Old image deletion failed:", deleteErr.message);
      }
    }

    const fileBuffer = req.file.buffer.toString("base64");
    const fileDataUri = `data:${req.file.mimetype};base64,${fileBuffer}`;

    const result = await cloudinary.uploader.upload(fileDataUri, {
      folder: "profile_pics",
    });

    return res.json({
      message: "Profile picture updated successfully",
      data: {
        id: result.public_id,
        url: result.secure_url,
      },
      status: true,
    });
  } catch (err) {
    console.error("Update Profile Pic Error:", err);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.imagesAdd = async (req, res) => {
  try {
    const files = req.files || [];

    if (!files.length) {
      return res.status(400).json({ message: "No image files received" });
    }

    const uploadedImages = [];

    for (const file of files) {
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;

      const result = await cloudinary.uploader.upload(base64Image, {
        folder: "heights",
      });

      uploadedImages.push({ image: result.secure_url, id: result.public_id });
    }

    return res.status(200).json({
      message: "Images uploaded successfully",
      images: uploadedImages,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Upload failed", error });
  }
};

exports.updateProfile = async (req, res) => {
  const session = await authModel.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const {
      name,
      email,
      phone,
      password,
      role,
      heaightID,
      profile_pic,
      familyMembers,
      businessDetails,
      vehicleDetails,
    } = req.body;

    const user = await authModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found", status: false });
    }

    if (phone && phone !== user.phone) {
      const existingPhoneUser = await authModel.findOne({ phone });

      // Check if phone is used by another user (not the current user)
      if (existingPhoneUser && existingPhoneUser._id.toString() !== id) {
        return res.status(400).json({
          message: "Phone number already in use by another user",
          status: false,
        });
      }

      // If phone is not used or it's the same user, allow update
      user.phone = phone;
    }
    // 1. Update user base fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (heaightID) user.heaightID = heaightID;
    if (password) user.password = password;

    if (profile_pic) {
      user.profile_pic = {
        id: profile_pic.id,
        image: profile_pic.image,
      };
    }

    await user.save({ session });

    const userId = user._id;

    // 2. Replace related collections (if provided)
    if (Array.isArray(familyMembers)) {
      await FamilyMember.deleteMany({ userId }, { session });
      const familyWithUser = familyMembers.map((item) => ({ ...item, userId }));
      await FamilyMember.insertMany(familyWithUser, { session });
    }

    if (Array.isArray(businessDetails)) {
      await BusinessDetail.deleteMany({ userId }, { session });
      const businessWithUser = businessDetails.map((item) => ({
        ...item,
        userId,
      }));
      await BusinessDetail.insertMany(businessWithUser, { session });
    }

    if (Array.isArray(vehicleDetails)) {
      await VehicleDetail.deleteMany({ userId }, { session });
      const vehicleWithUser = vehicleDetails.map((item) => ({
        ...item,
        userId,
      }));
      await VehicleDetail.insertMany(vehicleWithUser, { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Profile updated successfully",
      data: user,
      status: true,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("Update Error:", err);
    return res.status(500).json({
      message: "Server Error",
      error: err.message,
      status: false,
    });
  }
};
