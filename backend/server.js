const dotenv = require("dotenv");
// Load environment variables immediately
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const palmRoutes = require("./routes/palmRoutes");
const tarotRoutes = require("./routes/tarotRoutes");
const combinedRoutes = require("./routes/combinedRoutes");

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/palm", palmRoutes);
app.use("/api/tarot", tarotRoutes);
app.use("/api/combined", combinedRoutes);


app.get("/", (req, res) => {
  res.send("Palmistry & Tarot Intelligence Platform API is Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});