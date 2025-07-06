var express = require("express");

const authenticate = require("../middleware/AuthMiddleware");
const {
  createFlat,
  getFlats,
  updateFlat,
  deleteFlat,
  getFlatById,
  getFlatsByFlour,
  getFlatByUser,
} = require("../controller/Flat.controller");

var router = express.Router();

/* GET home page. */
router.post("/add", authenticate, createFlat);
router.get("/getAll/:id", authenticate, getFlats);
router.post("/update/:id", authenticate, updateFlat);
router.post("/delete/:id", authenticate, deleteFlat);
router.get("/getSingle/:id", authenticate, getFlatById);
router.get("/getFlatByUser/:id", authenticate, getFlatByUser);
router.get("/by-floor/:id", authenticate, getFlatsByFlour);

module.exports = router;
