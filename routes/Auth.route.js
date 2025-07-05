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
} = require("../controller/Auth.controller");
var router = express.Router();

/* GET users listing. */
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

module.exports = router;
