const authModel = require("../models/Auth.model");
const {
  authValidationSchema,
  loginValidationSchema,
} = require("../validators/Auth");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { error } = authValidationSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message, status: false });
    }

    const { name, email, phone, password, role, heaightID } = req.body;
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
    });

    res.status(201).json({
      message: "User registered successfully",
      data: newUser,
      status: true,
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({
      message: "Server Error",
      error: err.message,
      status: false,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { error } = loginValidationSchema.validate(req.body);
    console.log(error, "error");
    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message, status: false });
    }
    const { phone, password } = req.body;
    const user = await authModel.findOne({ phone });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid phone or password", status: false });
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
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

//pramukh and user
exports.getUser = async (req, res) => {
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

exports.addUser = async (req, res) => {
  try {
    const { error } = authValidationSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message, status: false });
    }
    const { name, email, phone, password, role, heaightID } = req.body;
    const userExists = await authModel.findOne({ phone });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Phone Number already exists", status: false });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = await authModel.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      heaightID,
    });
    res.status(201).json({
      message: "Pramukh added successfully",
      data: newUser,
      status: true,
    });
  } catch (err) {
    console.log(err.errmsg);
    return res.status(500).json({ message: err.errmsg, status: false });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await authModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "Pramukh not found" });
    }
    res.status(200).json({
      message: "Pramukh updated successfully",
      data: updatedUser,
      status: true,
    });
  } catch (err) {
    console.error("Update Error:", err);
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
