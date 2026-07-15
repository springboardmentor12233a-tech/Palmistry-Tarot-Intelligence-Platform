const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

// Test Route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth Routes Working!",
  });
});

// Register Route
router.post("/register", registerUser);

// Login Route
router.post("/login", loginUser);

module.exports = router;