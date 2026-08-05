const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const TarotCard = require("../models/TarotCard");

// Load environment variables
dotenv.config();

const seedTarotCards = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB for seeding...");

    // Read the dataset
    const datasetPath = path.join(__dirname, "../../datasets/tarot/metadata/tarot-images.json");
    if (!fs.existsSync(datasetPath)) {
      throw new Error(`Dataset file not found at: ${datasetPath}`);
    }

    const data = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));
    const cards = data.cards;

    if (!cards || cards.length === 0) {
      throw new Error("No cards found in the dataset.");
    }

    // Clear existing cards
    await TarotCard.deleteMany({});
    console.log("🧹 Cleared existing Tarot cards from database.");

    // Process and format the cards
    const formattedCards = cards.map((card) => {
      const arcana = card.arcana === "Major Arcana" ? "Major" : "Minor";
      const suit = arcana === "Major" ? null : card.suit;
      const number = parseInt(card.number, 10);
      const image = `/uploads/tarot/${card.img}`;

      const keywords = card.keywords || [];
      const lightMeanings = card.meanings?.light || [];
      const shadowMeanings = card.meanings?.shadow || [];

      const uprightMeaning = lightMeanings.join(". ") || "No upright meaning available.";
      const reversedMeaning = shadowMeanings.join(". ") || "No reversed meaning available.";

      // Generate context-specific meanings
      const loveMeaning = `In love readings, this card suggests a time of ${keywords[0] || "reflection"} and ${keywords[1] || "potential"}. ${lightMeanings[0] || "Be open to new insights."} If reversed, be mindful of ${shadowMeanings[0] || "misunderstandings"}.`;
      const careerMeaning = `In career and professional life, this card signifies the importance of ${keywords[2] || keywords[0] || "focus"} and dynamic action. ${lightMeanings[1] || lightMeanings[0] || "Trust your abilities."} In the shadow, it warns against ${shadowMeanings[1] || shadowMeanings[0] || "acting impulsively"}.`;
      const healthMeaning = `Regarding health and energy, the presence of this card highlights ${keywords[3] || keywords[1] || "balance"} and vitality. Focus on ${lightMeanings[2] || lightMeanings[0] || "listening to your body's needs"}. Avoid ${shadowMeanings[2] || shadowMeanings[0] || "ignoring warning signs"}.`;
      const moneyMeaning = `For financial matters, this card counsels on ${keywords[0] || "prudent planning"} and resource management. Look for opportunities to ${lightMeanings[3] || lightMeanings[1] || "enhance your financial security"}. Be cautious of ${shadowMeanings[3] || shadowMeanings[1] || "unnecessary expenses"}.`;

      return {
        name: card.name,
        arcana,
        suit,
        number,
        image,
        uprightMeaning,
        reversedMeaning,
        loveMeaning,
        careerMeaning,
        healthMeaning,
        moneyMeaning,
      };
    });

    // Bulk insert formatted cards
    const seededCards = await TarotCard.insertMany(formattedCards);
    console.log(`🎉 Successfully seeded ${seededCards.length} Tarot cards!`);

    mongoose.connection.close();
    console.log("👋 Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedTarotCards();
