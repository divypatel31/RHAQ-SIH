const express = require("express");
const router = express.Router();
const referralController = require("../controllers/referralController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, referralController.createReferral);
router.get("/", verifyToken, referralController.getReferrals);
router.get("/:id/timeline", verifyToken, referralController.getReferralTimeline);
router.patch("/:id/status", verifyToken, referralController.updateReferralStatus);

module.exports = router;
