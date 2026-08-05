const mongoose = require("mongoose");

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;
  const maskedUri = process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^:@]+)@/, ":******@") : "undefined";

  while (retries < maxRetries) {
    try {
      console.log(`🔌 [Attempt ${retries + 1}/${maxRetries}] Connecting to DB: ${maskedUri}`);
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("✅ MongoDB Connected Successfully");
      return;
    } catch (error) {
      retries++;
      console.error(`❌ DB Connection attempt ${retries} failed: ${error.message}`);
      if (retries < maxRetries) {
        console.log("⏳ Retrying connection in 3 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        console.error("❌ Max database connection retries reached. Exiting process.");
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;