const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, appointmentController.createAppointment);
router.get("/", verifyToken, appointmentController.getAppointments);
router.patch("/:id/status", verifyToken, appointmentController.updateAppointmentStatus);

module.exports = router;
