const express = require("express");
const router = express.Router();
const emergencyController = require("../controllers/emergencyController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, emergencyController.raiseEscalation);
router.get("/", verifyToken, emergencyController.getEscalations);
router.patch("/:id/status", verifyToken, emergencyController.updateEscalationStatus);

module.exports = router;
