var express = require("express");
const { createHeaight } = require("../controller/Heaight.controller");
var router = express.Router();
const upload = require("../middleware/upload");
const authenticate = require("../middleware/AuthMiddleware");
const {
  createMaintenance,
  getMaintenance,
} = require("../controller/Maintenance.controller");

/* GET home page. */
router.post("/add", authenticate, createMaintenance);
router.get("/getAll", authenticate, getMaintenance);
// router.post("/update/:id", authenticate, upload.array("images"), updateHeight);
// router.post("/delete/:id", authenticate, deleteHeight);
// router.post("/get/:id", authenticate, getHeightsByID);

module.exports = router;
