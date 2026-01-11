const express = require("express");
const router = express.Router();
const Mood = require("../models/Mood");

// Get all moods
router.get("/", async (req, res) => {
  try {
    const moods = await Mood.find().sort({ date: -1 });
    
    res.json({
      success: true,
      count: moods.length,
      data: moods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch moods 😿",
      error: error.message,
    });
  }
});

// Get mood stats
router.get("/stats", async (req, res) => {
  try {
    const stats = await Mood.aggregate([
      {
        $group: {
          _id: "$mood.name",
          count: { $sum: 1 },
          emoji: { $first: "$mood.emoji" },
          color: { $first: "$mood.color" },
        },
      },
      { $sort: { count: -1 } },
    ]);
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch mood stats 😿",
      error: error.message,
    });
  }
});

// Create new mood
router.post("/", async (req, res) => {
  try {
    const { mood, note } = req.body;
    
    const newMood = await Mood.create({
      mood,
      note,
      date: new Date(),
    });
    
    res.status(201).json({
      success: true,
      message: "Mood saved! 💕",
      data: newMood,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save mood 😿",
      error: error.message,
    });
  }
});

// Delete mood
router.delete("/:id", async (req, res) => {
  try {
    const mood = await Mood.findByIdAndDelete(req.params.id);
    
    if (!mood) {
      return res.status(404).json({
        success: false,
        message: "Mood not found 🔍",
      });
    }
    
    res.json({
      success: true,
      message: "Mood deleted! 🗑️",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete mood 😿",
      error: error.message,
    });
  }
});

module.exports = router;
