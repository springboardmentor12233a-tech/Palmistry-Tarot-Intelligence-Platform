const mongoose = require("mongoose");

const tarotReadingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readingType: {
      type: String,
      enum: ["one-card", "three-card"],
      required: true,
    },
    cards: [
      {
        cardId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TarotCard",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          required: true,
        },
        orientation: {
          type: String,
          enum: ["upright", "reversed"],
          required: true,
        },
        role: {
          type: String, // "present" or "past", "present", "future"
          default: "present",
        },
      },
    ],
    interpretation: {
      general: { type: String, required: true },
      love: { type: String, required: true },
      career: { type: String, required: true },
      health: { type: String, required: true },
      money: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TarotReading", tarotReadingSchema);
