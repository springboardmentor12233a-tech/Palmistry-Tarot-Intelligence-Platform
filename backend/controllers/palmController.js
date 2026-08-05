const path = require("path");
const PalmReading = require("../models/PalmReading");
const { runMediaPipeDetection } = require("../services/palmAnalysis");
const { extractPalmFeatures } = require("../services/palmFeatureExtractor");
const { analyzePalmFeatures } = require("../services/palmAnalysisEngine");

// ==============================
// Upload Palm Image Controller
// ==============================
exports.uploadPalmImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file (JPG, JPEG, or PNG) under 5 MB.",
      });
    }

    // Construct image URL (e.g. http://localhost:5000/uploads/palms/filename)
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/palms/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: "Palm image uploaded successfully",
      filename: req.file.filename,
      imageUrl: imageUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Analyze Palm Image Controller
// ==============================
exports.analyzePalm = async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Missing filename parameter.",
      });
    }

    const imagePath = path.join(__dirname, "../uploads/palms", filename);

    // Call Python MediaPipe analysis
    const result = await runMediaPipeDetection(imagePath);

    // Extract palm features
    const extractedFeatures = extractPalmFeatures(result.landmarks);

    // Generate rule-based analysis
    const analysis = analyzePalmFeatures(extractedFeatures);

    // Save detection results to MongoDB
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/palms/${filename}`;
    const newReading = new PalmReading({
      userId: req.user._id,
      filename: filename,
      imageUrl: imageUrl,
      landmarks: result.landmarks,
      extractedFeatures: extractedFeatures,
      analysis: analysis,
    });

    const savedReading = await newReading.save();

    res.status(200).json({
      success: true,
      message: "Palm analyzed successfully",
      landmarksCount: result.landmarks.length,
      landmarks: result.landmarks,
      extractedFeatures: extractedFeatures,
      analysis: analysis,
      reading: savedReading,
    });
  } catch (error) {
    console.error(`Analysis Error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message || "An error occurred during hand landmarks analysis.",
    });
  }
};

// ==============================
// Get User Palm Readings History
// ==============================
exports.getPalmReadings = async (req, res) => {
  try {
    const readings = await PalmReading.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: readings.length,
      readings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Palm readings history.",
    });
  }
};

// ==============================
// Delete Palm Reading
// ==============================
exports.deletePalmReading = async (req, res) => {
  try {
    const reading = await PalmReading.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Palm reading not found or unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Palm reading deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete Palm reading.",
    });
  }
};

