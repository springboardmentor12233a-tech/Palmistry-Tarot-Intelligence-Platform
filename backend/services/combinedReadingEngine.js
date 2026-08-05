/**
 * Rule-based Synthesis Engine for Combined Palmistry + Tarot Readings.
 * Combines Hand Type traits with Tarot card archetype energies to yield a cohesive reading.
 * @param {Object} palmReading - PalmReading database document
 * @param {Object} tarotReading - TarotReading database document
 * @returns {Object} Synthesized report sections
 */
exports.synthesizeCombinedReading = (palmReading, tarotReading) => {
  const palm = palmReading.analysis || {};
  const cards = tarotReading.cards || [];

  // 1. Compile Palm Summary
  const handType = palm.handType || "balanced";
  const leadership = palm.leadership || "adaptive";
  const communication = palm.communication || "expressive";
  const thinkingStyle = palm.thinkingStyle || "rational";
  const confidence = palm.confidence || "measured";

  const palmSummary = `Your hand analysis reveals a ${handType} structure indicating a core element alignment. Your personality manifests ${leadership.toLowerCase()} leadership qualities, supported by ${communication.toLowerCase()} communication. Your cognitive processing reflects a ${thinkingStyle.toLowerCase()} thinking style, carrying a ${confidence.toLowerCase()} level of confidence.`;

  // 2. Compile Tarot Summary
  const cardListText = cards.map((c) => `${c.name} (${c.orientation} in the ${c.role} position)`).join(", ");
  const tarotSummary = `Your spread drew: ${cardListText}. These cards reflect temporal patterns influencing your query, highlighting major themes from both major/minor archetypes.`;

  // 3. Overall Reading Synthesis
  let overallReading = "";
  let advice = "";
  let strengths = "";
  let challenges = "";
  let suggestedActions = "";

  // Elemental mappings
  const isEarth = handType.toLowerCase().includes("earth");
  const isAir = handType.toLowerCase().includes("air");
  const isFire = handType.toLowerCase().includes("fire");
  const isWater = handType.toLowerCase().includes("water");

  // Main archetype guide from first card
  const primaryCard = cards[0] || { name: "The Fool", orientation: "upright", role: "present" };
  const cardName = primaryCard.name;
  const cardOrient = primaryCard.orientation;

  if (isEarth) {
    overallReading = `The grounded, practical foundations of your Earth Hand form a strong base for the spiritual message of ${cardName}. Your character thrives on stability, reliability, and tangible progress. The presence of ${cardName} suggests that your physical goals, career paths, or home life are being influenced by this card's energy. `;
    if (cardOrient === "reversed") {
      overallReading += `Since ${cardName} is reversed, you are advised to look out for stubborn resistance to change or underlying friction in your material world. Seek internal re-alignment.`;
      advice = `Practice flexibility. Release rigid structures and be receptive to the spiritual insights suggested by the reversed ${cardName}. Meditate on how you can build new paths.`;
      challenges = `Stubbornness, fear of financial insecurity, stagnation, and ignoring emotional callings.`;
      strengths = `Practical intelligence, reliability, loyalty, and exceptional endurance.`;
    } else {
      overallReading += `The upright status of this card highlights a constructive phase where your patient efforts will bring substantial, lasting success.`;
      advice = `Maintain your steady pace. The universe is aligning with your practical efforts. Connect with the natural qualities of ${cardName} to ground your ambitions.`;
      strengths = `Practical intelligence, reliability, loyalty, and exceptional endurance.`;
      challenges = `Stubbornness, fear of financial insecurity, stagnation, and ignoring emotional callings.`;
    }
    suggestedActions = `1. Draft a concrete 30-day roadmap for your current career/financial objectives.\n2. Engage in grounding exercises like nature walks or gardening.\n3. Dedicate time to reflect on your long-term stability rather than short-term gains.`;
  } 
  else if (isAir) {
    overallReading = `Your analytical, communicative, and intellectually active Air Hand is highly responsive to the intellectual and spiritual energies of ${cardName}. Your mind processes life through ideas, logic, and verbal expression. This card represents a prompt to direct your intellectual resources towards higher wisdom. `;
    if (cardOrient === "reversed") {
      overallReading += `With ${cardName} reversed, there is a risk of mental overload, overthinking, or miscommunication. Ensure your words match your core values.`;
      advice = `Quiet the mental chatter. Take steps to ground your intellect. Let go of the need to solve everything with logic alone, and listen to the silent whisper of the reversed ${cardName}.`;
      challenges = `Anxiety, mental fatigue, indecision, and emotional detachment.`;
      strengths = `Intellectual agility, superb communication, objective logic, and open-mindedness.`;
    } else {
      overallReading += `The upright alignment indicates that mental clarity, innovative solutions, and positive communications are flowing freely in your life.`;
      advice = `Voice your truth. Share your ideas with those around you. The upright presence of ${cardName} indicates a powerful period for teaching, writing, or strategic planning.`;
      strengths = `Intellectual agility, superb communication, objective logic, and open-mindedness.`;
      challenges = `Anxiety, mental fatigue, indecision, and emotional detachment.`;
    }
    suggestedActions = `1. Practice breathwork or silent meditation to calm an overactive mind.\n2. Write down your ideas in a journal to organize and validate them.\n3. Have an open, honest conversation with a trusted friend or mentor about your insights.`;
  }
  else if (isFire) {
    overallReading = `Your passionate, energetic, and action-oriented Fire Hand is ignited by the presence of ${cardName}. You lead with charisma, drive, and intuition. The cosmic lesson of this card is urging you to channel your ambition and dynamic spirit productively. `;
    if (cardOrient === "reversed") {
      overallReading += `Because ${cardName} appears reversed, it suggests that your passions may be blocked, or you could be burning out. Beware of impulsive decisions or conflicts.`;
      advice = `Pace yourself. The reversed card calls for a temporary pause. Re-evaluate where you are spending your valuable energy before taking further action.`;
      challenges = `Impulsiveness, impatience, short temper, and physical exhaustion/burnout.`;
      strengths = `Charisma, natural leadership, unwavering courage, and high vital energy.`;
    } else {
      overallReading += `The upright alignment signifies that your drive and courage are perfectly aligned with cosmic timing. You have the momentum needed to achieve your goals.`;
      advice = `Take the initiative. Trust your instincts and let your passion shine. The upright card encourages bold leadership and decisive action.`;
      strengths = `Charisma, natural leadership, unwavering courage, and high vital energy.`;
      challenges = `Impulsiveness, impatience, short temper, and physical exhaustion/burnout.`;
    }
    suggestedActions = `1. Take charge of a creative project or leadership role you've been considering.\n2. Incorporate active rest or physical stretching to avoid burnout.\n3. Practice pausing for 5-10 seconds before making major impulsive commitments.`;
  }
  else {
    // Water Hand or Balanced Hand
    overallReading = `Your intuitive, empathetic, and emotionally sensitive Water Hand vibrates deeply with the card archetype of ${cardName}. You feel the world around you and rely on gut instinct. This card selection highlights deep currents in your subconscious mind and emotional relationships. `;
    if (cardOrient === "reversed") {
      overallReading += `With ${cardName} reversed, you may be experiencing emotional turbulence, absorbing other people's stress, or experiencing intuitive doubts.`;
      advice = `Set emotional boundaries. Protect your energy field. The reversed card warns you not to ignore your feelings, but to seek inner sanctuary rather than getting lost in external demands.`;
      challenges = `Mood swings, taking things too personally, relationship anxiety, and escapism.`;
      strengths = `Deep empathy, strong intuition, artistic/creative sensitivity, and relational intelligence.`;
    } else {
      overallReading += `The upright alignment indicates that your emotional intelligence, empathy, and intuitive capacities are highly active and will guide you to positive decisions.`;
      advice = `Trust your intuition blindly. It is your strongest compass. Allow your empathy to heal relationships and draw you closer to your spiritual self.`;
      strengths = `Deep empathy, strong intuition, artistic/creative sensitivity, and relational intelligence.`;
      challenges = `Mood swings, taking things too personally, relationship anxiety, and escapism.`;
    }
    suggestedActions = `1. Engage in an artistic pursuit (painting, music, poetry) to express your inner feelings.\n2. Maintain a dream journal to capture the wisdom of your subconscious.\n3. Establish clear, healthy boundaries with people who drain you emotionally.`;
  }

  // Synthesizing supplementary card influences (if 3 cards drawn)
  if (cards.length === 3) {
    const pastCard = cards.find((c) => c.role === "past") || cards[0];
    const futureCard = cards.find((c) => c.role === "future") || cards[2];
    overallReading += ` Reflecting on your timeline, the foundation of this state lies in the past energies of ${pastCard.name} (${pastCard.orientation}), which lead directly into your present situation. Looking ahead, the energetic trajectory points towards ${futureCard.name} (${futureCard.orientation}) as your future guide, indicating the eventual lessons and outcomes that await your action.`;
  }

  return {
    palmSummary,
    tarotSummary,
    overallReading,
    advice,
    strengths,
    challenges,
    suggestedActions,
  };
};
