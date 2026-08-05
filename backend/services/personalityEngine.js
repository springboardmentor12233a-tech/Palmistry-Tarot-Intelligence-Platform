/**
 * Personality Intelligence Engine.
 * Combines Palm Analysis traits and Tarot reading archetypes to generate numeric scores (0-100)
 * for key personality aspects.
 */

/**
 * Generates and saves personality scores.
 * @param {Object} palmReading - Palm Reading document
 * @param {Object} tarotReading - Tarot Reading document
 * @returns {Object} personalityScores JSON
 */
exports.generatePersonalityScores = async (palmReading, tarotReading) => {
  const palm = (palmReading && palmReading.analysis) || {};
  const tarotCards = (tarotReading && tarotReading.cards) || [];

  // 1. Setup Base Scores
  let scores = {
    leadership: 50,
    creativity: 50,
    emotionalIntelligence: 50,
    communication: 50,
    decisionMaking: 50,
    patience: 50,
    confidence: 50,
    adaptability: 50
  };

  // 2. Adjust based on Palm Analysis
  const handType = (palm.handType || "").toLowerCase();
  const leadershipText = (palm.leadership || "").toLowerCase();
  const commText = (palm.communication || "").toLowerCase();
  const thinkingText = (palm.thinkingStyle || "").toLowerCase();
  const confidenceText = (palm.confidence || "").toLowerCase();

  // Hand Type influences
  if (handType.includes("earth")) {
    scores.patience += 15;
    scores.decisionMaking += 10;
  } else if (handType.includes("air")) {
    scores.communication += 15;
    scores.adaptability += 10;
  } else if (handType.includes("fire")) {
    scores.leadership += 15;
    scores.confidence += 15;
  } else if (handType.includes("water")) {
    scores.emotionalIntelligence += 15;
    scores.creativity += 15;
  } else {
    scores.adaptability += 10;
    scores.patience += 10;
  }

  // Leadership style
  if (leadershipText.includes("strong willpower")) {
    scores.leadership += 20;
    scores.confidence += 10;
  } else {
    scores.adaptability += 15;
    scores.patience += 10;
  }

  // Communication style
  if (commText.includes("expressive")) {
    scores.communication += 20;
    scores.confidence += 5;
  } else {
    scores.patience += 15;
    scores.emotionalIntelligence += 10;
  }

  // Thinking style
  if (thinkingText.includes("analytical")) {
    scores.decisionMaking += 20;
    scores.patience += 10;
  } else {
    scores.creativity += 25;
    scores.emotionalIntelligence += 15;
  }

  // Confidence style
  if (confidenceText.includes("high self-reliance")) {
    scores.confidence += 20;
    scores.leadership += 5;
  } else {
    scores.adaptability += 15;
    scores.communication += 10;
  }

  // 3. Adjust based on Tarot Cards
  tarotCards.forEach((c) => {
    const cardName = (c.name || "").toLowerCase();
    const isReversed = c.orientation === "reversed";
    const multiplier = isReversed ? -0.5 : 1.0;

    // Suit check
    if (cardName.includes("cups") || cardName.includes("cup")) {
      scores.emotionalIntelligence += Math.round(15 * multiplier);
      scores.creativity += Math.round(10 * multiplier);
      scores.decisionMaking += Math.round(-5 * multiplier);
    } else if (cardName.includes("wands") || cardName.includes("wand")) {
      scores.leadership += Math.round(15 * multiplier);
      scores.confidence += Math.round(10 * multiplier);
      scores.patience += Math.round(-5 * multiplier);
    } else if (cardName.includes("swords") || cardName.includes("sword")) {
      scores.communication += Math.round(10 * multiplier);
      scores.decisionMaking += Math.round(15 * multiplier);
      scores.emotionalIntelligence += Math.round(-5 * multiplier);
    } else if (cardName.includes("pentacles") || cardName.includes("pentacle") || cardName.includes("coins") || cardName.includes("coin")) {
      scores.patience += Math.round(15 * multiplier);
      scores.adaptability += Math.round(10 * multiplier);
      scores.creativity += Math.round(-5 * multiplier);
    }

    // Major Arcana check
    if (cardName.includes("emperor")) {
      scores.leadership += Math.round(20 * multiplier);
      scores.decisionMaking += Math.round(15 * multiplier);
    } else if (cardName.includes("empress")) {
      scores.creativity += Math.round(20 * multiplier);
      scores.emotionalIntelligence += Math.round(15 * multiplier);
    } else if (cardName.includes("magician")) {
      scores.creativity += Math.round(15 * multiplier);
      scores.communication += Math.round(15 * multiplier);
    } else if (cardName.includes("strength")) {
      scores.confidence += Math.round(20 * multiplier);
      scores.patience += Math.round(15 * multiplier);
    } else if (cardName.includes("hermit")) {
      scores.patience += Math.round(20 * multiplier);
      scores.decisionMaking += Math.round(10 * multiplier);
      scores.communication -= Math.round(10 * multiplier);
    } else if (cardName.includes("lovers")) {
      scores.emotionalIntelligence += Math.round(20 * multiplier);
    } else if (cardName.includes("chariot")) {
      scores.confidence += Math.round(20 * multiplier);
      scores.leadership += Math.round(15 * multiplier);
    } else if (cardName.includes("wheel of fortune")) {
      scores.adaptability += Math.round(20 * multiplier);
    } else if (cardName.includes("temperance")) {
      scores.patience += Math.round(20 * multiplier);
      scores.adaptability += Math.round(15 * multiplier);
    } else if (cardName.includes("star")) {
      scores.creativity += Math.round(20 * multiplier);
      scores.emotionalIntelligence += Math.round(15 * multiplier);
    } else if (cardName.includes("moon")) {
      scores.creativity += Math.round(20 * multiplier);
      scores.decisionMaking -= Math.round(10 * multiplier);
    } else if (cardName.includes("sun")) {
      scores.confidence += Math.round(20 * multiplier);
      scores.communication += Math.round(15 * multiplier);
    } else if (cardName.includes("fool")) {
      scores.creativity += Math.round(20 * multiplier);
      scores.adaptability += Math.round(20 * multiplier);
      scores.decisionMaking -= Math.round(10 * multiplier);
    } else if (cardName.includes("devil")) {
      scores.confidence += Math.round(10 * multiplier);
      scores.patience -= Math.round(15 * multiplier);
    } else if (cardName.includes("tower")) {
      scores.adaptability += Math.round(25 * multiplier);
      scores.confidence -= Math.round(10 * multiplier);
    } else if (cardName.includes("death")) {
      scores.adaptability += Math.round(25 * multiplier);
    } else if (cardName.includes("judgement")) {
      scores.decisionMaking += Math.round(20 * multiplier);
    } else if (cardName.includes("world")) {
      scores.adaptability += Math.round(20 * multiplier);
      scores.confidence += Math.round(15 * multiplier);
    }
  });

  // 4. Clamp Scores to 0-100 range and round
  Object.keys(scores).forEach((key) => {
    scores[key] = Math.max(0, Math.min(100, Math.round(scores[key])));
  });

  return scores;
};
