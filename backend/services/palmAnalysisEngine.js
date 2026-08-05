/**
 * Configurable rule definitions for palm analysis.
 * Values can be fine-tuned or extended easily.
 */
const CONFIG = {
  handTypeRatioThreshold: 0.85,
  leadershipRatioThreshold: 0.75,
  communicationRatioThreshold: 0.85,
  confidenceRatioThreshold: 0.95
};

/**
 * Evaluates hand shape type based on width vs height.
 */
const determineHandType = (palmWidth, palmHeight) => {
  if (palmWidth > palmHeight * CONFIG.handTypeRatioThreshold) {
    return "Earth Hand (Broad Palm)";
  }
  return "Air/Fire Hand (Square/Elongated Palm)";
};

/**
 * Evaluates leadership style based on thumb length compared to index finger.
 */
const determineLeadership = (thumbLength, indexFingerLength) => {
  if (thumbLength > indexFingerLength * CONFIG.leadershipRatioThreshold) {
    return "Strong Willpower & Leadership: You possess high determination, self-reliance, and a natural drive to direct projects and guide others.";
  }
  return "Collaborative Style: You value group dynamics, consensus, and cooperative decision-making over unilateral control.";
};

/**
 * Evaluates communication style based on little finger length compared to ring finger.
 */
const determineCommunication = (littleFingerLength, ringFingerLength) => {
  if (littleFingerLength > ringFingerLength * CONFIG.communicationRatioThreshold) {
    return "Expressive & Articulate: You communicate your ideas clearly, enjoy social connections, and possess strong persuasive abilities.";
  }
  return "Thoughtful Communicator: You are a keen listener, observing social nuances and expressing your thoughts deliberately and selectively.";
};

/**
 * Evaluates thinking style based on whether middle finger is the longest finger.
 */
const determineThinkingStyle = (indexFingerLength, middleFingerLength, ringFingerLength, littleFingerLength) => {
  const isMiddleLongest = middleFingerLength > indexFingerLength && 
                          middleFingerLength > ringFingerLength && 
                          middleFingerLength > littleFingerLength;
  if (isMiddleLongest) {
    return "Analytical Personality: You value logic, detail, structure, and methodical planning. You process information step-by-step.";
  }
  return "Intuitive Thinker: You rely on holistic patterns, creative inspiration, and immediate perception rather than strict logical sequences.";
};

/**
 * Evaluates confidence style based on index finger vs ring finger ratio (2D:4D ratio).
 */
const determineConfidence = (indexFingerLength, ringFingerLength) => {
  if (indexFingerLength > ringFingerLength * CONFIG.confidenceRatioThreshold) {
    return "High Self-Reliance: You have strong inner validation, are comfortable taking charge, and trust your personal vision.";
  }
  return "Socially Adaptive: You seek feedback and external validation, adapting your confidence style dynamically based on surrounding opinions.";
};

/**
 * Combines results to create a cohesive summary paragraph.
 */
const generateSummary = (handType, leadership, communication, thinkingStyle, confidence) => {
  // Extract key terms for readability
  const leadershipTerm = leadership.toLowerCase().includes("strong willpower") ? "strong willpower" : "collaborative approach";
  const communicationTerm = communication.toLowerCase().includes("expressive") ? "expressive" : "thoughtful";
  const thinkingTerm = thinkingStyle.toLowerCase().includes("analytical") ? "analytical" : "intuitive";
  
  return `Your palm analysis indicates an ${handType}. With an ${thinkingTerm} mind, you approach challenges systematically. You possess a ${leadershipTerm} and show a ${communicationTerm} communication style. These traits suggest a balanced combination of confidence and social awareness.`;
};

/**
 * Main analysis function.
 * @param {Object} features - Extracted palm features
 * @returns {Object} - Analysis result JSON
 */
const analyzePalmFeatures = (features) => {
  if (!features) {
    throw new Error("No extracted features provided for analysis.");
  }

  const {
    palmWidth,
    palmHeight,
    thumbLength,
    indexFingerLength,
    middleFingerLength,
    ringFingerLength,
    littleFingerLength
  } = features;

  const handType = determineHandType(palmWidth, palmHeight);
  const leadership = determineLeadership(thumbLength, indexFingerLength);
  const communication = determineCommunication(littleFingerLength, ringFingerLength);
  const thinkingStyle = determineThinkingStyle(indexFingerLength, middleFingerLength, ringFingerLength, littleFingerLength);
  const confidence = determineConfidence(indexFingerLength, ringFingerLength);
  const summary = generateSummary(handType, leadership, communication, thinkingStyle, confidence);

  return {
    handType,
    leadership,
    communication,
    thinkingStyle,
    confidence,
    summary
  };
};

module.exports = {
  CONFIG,
  analyzePalmFeatures
};
