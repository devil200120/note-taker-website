const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Fixed credentials for Sradha 💕
const VALID_CREDENTIALS = {
  username: "sradha",
  password: "iloveyou",
};

// Login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate credentials
    if (
      username.toLowerCase() !== VALID_CREDENTIALS.username ||
      password !== VALID_CREDENTIALS.password
    ) {
      return res.status(401).json({
        success: false,
        message: "Oops! Wrong credentials, my love 💔",
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { username: VALID_CREDENTIALS.username, name: "Sradha Priyadarshini" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    
    res.json({
      success: true,
      message: "Welcome back, beautiful! 💕",
      data: {
        token,
        user: {
          username: VALID_CREDENTIALS.username,
          name: "Sradha Priyadarshini",
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed 😿",
      error: error.message,
    });
  }
});

// Verify token route
router.get("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided 🔐",
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      message: "Token is valid! ✨",
      data: {
        user: {
          username: decoded.username,
          name: decoded.name,
        },
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token 🔐",
    });
  }
});

// Logout route (client-side handles token removal)
router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully! See you soon 💕",
  });
});

module.exports = router;
