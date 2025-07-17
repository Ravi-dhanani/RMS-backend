var express = require("express");
const { createHeaight } = require("../controller/Heaight.controller");
var router = express.Router();
const upload = require("../middleware/upload");
const authenticate = require("../middleware/AuthMiddleware");
const {
  createMaintenance,
  getMaintenance,
  getUserMaintenance,
  updatePaymentStatus,
} = require("../controller/Maintenance.controller");

/* GET home page. */
router.post("/add", authenticate, createMaintenance);
router.get("/getAll", authenticate, getMaintenance);
router.get("/user/:userID", authenticate, getUserMaintenance);
router.post("/payment/status", authenticate, updatePaymentStatus);

// router.post("/get/:id", authenticate, getHeightsByID);

module.exports = router;
