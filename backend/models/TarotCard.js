const mongoose = require("mongoose");

const tarotCardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    arcana: {
      type: String,
      enum: ["Major", "Minor"],
      required: true,
    },
    suit: {
      type: String,
      default: null,
    },
    number: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    uprightMeaning: {
      type: String,
      required: true,
    },
    reversedMeaning: {
      type: String,
      required: true,
    },
    loveMeaning: {
      type: String,
      required: true,
    },
    careerMeaning: {
      type: String,
      required: true,
    },
    healthMeaning: {
      type: String,
      required: true,
    },
    moneyMeaning: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TarotCard", tarotCardSchema);
