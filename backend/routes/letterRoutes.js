const express = require("express");
const router = express.Router();
const Letter = require("../models/Letter");

// Get all letters
router.get("/", async (req, res) => {
  try {
    const letters = await Letter.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: letters.length,
      data: letters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch letters 😿",
      error: error.message,
    });
  }
});

// Get single letter
router.get("/:id", async (req, res) => {
  try {
    const letter = await Letter.findById(req.params.id);
    
    if (!letter) {
      return res.status(404).json({
        success: false,
        message: "Letter not found 🔍",
      });
    }
    
    res.json({
      success: true,
      data: letter,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch letter 😿",
      error: error.message,
    });
  }
});

// Create new letter
router.post("/", async (req, res) => {
  try {
    const { to, subject, content } = req.body;
    
    const letter = await Letter.create({
      to,
      subject,
      content,
    });
    
    res.status(201).json({
      success: true,
      message: "Letter saved with love! 💌",
      data: letter,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save letter 😿",
      error: error.message,
    });
  }
});

// Mark letter as read
router.patch("/:id/read", async (req, res) => {
  try {
    const letter = await Letter.findById(req.params.id);
    
    if (!letter) {
      return res.status(404).json({
        success: false,
        message: "Letter not found 🔍",
      });
    }
    
    letter.isRead = true;
    await letter.save();
    
    res.json({
      success: true,
      message: "Letter marked as read! 📬",
      data: letter,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update letter 😿",
      error: error.message,
    });
  }
});

// Add heart to letter
router.patch("/:id/heart", async (req, res) => {
  try {
    const letter = await Letter.findById(req.params.id);
    
    if (!letter) {
      return res.status(404).json({
        success: false,
        message: "Letter not found 🔍",
      });
    }
    
    letter.hearts += 1;
    await letter.save();
    
    res.json({
      success: true,
      message: "Heart added! 💕",
      data: letter,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add heart 😿",
      error: error.message,
    });
  }
});

// Delete letter
router.delete("/:id", async (req, res) => {
  try {
    const letter = await Letter.findByIdAndDelete(req.params.id);
    
    if (!letter) {
      return res.status(404).json({
        success: false,
        message: "Letter not found 🔍",
      });
    }
    
    res.json({
      success: true,
      message: "Letter deleted! 🗑️",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete letter 😿",
      error: error.message,
    });
  }
});

module.exports = router;
