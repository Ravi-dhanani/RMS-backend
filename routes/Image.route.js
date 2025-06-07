var express = require("express");

const authenticate = require("../middleware/AuthMiddleware");
const { getProfilePic } = require("../controller/Auth.controller");
const upload = require("../middleware/upload");

var router = express.Router();

/* GET home page. */
router.post("/upload_image", upload.single("image"), getProfilePic);

module.exports = router;
