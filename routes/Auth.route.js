var express = require("express");
const {
  register,
  login,
  getUserHead,
  getUserPramukh,
} = require("../controller/Auth.controller");
var router = express.Router();

/* GET users listing. */
router.post("/register", register);
router.post("/login", login);
router.get("/user/head/list", getUserHead);
router.get("/user/pramukh/list", getUserPramukh);

module.exports = router;
