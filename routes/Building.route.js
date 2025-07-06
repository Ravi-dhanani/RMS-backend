var express = require("express");
const authenticate = require("../middleware/AuthMiddleware");

const {
  createBuilding,
  getBuildings,
  updateBuildingById,
  deleteBuildingById,
  getBuildingByUserId,
  getSocietyByBuilding,
} = require("../controller/Building.controller");

var router = express.Router();

/* GET home page. */
router.post("/add", authenticate, createBuilding);
router.get("/getAll/:id", authenticate, getBuildings);
router.post("/update/:id", authenticate, updateBuildingById);
router.post("/delete/:id", authenticate, deleteBuildingById);
router.get("/get", authenticate, getBuildingByUserId);
router.post("/by-heaight/:id", authenticate, getSocietyByBuilding);

module.exports = router;
