const express = require("express");
const router = express.Router();
const syncController = require("../controllers/syncController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/batch", verifyToken, syncController.syncBatch);

module.exports = router;
