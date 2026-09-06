const express = require("express");
const router = express.Router();
const prescriptionController = require("../controllers/prescriptionController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.post("/", verifyToken, requireRole("doctor", "receptionist", "admin"), prescriptionController.createPrescription);
router.get("/", verifyToken, prescriptionController.getPrescriptions);

module.exports = router;
