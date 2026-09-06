const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/district", verifyToken, dashboardController.getDistrictOverview);
router.get("/facility/:id", verifyToken, dashboardController.getFacilityOverview);

module.exports = router;
