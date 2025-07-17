var express = require("express");
var router = express.Router();
const upload = require("../middleware/upload");
const authenticate = require("../middleware/AuthMiddleware");
const { createNotice, getNotice } = require("../controller/Notice.controller");

/* GET home page. */
router.post("/add", authenticate, createNotice);
router.get("/get", authenticate, getNotice);

module.exports = router;
