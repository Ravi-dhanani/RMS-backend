const authModel = require("../models/Auth.model");
const {
  authValidationSchema,
  loginValidationSchema,
} = require("../validators/Auth");

const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

exports.register = async (req, res) => {
  try {
    const { error } = authValidationSchema.validate(req.body);
    console.log(error)
    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message, status: false });
    }
    const {
      name,
      email,
      phone,
      password,
      role,
      heaightID,
      profile_pic,
      subRoles,
      familyMembers,
      businessDetails,
      vehicleDetails,
    } = req.body;

    const userExists = await authModel.findOne({ phone });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "Phone Number already exists", status: false });
    }

    const newUser = await authModel.create({
      name,
      email,
      phone,
      password,
      role,
      heaightID,
      subRoles,
      profile_pic: profile_pic
        ? {
          id: profile_pic.id,
          image: profile_pic.image,
        }
        : null,
      familyMembers: familyMembers,
      businessDetails: businessDetails,
      vehicleDetails: vehicleDetails,
    });

    res.status(201).json({
      message: "User registered successfully",
      data: newUser,
      status: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      error: err.message,
      status: false,
    });
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const { id } = req.params
    const listOfUser = await authModel.find({
      heaightID: id
    });

    if (!listOfUser) {
      res.status(400).json({ message: "User Not found", status: false });
    }

    res.status(200).json({
      message: "User list",
      data: listOfUser,
      status: true,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error", status: false });
  }
}
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
      message: "Logged in successfully",
      data: user,
      token: token,
      status: true,
    });
  } catch (err) {
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

exports.getSubAdmin = async (req, res) => {
  try {
    const listOfUser = await authModel
      .find({
        role: "SUB_ADMIN",
      })
      .populate("heaightID");

    if (!listOfUser) {
      res.status(400).json({ message: "Sub Admin Not found", status: false });
    }

    res.status(200).json({
      message: "Sub Admin list",
      data: listOfUser,
      status: true,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error", status: false });
  }
};
//pramukh and user
exports.getPramukh = async (req, res) => {
  try {
    const listOfUser = await authModel
      .find({
        role: "PRAMUKH",
      })
      .populate("heaightID");

    if (!listOfUser) {
      res.status(400).json({ message: "PRAMUKH Not found", status: false });
    }

    res.status(200).json({
      message: "PRAMUKH list",
      data: listOfUser,
      status: true,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error", status: false });
  }
};
exports.getUser = async (req, res) => {
  try {
    const listOfUser = await authModel
      .find({
        role: { $in: ["PRAMUKH", "USER"] },
      })
      .populate("heaightID");

    if (!listOfUser) {
      res.status(400).json({ message: "User Not found", status: false });
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

exports.addUser = async (req, res) => {
  try {
    const { error } = authValidationSchema.validate(req.body);

    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message, status: false });
    }

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

    const userExists = await authModel.findOne({ phone });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "Phone Number already exists", status: false });
    }
    const newUser = await authModel.create({
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
    });
    res.status(201).json({
      message: "Data added successfully",
      data: newUser,
      status: true,
    });
  } catch (err) {
    return res.status(500).json({ message: err.errmsg, status: false });
  }
};

exports.updateUser = async (req, res) => {
  try {
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
    const updatedUser = await authModel.findByIdAndUpdate(
      req.params.id,
      {
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
      },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "Data updated successfully",
      data: updatedUser,
      status: true,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error", status: false });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await authModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "Pramukh not found" });
    }
    res.status(200).json({
      message: "Pramukh deleted successfully",
      status: true,
    });
  } catch (err) {
    console.error("Delete Error:", err);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};

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
