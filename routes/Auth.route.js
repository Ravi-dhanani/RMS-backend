var express = require("express");
const {
  register,
  login,
  getUserHead,
  getAllUser,
  imagesAdd,
  updateProfile,
} = require("../controller/Auth.controller");
const upload = require("../middleware/upload");
var router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user/head/list", getUserHead);
router.post("/user/by-height/:id", getAllUser);
router.post("/upload", upload.array("images"), imagesAdd); // multiple images
router.post("/user/update/:id", upload.single("profile_pic"), updateProfile);

module.exports = router;
