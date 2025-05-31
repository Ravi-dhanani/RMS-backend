var express = require("express");
const { register, login, getUser } = require("../controller/Auth.controller");
var router = express.Router();

/* GET users listing. */
router.post("/register", register);
router.post("/login", login);
router.get("/user/list", getUser)

module.exports = router;
