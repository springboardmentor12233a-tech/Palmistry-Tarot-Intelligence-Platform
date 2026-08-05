/**
 * Utility functions for distance calculations.
 */
const distanceUtils = {
  /**
   * Calculates 3D Euclidean distance between two points.
   * @param {Object} p1 - First point with {x, y, z}
   * @param {Object} p2 - Second point with {x, y, z}
   * @returns {number}
   */
  get3DDistance(p1, p2) {
    if (!p1 || !p2) return 0;
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z !== undefined ? p1.z : 0) - (p2.z !== undefined ? p2.z : 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  /**
   * Calculates 2D Euclidean distance between two points.
   * @param {Object} p1 - First point with {x, y}
   * @param {Object} p2 - Second point with {x, y}
   * @returns {number}
   */
  get2DDistance(p1, p2) {
    if (!p1 || !p2) return 0;
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
};

/**
 * Extracts features from the 21 MediaPipe hand landmarks.
 * @param {Array} landmarks - Array of 21 landmark objects {x, y, z}
 * @returns {Object} - Extracted features JSON
 */
const extractPalmFeatures = (landmarks) => {
  if (!landmarks || landmarks.length < 21) {
    throw new Error("Invalid or incomplete hand landmarks data. Expecting 21 landmarks.");
  }

  const getDist = distanceUtils.get3DDistance;

  // 1. Palm Width: Distance between Index Finger MCP (5) and Pinky MCP (17)
  const palmWidth = getDist(landmarks[5], landmarks[17]);

  // 2. Palm Height: Distance between Wrist (0) and Middle Finger MCP (9)
  const palmHeight = getDist(landmarks[0], landmarks[9]);

  // 3. Thumb Length: Sum of segments 1->2 + 2->3 + 3->4
  const thumbLength = getDist(landmarks[1], landmarks[2]) +
                      getDist(landmarks[2], landmarks[3]) +
                      getDist(landmarks[3], landmarks[4]);

  // 4. Index Finger Length: Sum of segments 5->6 + 6->7 + 7->8
  const indexFingerLength = getDist(landmarks[5], landmarks[6]) +
                            getDist(landmarks[6], landmarks[7]) +
                            getDist(landmarks[7], landmarks[8]);

  // 5. Middle Finger Length: Sum of segments 9->10 + 10->11 + 11->12
  const middleFingerLength = getDist(landmarks[9], landmarks[10]) +
                             getDist(landmarks[10], landmarks[11]) +
                             getDist(landmarks[11], landmarks[12]);

  // 6. Ring Finger Length: Sum of segments 13->14 + 14->15 + 15->16
  const ringFingerLength = getDist(landmarks[13], landmarks[14]) +
                           getDist(landmarks[14], landmarks[15]) +
                           getDist(landmarks[15], landmarks[16]);

  // 7. Little Finger Length: Sum of segments 17->18 + 18->19 + 19->20
  const littleFingerLength = getDist(landmarks[17], landmarks[18]) +
                             getDist(landmarks[18], landmarks[19]) +
                             getDist(landmarks[19], landmarks[20]);

  // Round values to 4 decimal places for clean representation
  return {
    palmWidth: Number(palmWidth.toFixed(4)),
    palmHeight: Number(palmHeight.toFixed(4)),
    thumbLength: Number(thumbLength.toFixed(4)),
    indexFingerLength: Number(indexFingerLength.toFixed(4)),
    middleFingerLength: Number(middleFingerLength.toFixed(4)),
    ringFingerLength: Number(ringFingerLength.toFixed(4)),
    littleFingerLength: Number(littleFingerLength.toFixed(4))
  };
};

module.exports = {
  distanceUtils,
  extractPalmFeatures
};
