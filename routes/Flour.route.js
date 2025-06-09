var express = require("express");

const {
  addFlour,
  getFlour,
  updateFlour,
  deleteFlour,
  getFlourByID,
  getFlourByBuildingID,
  getFlourAndFlat,
} = require("../controller/Flour.controller");
const authenticate = require("../middleware/AuthMiddleware");

var router = express.Router();

/* GET home page. */
router.post("/add", authenticate, addFlour);
router.get("/getAll/:id", authenticate, getFlour);
router.post("/update/:id", authenticate, updateFlour);
router.post("/delete/:id", authenticate, deleteFlour);
router.get("/getSingle/:id", authenticate, getFlourByID);
router.get("/getFlourBulding/:id", authenticate, getFlourByBuildingID);
router.get("/getFlourFlat/:id", authenticate, getFlourAndFlat);

module.exports = router;
