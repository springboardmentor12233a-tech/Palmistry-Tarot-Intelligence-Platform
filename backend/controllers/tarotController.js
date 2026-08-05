const TarotCard = require("../models/TarotCard");
const TarotReading = require("../models/TarotReading");
const { generateInterpretation } = require("../services/tarotInterpretationService");

// ==============================
// Get All Tarot Cards Controller
// ==============================
exports.getTarotCards = async (req, res) => {
  try {
    const cards = await TarotCard.find({});
    
    // Construct dynamic absolute imageUrl path
    const formattedCards = cards.map(card => {
      const cardObj = card.toObject();
      if (cardObj.image && !cardObj.image.startsWith("http")) {
        cardObj.imageUrl = `${req.protocol}://${req.get("host")}${cardObj.image}`;
      } else {
        cardObj.imageUrl = cardObj.image;
      }
      return cardObj;
    });

    res.status(200).json({
      success: true,
      count: cards.length,
      cards: formattedCards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Tarot cards.",
    });
  }
};

// ==============================
// Get Single Tarot Card By ID
// ==============================
exports.getTarotCardById = async (req, res) => {
  try {
    const card = await TarotCard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Tarot card not found.",
      });
    }

    const cardObj = card.toObject();
    if (cardObj.image && !cardObj.image.startsWith("http")) {
      cardObj.imageUrl = `${req.protocol}://${req.get("host")}${cardObj.image}`;
    } else {
      cardObj.imageUrl = cardObj.image;
    }

    res.status(200).json({
      success: true,
      card: cardObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Tarot card.",
    });
  }
};

// ==============================
// Save Tarot Reading Controller
// ==============================
exports.saveTarotReading = async (req, res) => {
  try {
    const { readingType, cards } = req.body;

    if (!readingType || !cards || cards.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing readingType or cards selection data.",
      });
    }

    // Call service to generate interpretations and populate card metadata
    const { interpretations, populatedCards } = await generateInterpretation(cards);

    const newReading = new TarotReading({
      userId: req.user._id,
      readingType,
      cards: populatedCards,
      interpretation: interpretations,
    });

    const savedReading = await newReading.save();

    res.status(201).json({
      success: true,
      message: "Tarot reading saved successfully.",
      reading: savedReading,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to save Tarot reading.",
    });
  }
};

// ==============================
// Get User Tarot Readings History
// ==============================
exports.getUserTarotReadings = async (req, res) => {
  try {
    const readings = await TarotReading.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Format card image URLs to be absolute
    const formattedReadings = readings.map((reading) => {
      const readingObj = reading.toObject();
      readingObj.cards = readingObj.cards.map((c) => {
        if (c.image && !c.image.startsWith("http")) {
          c.imageUrl = `${req.protocol}://${req.get("host")}${c.image}`;
        } else {
          c.imageUrl = c.image;
        }
        return c;
      });
      return readingObj;
    });

    res.status(200).json({
      success: true,
      count: readings.length,
      readings: formattedReadings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Tarot readings history.",
    });
  }
};

// ==============================
// Delete Tarot Reading
// ==============================
exports.deleteTarotReading = async (req, res) => {
  try {
    const reading = await TarotReading.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Tarot reading not found or unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tarot reading deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete Tarot reading.",
    });
  }
};
