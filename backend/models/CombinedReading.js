const mongoose = require("mongoose");

const combinedReadingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    palmReadingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PalmReading",
      required: true,
    },
    tarotReadingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TarotReading",
      required: true,
    },
    palmSummary: {
      type: String,
      required: true,
    },
    tarotSummary: {
      type: String,
      required: true,
    },
    overallReading: {
      type: String,
      required: true,
    },
    advice: {
      type: String,
      required: true,
    },
    strengths: {
      type: String,
      required: true,
    },
    challenges: {
      type: String,
      required: true,
    },
    suggestedActions: {
      type: String,
      required: true,
    },
    // Premium AI Features fields
    aiInterpretation: {
      personality: { type: String, default: "" },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      hiddenTalents: [{ type: String }],
      emotions: { type: String, default: "" },
      career: { type: String, default: "" },
      relationship: { type: String, default: "" },
      finance: { type: String, default: "" },
      guidance: { type: String, default: "" }
    },
    personalityScores: {
      leadership: { type: Number, default: 50 },
      creativity: { type: Number, default: 50 },
      emotionalIntelligence: { type: Number, default: 50 },
      communication: { type: Number, default: 50 },
      decisionMaking: { type: Number, default: 50 },
      patience: { type: Number, default: 50 },
      confidence: { type: Number, default: 50 },
      adaptability: { type: Number, default: 50 }
    },
    recommendations: {
      careerRecommendations: [{ type: String }],
      learningRecommendations: [{ type: String }],
      lifestyleRecommendations: [{ type: String }],
      relationshipAdvice: [{ type: String }],
      healthTips: [{ type: String }],
      dailyHabits: [{ type: String }]
    },
    lifeTrends: {
      careerTrend: {
        current: { type: Number, default: 50 },
        previous: { type: Number, default: 50 },
        improvement: { type: Number, default: 0 }
      },
      loveTrend: {
        current: { type: Number, default: 50 },
        previous: { type: Number, default: 50 },
        improvement: { type: Number, default: 0 }
      },
      financeTrend: {
        current: { type: Number, default: 50 },
        previous: { type: Number, default: 50 },
        improvement: { type: Number, default: 0 }
      },
      emotionalTrend: {
        current: { type: Number, default: 50 },
        previous: { type: Number, default: 50 },
        improvement: { type: Number, default: 0 }
      },
      personalGrowthTrend: {
        current: { type: Number, default: 50 },
        previous: { type: Number, default: 50 },
        improvement: { type: Number, default: 0 }
      }
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CombinedReading", combinedReadingSchema);
