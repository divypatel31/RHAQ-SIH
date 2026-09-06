const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/search", verifyToken, patientController.searchPatients);
router.get("/:id", verifyToken, patientController.getPatientById);

module.exports = router;
