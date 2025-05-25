var express = require("express");

const {
  addFlour,
  getFlour,
  updateFlour,
  deleteFlour,
} = require("../controller/Flour.controller");

var router = express.Router();

/* GET home page. */
router.post("/add", addFlour);
router.get("/getAll", getFlour);
router.post("/update/:id", updateFlour);
router.post("/delete/:id", deleteFlour);

module.exports = router;
