const mongoose = require("mongoose");

const palmReadingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    landmarks: [
      {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        z: { type: Number, required: true },
      },
    ],
    extractedFeatures: {
      palmWidth: { type: Number },
      palmHeight: { type: Number },
      thumbLength: { type: Number },
      indexFingerLength: { type: Number },
      middleFingerLength: { type: Number },
      ringFingerLength: { type: Number },
      littleFingerLength: { type: Number },
    },
    analysis: {
      handType: { type: String },
      leadership: { type: String },
      communication: { type: String },
      thinkingStyle: { type: String },
      confidence: { type: String },
      summary: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PalmReading", palmReadingSchema);
