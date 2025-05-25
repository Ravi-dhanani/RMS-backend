var express = require("express");
const {
  createBuilding,
  getBuildings,
  updateBuildingById,
  deleteBuildingById,
  getBuildingByUserId,
} = require("../controller/Building.controller");

var router = express.Router();

/* GET home page. */
router.post("/add", createBuilding);
router.get("/getAll", getBuildings);
router.post("/update/:id", updateBuildingById);
router.post("/delete/:id", deleteBuildingById);
router.get("/get", getBuildingByUserId);

module.exports = router;
