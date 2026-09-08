const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.get("/users", verifyToken, requireRole("admin"), adminController.listUsers);
router.patch("/users/:id", verifyToken, requireRole("admin"), adminController.updateUser);

module.exports = router;
