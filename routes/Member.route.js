var express = require("express");

const authenticate = require("../middleware/AuthMiddleware");
const {
  createMember,
  getFlatByUser,
  getAllMembers,
  updateMemberById,
  deleteMemberById,
} = require("../controller/Member.controller");

var router = express.Router();

/* GET home page. */
router.post("/add", authenticate, createMember);
router.get("/getAll", authenticate, getAllMembers);
router.post("/update/:id", authenticate, updateMemberById);
router.post("/delete/:id", authenticate, deleteMemberById);
// router.get("/getSingle/:id", authenticate, getFlatById);
router.get("/by-flat/:id", authenticate, getFlatByUser);

module.exports = router;
