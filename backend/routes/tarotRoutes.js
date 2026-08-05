const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { 
  getTarotCards, 
  getTarotCardById, 
  saveTarotReading, 
  getUserTarotReadings, 
  deleteTarotReading 
} = require("../controllers/tarotController");

// Route: GET /api/tarot/cards
router.get("/cards", getTarotCards);

// Route: GET /api/tarot/card/:id
router.get("/card/:id", getTarotCardById);

// Route: POST /api/tarot/reading
// Secured with JWT Auth Middleware
router.post("/reading", protect, saveTarotReading);

// Route: GET /api/tarot/readings
// Secured with JWT Auth Middleware
router.get("/readings", protect, getUserTarotReadings);

// Route: DELETE /api/tarot/reading/:id
// Secured with JWT Auth Middleware
router.delete("/reading/:id", protect, deleteTarotReading);

module.exports = router;
