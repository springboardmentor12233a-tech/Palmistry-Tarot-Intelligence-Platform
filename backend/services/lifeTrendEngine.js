const CombinedReading = require("../models/CombinedReading");

/**
 * Helper to calculate a specific category trend score from personality scores.
 */
const calculateTrendScore = (scores, weights) => {
  let score = 0;
  let weightSum = 0;
  Object.keys(weights).forEach((key) => {
    score += (scores[key] || 50) * weights[key];
    weightSum += weights[key];
  });
  return Math.round(score / weightSum);
};

// Define formulas for category trends
const WEIGHINGS = {
  career: { decisionMaking: 0.4, leadership: 0.4, confidence: 0.2 },
  love: { emotionalIntelligence: 0.5, communication: 0.3, adaptability: 0.2 },
  finance: { decisionMaking: 0.5, patience: 0.3, confidence: 0.2 },
  emotional: { emotionalIntelligence: 0.6, patience: 0.2, adaptability: 0.2 },
  personalGrowth: { creativity: 0.3, confidence: 0.3, adaptability: 0.2, patience: 0.2 }
};

/**
 * Generates life trends based on current scores and historical readings in database.
 * @param {ObjectId} userId - User's MongoDB ID
 * @param {Object} currentScores - Current personality scores
 * @returns {Object} lifeTrends JSON
 */
exports.generateLifeTrends = async (userId, currentScores = {}) => {
  // 1. Calculate current trend values
  const currentTrends = {
    career: calculateTrendScore(currentScores, WEIGHINGS.career),
    love: calculateTrendScore(currentScores, WEIGHINGS.love),
    finance: calculateTrendScore(currentScores, WEIGHINGS.finance),
    emotional: calculateTrendScore(currentScores, WEIGHINGS.emotional),
    personalGrowth: calculateTrendScore(currentScores, WEIGHINGS.personalGrowth)
  };

  // 2. Fetch user's historical combined readings
  let previousTrends = null;
  try {
    const historicalReadings = await CombinedReading.find({ userId })
      .sort({ createdAt: -1 })
      .limit(2);

    // If there is a previous combined reading (meaning length >= 2 or at index 1 in the sorted list)
    if (historicalReadings.length >= 2 && historicalReadings[1].personalityScores) {
      const prevScores = historicalReadings[1].personalityScores;
      previousTrends = {
        career: calculateTrendScore(prevScores, WEIGHINGS.career),
        love: calculateTrendScore(prevScores, WEIGHINGS.love),
        finance: calculateTrendScore(prevScores, WEIGHINGS.finance),
        emotional: calculateTrendScore(prevScores, WEIGHINGS.emotional),
        personalGrowth: calculateTrendScore(prevScores, WEIGHINGS.personalGrowth)
      };
    }
  } catch (error) {
    console.error("Error reading historical trends:", error);
  }

  // 3. If no historical readings, simulate a previous baseline for progression visualisation
  if (!previousTrends) {
    // Generate a slightly lower or higher previous score (with typical improvement of +1 to +5)
    previousTrends = {
      career: Math.max(0, Math.min(100, currentTrends.career - Math.round(Math.random() * 6 - 1))),
      love: Math.max(0, Math.min(100, currentTrends.love - Math.round(Math.random() * 5 - 1))),
      finance: Math.max(0, Math.min(100, currentTrends.finance - Math.round(Math.random() * 6 - 2))),
      emotional: Math.max(0, Math.min(100, currentTrends.emotional - Math.round(Math.random() * 4))),
      personalGrowth: Math.max(0, Math.min(100, currentTrends.personalGrowth - Math.round(Math.random() * 6 - 1)))
    };
  }

  // 4. Return final trend data mapping
  return {
    careerTrend: {
      current: currentTrends.career,
      previous: previousTrends.career,
      improvement: currentTrends.career - previousTrends.career
    },
    loveTrend: {
      current: currentTrends.love,
      previous: previousTrends.love,
      improvement: currentTrends.love - previousTrends.love
    },
    financeTrend: {
      current: currentTrends.finance,
      previous: previousTrends.finance,
      improvement: currentTrends.finance - previousTrends.finance
    },
    emotionalTrend: {
      current: currentTrends.emotional,
      previous: previousTrends.emotional,
      improvement: currentTrends.emotional - previousTrends.emotional
    },
    personalGrowthTrend: {
      current: currentTrends.personalGrowth,
      previous: previousTrends.personalGrowth,
      improvement: currentTrends.personalGrowth - previousTrends.personalGrowth
    }
  };
};
