const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createCombinedReading,
  getCombinedReadings,
  deleteCombinedReading,
} = require("../controllers/combinedController");

// Route: POST /api/combined/analyze
// Secured with JWT Auth Middleware
router.post("/analyze", protect, createCombinedReading);

// Route: GET /api/combined/readings
// Secured with JWT Auth Middleware
router.get("/readings", protect, getCombinedReadings);

// Route: DELETE /api/combined/reading/:id
// Secured with JWT Auth Middleware
router.delete("/reading/:id", protect, deleteCombinedReading);

module.exports = router;
