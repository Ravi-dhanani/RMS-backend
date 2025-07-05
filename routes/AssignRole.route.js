const express = require("express");
const router = express.Router();
const assignRoleController = require("../controller/AssignRoleController");

router.post("/add", assignRoleController.add);
router.get("/", assignRoleController.getAll);
router.get("/:id", assignRoleController.getById);
router.post("/update/:id", assignRoleController.update);
router.delete("/:id", assignRoleController.remove);

module.exports = router;
