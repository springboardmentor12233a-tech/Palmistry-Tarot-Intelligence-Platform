const mongoose = require("mongoose");
const dotenv = require("dotenv");
const TarotCard = require("../models/TarotCard");

dotenv.config();

const verifyTarotCards = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB for verification...");

    const count = await TarotCard.countDocuments({});
    console.log(`📊 Number of Tarot cards in DB: ${count}`);

    if (count !== 78) {
      console.error(`❌ Expected 78 cards, found ${count}`);
      process.exit(1);
    }

    const cards = await TarotCard.find({});
    console.log(`✅ Successfully retrieved all ${cards.length} cards.`);

    const sample = cards[0];
    console.log("🔍 Checking a sample card structure:");
    console.log({
      id: sample._id,
      name: sample.name,
      arcana: sample.arcana,
      suit: sample.suit,
      number: sample.number,
      image: sample.image,
      uprightMeaning: sample.uprightMeaning.substring(0, 100) + "...",
      reversedMeaning: sample.reversedMeaning.substring(0, 100) + "...",
      loveMeaning: sample.loveMeaning.substring(0, 100) + "...",
    });

    // Check querying single card by ID
    const single = await TarotCard.findById(sample._id);
    if (!single || single.name !== sample.name) {
      console.error("❌ Failed to query single card by ID");
      process.exit(1);
    }
    console.log(`✅ Single card query by ID works for: ${single.name}`);

    mongoose.connection.close();
    console.log("👋 Verification complete. All tests passed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

verifyTarotCards();
