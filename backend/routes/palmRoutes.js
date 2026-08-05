const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { 
  uploadPalmImage, 
  analyzePalm,
  getPalmReadings,
  deletePalmReading
} = require("../controllers/palmController");

// Middleware wrapper to handle Multer errors gracefully
const handleUpload = (req, res, next) => {
  upload.single("palmImage")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

// Route: POST /api/palm/upload
// Secured with JWT Auth Middleware
router.post("/upload", protect, handleUpload, uploadPalmImage);

// Route: POST /api/palm/analyze
// Secured with JWT Auth Middleware
router.post("/analyze", protect, analyzePalm);

// Route: GET /api/palm/readings
// Secured with JWT Auth Middleware
router.get("/readings", protect, getPalmReadings);

// Route: DELETE /api/palm/reading/:id
// Secured with JWT Auth Middleware
router.delete("/reading/:id", protect, deletePalmReading);

module.exports = router;

