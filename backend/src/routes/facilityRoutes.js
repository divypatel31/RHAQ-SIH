const express = require("express");
const router = express.Router();
const facilityController = require("../controllers/facilityController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.get("/", verifyToken, facilityController.getAllFacilities);
router.get("/medicine-search", verifyToken, facilityController.searchMedicineAcrossFacilities);
router.get("/:id/hierarchy", verifyToken, facilityController.getFacilityHierarchy);
router.get("/:id/medicine-stock", verifyToken, facilityController.getFacilityMedicineStock);
router.post("/", verifyToken, requireRole("admin"), facilityController.createFacility);

module.exports = router;
