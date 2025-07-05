var express = require("express");
const {
  createHeaight,
  getAllHeights,
  updateHeight,
  deleteHeight,
  getHeightsByID,
} = require("../controller/Heaight.controller");
var router = express.Router();
const upload = require("../middleware/upload");

/* GET home page. */
router.post("/add", upload.array("images"), createHeaight);
router.get("/getAll", getAllHeights);
router.post("/update/:id", updateHeight);
router.post("/delete/:id", deleteHeight);
router.post("/get/:id", getHeightsByID);

module.exports = router;
