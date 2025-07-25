var express = require("express");
var router = express.Router();
const authenticate = require("../middleware/AuthMiddleware");
const {
  createMaintenance,
  getMaintenance,
  getUserMaintenance,
  updatePaymentStatus,
  getMaintenanceMonthWise,
} = require("../controller/Maintenance.controller");

/* GET home page. */
router.post("/add", authenticate, createMaintenance);
router.get("/getAll", authenticate, getMaintenance);
router.get("/get", authenticate, getMaintenanceMonthWise);
router.get("/user/:userID", authenticate, getUserMaintenance);
router.post("/payment/status", authenticate, updatePaymentStatus);

module.exports = router;
