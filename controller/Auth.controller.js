const authModel = require("../model/Auth.model");
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
    const { name, email, phone, password, profile_pic, role } = req.body;

    const userExists = await authModel.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Email already exists", status: false });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = await authModel.create({
      name,
      email,
      phone,
      password: hashedPassword,
      profile_pic,
      role,
    });
    res.status(201).json({
      message: "User registered successfully",
      data: newUser,
      status: true,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error", status: false });
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
