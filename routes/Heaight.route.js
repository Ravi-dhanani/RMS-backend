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
const authenticate = require("../middleware/AuthMiddleware");

/* GET home page. */
router.post("/add", authenticate, createHeaight);
router.get("/getAll", authenticate, getAllHeights);
router.post("/update/:id", authenticate, upload.array("images"), updateHeight);
router.post("/delete/:id", authenticate, deleteHeight);
router.post("/get/:id", authenticate, getHeightsByID);

module.exports = router;
