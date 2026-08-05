/**
 * AI Interpretation Engine for Palmistry & Tarot.
 * Synthesizes a unified report based on user profile details, palm analysis, and tarot spread.
 */

/**
 * Calculates age based on Date of Birth.
 * @param {Date|String} dob 
 * @returns {Number|null}
 */
const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;
  const difference = Date.now() - birthDate.getTime();
  const ageDate = new Date(difference);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

/**
 * Generates AI Interpretation Report.
 * @param {Object} palmReading - Palm Reading document containing analysis
 * @param {Object} tarotReading - Tarot Reading document containing cards & interpretations
 * @param {Object} user - User document containing profile details
 * @returns {Object} JSON report
 */
exports.generateAIInterpretation = async (palmReading, tarotReading, user) => {
  const palm = (palmReading && palmReading.analysis) || {};
  const tarotCards = (tarotReading && tarotReading.cards) || [];
  const tarotInterp = (tarotReading && tarotReading.interpretation) || {};

  const name = (user && user.name) || "Seeker";
  const gender = (user && user.gender) || "";
  const age = user ? calculateAge(user.dob) : null;
  
  const ageText = age ? `${age}-year-old` : "discerning";
  const genderText = gender ? gender.toLowerCase() : "seeker";
  const profileIntro = `${name}, as a ${ageText} ${genderText}`;

  // Get primary hand type and card details
  const rawHandType = (palm.handType || "Balanced Hand").toLowerCase();
  const handType = rawHandType.includes("earth") ? "Earth" 
                 : rawHandType.includes("air") ? "Air"
                 : rawHandType.includes("fire") ? "Fire"
                 : rawHandType.includes("water") ? "Water"
                 : "Balanced";

  const primaryCard = tarotCards[0] || { name: "The Fool", orientation: "upright" };
  const primaryCardName = primaryCard.name;
  const primaryCardOrient = primaryCard.orientation;

  // Determine structured fields dynamically based on hand type and tarot energy
  let personality = "";
  let strengths = [];
  let weaknesses = [];
  let hiddenTalents = [];
  let emotions = "";
  let career = "";
  let relationship = "";
  let finance = "";
  let guidance = "";

  if (handType === "Earth") {
    personality = `${profileIntro}, your Earth Hand grounds your core character in absolute realism, stability, and tangible action. This physical resilience is presently interacting with the archetype of ${primaryCardName} (${primaryCardOrient}). You have an inherent need to build structures that last, and you approach challenges with solid, practical logic. The cosmic card represents a call to anchor these practical traits in a higher spiritual realization.`;
    strengths = [
      "Steadfast reliability under pressure",
      "Exceptional long-term endurance and planning",
      "Pragmatic approach to problem solving",
      "Nurturing loyalty in interpersonal bonds"
    ];
    weaknesses = [
      "Resistance to sudden or volatile changes",
      "Tendency toward perfectionism in material affairs",
      "Risk of over-working at the cost of emotional release",
      "Occasional stubbornness when ideas are challenged"
    ];
    hiddenTalents = [
      "Natural capability for crisis management and stabilization",
      "Talent for spatial design and natural crafts",
      "Inherent botanical or herbal intuition"
    ];
    emotions = `In your emotional sphere, your analytical mind values stability. Combined with the tarot's current guidance, you seek connections that offer safety and long-term viability. You process feelings slowly and deeply, demanding authenticity over transient thrill. Protect your heart but allow flexibility.`;
    career = `Professionally, your ${palm.leadership || "cooperative approach"} suggests you excel when constructing or managing projects. Tarot reveals a phase of substantial growth if you align your daily tasks with long-term stability. Do not rush transitions; your timing is structural.`;
    relationship = `Your relationship style is loyal and grounded. However, the presence of ${primaryCardName} suggests you need to communicate your inner feelings more actively rather than keeping them compartmentalized. Build trust through simple, shared actions.`;
    finance = `Financially, your nature is risk-averse. The tarot indicators recommend focusing on building safety nets, but also warn against a scarcity mindset that prevents you from investing in your own growth.`;
    guidance = `The universe reminds you: true security comes from within. Trust your stability, but remain open to the winds of changes that ${primaryCardName} represents.`;
  } 
  else if (handType === "Air") {
    personality = `${profileIntro}, your Air Hand represents intellectual agility, communication, and a mind that thrives on logic and dynamic communication. This active thinking is presently interacting with the archetype of ${primaryCardName} (${primaryCardOrient}). You seek to understand the underlying principles of all experiences, processing life through concepts, thoughts, and words.`;
    strengths = [
      "Intellectual adaptability and analytical speed",
      "Articulate expression of abstract concepts",
      "Objective neutrality in conflict situations",
      "Constant curiosity and innovative thinking"
    ];
    weaknesses = [
      "Tendency to over-analyze simple emotional matters",
      "Mental exhaustion from constant cognitive chatter",
      "Risk of intellectual detachment from physical reality",
      "Indecision when faced with multiple logical options"
    ];
    hiddenTalents = [
      "Talent for mediation, counseling, and public relations",
      "Rapid learning of languages, symbols, and systems",
      "Ability to write, speak, or teach with compelling clarity"
    ];
    emotions = `Your emotional pattern shows a highly active cerebral processing of feelings. You prefer to explain your emotions rather than simply feel them. The tarot spread alerts you to integrate your feelings directly into your body. Release mental filters and listen to your intuition.`;
    career = `With your ${palm.thinkingStyle || "analytical processing"}, you are an ideal strategist. Tarot influences point towards careers where communication, teaching, or digital technology allow your ideas to propagate. Avoid stagnating in routine tasks.`;
    relationship = `In love and friendships, you value intellectual chemistry above all. The current tarot energy suggests forming deep, conversational connections but warns against keeping relationships purely cerebral. Don't fear emotional vulnerability.`;
    finance = `Financially, your analytical mindset helps you evaluate options, but overthinking can lead to missed investment opportunities. Trust your calculations and move forward with decisive action.`;
    guidance = `Your spiritual key: quiet the mind so the heart can speak. Use breathwork to ground your thoughts and allow the inspiration of ${primaryCardName} to expand your life.`;
  }
  else if (handType === "Fire") {
    personality = `${profileIntro}, your Fire Hand is the marker of passion, drive, vitality, and natural action. Present in your cards is ${primaryCardName} (${primaryCardOrient}), lighting a fire under your ambitions and highlighting a powerful period of creative action. You lead with gut instincts, charisma, and high-energy inspiration.`;
    strengths = [
      "Infectious optimism and charismatic leadership",
      "Unflinching courage to initiate risk and venture out",
      "Intuitively quick action and adaptability",
      "High vital energy and creative expression"
    ];
    weaknesses = [
      "Impulsive commitments leading to burnout",
      "Impatience with slow-paced processes or details",
      "A quick-burning emotional temper",
      "Difficulty receiving constructive criticism or direction"
    ];
    hiddenTalents = [
      "High capacity for motivational speech and performing arts",
      "Inherent entrepreneurial instinct and opportunity spotting",
      "Natural athletic or physical coordination"
    ];
    emotions = `Your emotional current runs hot, quick, and expressive. You feel deeply and immediately, but can also recover quickly from setbacks. Tarot indicates a need to pace your emotional intensity so you don't burn out yourself or others.`;
    career = `Your palm traits highlight ${palm.leadership || "strong willpower"}. You excel in entrepreneurial, creative, or executive roles. The tarot indicates that taking a calculated risk now is highly favored under your current alignment.`;
    relationship = `In relationships, you bring excitement, romance, and fierce protectiveness. However, the cards urge you to practice active listening. Give your partners space to express themselves without overshadowing them.`;
    finance = `Your financial style is bold. Tarot advises setting aside a reserve for unpredictable events, cautioning against impulsive spending on high-risk, glamorous investments.`;
    guidance = `The universe says: direct your flame, do not let it scatter. Harness the dynamic guidance of ${primaryCardName} to build a legacy of inspiration.`;
  }
  else {
    // Water Hand or Balanced Hand
    personality = `${profileIntro}, your Water Hand speaks of deep intuition, profound empathy, and emotional sensitivity. Guided by the spiritual cards of ${primaryCardName} (${primaryCardOrient}), you navigate the world through invisible currents of emotion and instinct. You are highly creative, artistic, and responsive to the vibrations of your environment.`;
    strengths = [
      "Deep emotional intelligence and empathy",
      "Strong intuitive guidance and psychic awareness",
      "Creative and artistic sensitivity",
      "Gentle, therapeutic presence for those in pain"
    ];
    weaknesses = [
      "Absorbing other people's negative emotional states",
      "Tendency to retreat into fantasy or avoidance when stressed",
      "Relationship boundaries that are easily crossed",
      "Mood swings tied to shifting environment currents"
    ];
    hiddenTalents = [
      "Natural artistic skills (music, painting, poetry, or design)",
      "Exceptional dream recall and subconscious translation",
      "Therapeutic healing and energetic intuition"
    ];
    emotions = `Your emotional nature is vast like the ocean, sensing currents that others ignore. The cards indicate you may be holding onto external emotional baggage. Create spiritual boundaries and cleanse your energy field regularly.`;
    career = `With your intuitive processing, you thrive in creative, human-centric, or therapeutic professions. Tarot suggests that your work must have a deeper purpose or cause to keep you motivated. Avoid overly sterile or cutthroat workspaces.`;
    relationship = `Your relationship style is deeply merging and emotional. You seek a soul-level connection. The cards suggest that maintaining your own independent identity is crucial to the health of your relationship.`;
    finance = `Your financial decisions are often mood-based. Tarot counsels using a structured, automated system to manage savings so that emotional phases do not impact your financial stability.`;
    guidance = `Your spiritual wisdom: flow like water, but know your banks. Let the intuitive wisdom of ${primaryCardName} serve as a compass for your healing and growth.`;
  }

  // Inject user profile or tarot details into general interpretations if present
  if (tarotInterp.general) {
    guidance += `\n\n**Tarot Alignment Insight:** ${tarotInterp.general.substring(0, 300)}...`;
  }
  if (tarotInterp.love) {
    relationship += `\n\n**Interpersonal Card Guidance:** ${tarotInterp.love.substring(0, 250)}...`;
  }
  if (tarotInterp.career) {
    career += `\n\n**Professional Card Guidance:** ${tarotInterp.career.substring(0, 250)}...`;
  }
  if (tarotInterp.money) {
    finance += `\n\n**Financial Card Guidance:** ${tarotInterp.money.substring(0, 250)}...`;
  }

  return {
    personality,
    strengths,
    weaknesses,
    hiddenTalents,
    emotions,
    career,
    relationship,
    finance,
    guidance
  };
};
