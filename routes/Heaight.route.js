var express = require("express");
const {
  createHeaight,
  getAllHeights,
  updateHeight,
  deleteHeight,
} = require("../controller/Heaight.controller");
var router = express.Router();

/* GET home page. */
router.post("/add", createHeaight);
router.get("/getAll", getAllHeights);
router.post("/update/:id", updateHeight);
router.post("/delete/:id", deleteHeight);

module.exports = router;
