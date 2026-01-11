const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// Get all events
router.get("/", async (req, res) => {
  try {
    const { date, upcoming } = req.query;
    let query = {};
    
    if (date) {
      query.date = date;
    }
    
    if (upcoming === "true") {
      const today = new Date().toISOString().split("T")[0];
      query.date = { $gte: today };
    }
    
    const events = await Event.find(query).sort({ date: 1 });
    
    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch events 😿",
      error: error.message,
    });
  }
});

// Get events for a specific date
router.get("/date/:date", async (req, res) => {
  try {
    const events = await Event.find({ date: req.params.date }).sort({ time: 1 });
    
    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch events 😿",
      error: error.message,
    });
  }
});

// Create new event
router.post("/", async (req, res) => {
  try {
    const { title, emoji, date, time } = req.body;
    
    const event = await Event.create({
      title,
      emoji: emoji || "💕",
      date,
      time,
    });
    
    res.status(201).json({
      success: true,
      message: "Event created! 📅",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create event 😿",
      error: error.message,
    });
  }
});

// Update event
router.put("/:id", async (req, res) => {
  try {
    const { title, emoji, date, time } = req.body;
    
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { title, emoji, date, time },
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found 🔍",
      });
    }
    
    res.json({
      success: true,
      message: "Event updated! ✨",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update event 😿",
      error: error.message,
    });
  }
});

// Delete event
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found 🔍",
      });
    }
    
    res.json({
      success: true,
      message: "Event deleted! 🗑️",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete event 😿",
      error: error.message,
    });
  }
});

module.exports = router;
