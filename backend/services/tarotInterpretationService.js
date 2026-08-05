const TarotCard = require("../models/TarotCard");

/**
 * Generates interpretations based on drawn cards and orientations.
 * @param {Array} cardsSelected - Array of { cardId, orientation, role }
 * @returns {Object} { interpretations, populatedCards }
 */
exports.generateInterpretation = async (cardsSelected) => {
  const interpretations = {
    general: "",
    love: "",
    career: "",
    health: "",
    money: "",
  };

  const populatedCards = [];
  for (const selection of cardsSelected) {
    const card = await TarotCard.findById(selection.cardId);
    if (!card) {
      throw new Error(`Tarot card with ID ${selection.cardId} not found.`);
    }
    populatedCards.push({
      card,
      orientation: selection.orientation,
      role: selection.role,
    });
  }

  // Define aspects to interpret
  const aspects = ["general", "love", "career", "health", "money"];

  aspects.forEach((aspect) => {
    const sections = populatedCards.map(({ card, orientation, role }) => {
      const roleText = role.charAt(0).toUpperCase() + role.slice(1); // Past, Present, Future
      let cardText = "";

      if (aspect === "general") {
        cardText = orientation === "upright" ? card.uprightMeaning : card.reversedMeaning;
      } else if (aspect === "love") {
        cardText = card.loveMeaning;
      } else if (aspect === "career") {
        cardText = card.careerMeaning;
      } else if (aspect === "health") {
        cardText = card.healthMeaning;
      } else if (aspect === "money") {
        cardText = card.moneyMeaning;
      }

      // Add custom intro highlighting card orientation
      const orientationText = orientation.toUpperCase();
      return `**${roleText} Alignment - ${card.name} (${orientationText}):**\n${cardText}`;
    });

    interpretations[aspect] = sections.join("\n\n");
  });

  // Format populated cards for return
  const formattedCards = populatedCards.map(({ card, orientation, role }) => ({
    cardId: card._id,
    name: card.name,
    image: card.image,
    orientation,
    role,
  }));

  return {
    interpretations,
    populatedCards: formattedCards,
  };
};
