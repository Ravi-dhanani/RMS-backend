var express = require("express");
const {
  register,
  login,
  getUserHead,
  addUser,
  updateUser,
  deleteUser,
  getUser,
  getPramukh,
  getSubAdmin,
  getAllUser,
  imagesAdd,
  updateProfile,
} = require("../controller/Auth.controller");
const upload = require("../middleware/upload");
var router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user/head/list", getUserHead);
router.get("/user/list", getUser);
router.get("/subAdmin/list", getSubAdmin);
router.get("/pramukh/list", getPramukh);
router.post("/user/add", addUser);
router.post("/user/update/:id", updateUser);
router.post("/user/delete/:id", deleteUser);
router.post("/user/by-height/:id", getAllUser);
router.post("/upload", upload.array("images"), imagesAdd); // multiple images
router.post("/user/update/:id", updateProfile);

module.exports = router;
