const CombinedReading = require("../models/CombinedReading");
const PalmReading = require("../models/PalmReading");
const TarotReading = require("../models/TarotReading");
const { synthesizeCombinedReading } = require("../services/combinedReadingEngine");
const aiInterpretationService = require("../services/aiInterpretationService");
const personalityEngine = require("../services/personalityEngine");
const recommendationEngine = require("../services/recommendationEngine");
const lifeTrendEngine = require("../services/lifeTrendEngine");

// ==============================
// Create Combined Reading
// ==============================
exports.createCombinedReading = async (req, res) => {
  try {
    const { palmReadingId, tarotReadingId } = req.body;

    if (!palmReadingId || !tarotReadingId) {
      return res.status(400).json({
        success: false,
        message: "Missing palmReadingId or tarotReadingId in request body.",
      });
    }

    // Verify readings exist and belong to user
    const palmReading = await PalmReading.findOne({ _id: palmReadingId, userId: req.user._id });
    const tarotReading = await TarotReading.findOne({ _id: tarotReadingId, userId: req.user._id });

    if (!palmReading) {
      return res.status(404).json({
        success: false,
        message: "Palm reading not found or unauthorized.",
      });
    }

    if (!tarotReading) {
      return res.status(404).json({
        success: false,
        message: "Tarot reading not found or unauthorized.",
      });
    }

    // Check if combined reading already exists for this pair to avoid duplicates
    let existingCombined = await CombinedReading.findOne({
      userId: req.user._id,
      palmReadingId,
      tarotReadingId,
    });

    if (existingCombined) {
      return res.status(200).json({
        success: true,
        message: "Combined reading already exists.",
        combinedReading: existingCombined,
      });
    }

    // Synthesize report using engine
    const synthesis = synthesizeCombinedReading(palmReading, tarotReading);

    // Generate AI Interpretation
    const aiInterpretation = await aiInterpretationService.generateAIInterpretation(palmReading, tarotReading, req.user);

    // Generate Personality Scores
    const personalityScores = await personalityEngine.generatePersonalityScores(palmReading, tarotReading);

    // Generate Recommendations
    const recommendations = await recommendationEngine.generateRecommendations(personalityScores);

    // Generate Life Trend Analysis
    const lifeTrends = await lifeTrendEngine.generateLifeTrends(req.user._id, personalityScores);

    const newCombined = new CombinedReading({
      userId: req.user._id,
      palmReadingId,
      tarotReadingId,
      palmSummary: synthesis.palmSummary,
      tarotSummary: synthesis.tarotSummary,
      overallReading: synthesis.overallReading,
      advice: synthesis.advice,
      strengths: synthesis.strengths,
      challenges: synthesis.challenges,
      suggestedActions: synthesis.suggestedActions,
      // Premium AI fields
      aiInterpretation,
      personalityScores,
      recommendations,
      lifeTrends
    });

    const savedCombined = await newCombined.save();

    res.status(201).json({
      success: true,
      message: "Combined reading synthesized successfully.",
      combinedReading: savedCombined,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create combined reading.",
    });
  }
};

// ==============================
// Get User Combined Readings
// ==============================
exports.getCombinedReadings = async (req, res) => {
  try {
    const readings = await CombinedReading.find({ userId: req.user._id })
      .populate("palmReadingId")
      .populate("tarotReadingId")
      .sort({ createdAt: -1 });

    // Retroactively populate missing AI fields for the latest reading (index 0) if necessary
    if (readings.length > 0) {
      const latest = readings[0];
      const needsUpdate = !latest.personalityScores || 
                          !latest.aiInterpretation || 
                          !latest.aiInterpretation.personality;

      if (needsUpdate && latest.palmReadingId && latest.tarotReadingId) {
        try {
          const aiInterpretation = await aiInterpretationService.generateAIInterpretation(latest.palmReadingId, latest.tarotReadingId, req.user);
          const personalityScores = await personalityEngine.generatePersonalityScores(latest.palmReadingId, latest.tarotReadingId);
          const recommendations = await recommendationEngine.generateRecommendations(personalityScores);
          const lifeTrends = await lifeTrendEngine.generateLifeTrends(req.user._id, personalityScores);

          latest.aiInterpretation = aiInterpretation;
          latest.personalityScores = personalityScores;
          latest.recommendations = recommendations;
          latest.lifeTrends = lifeTrends;
          await latest.save();
        } catch (retroError) {
          console.error("Error retroactively generating intelligence fields:", retroError);
        }
      }
    }

    res.status(200).json({
      success: true,
      count: readings.length,
      readings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch combined readings history.",
    });
  }
};

// ==============================
// Delete Combined Reading
// ==============================
exports.deleteCombinedReading = async (req, res) => {
  try {
    const reading = await CombinedReading.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Combined reading not found or unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Combined reading deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete combined reading.",
    });
  }
};
