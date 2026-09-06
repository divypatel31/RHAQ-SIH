const express = require("express");
const router = express.Router();
const highRiskController = require("../controllers/highRiskController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, highRiskController.createFollowup);
router.get("/", verifyToken, highRiskController.getFollowups);
router.patch("/:id/contact", verifyToken, highRiskController.logContact);
router.patch("/:id/close", verifyToken, highRiskController.closeFollowup);

module.exports = router;
