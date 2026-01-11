const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema(
  {
    mood: {
      emoji: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
        enum: ["Happy", "Loved", "Peaceful", "Excited", "Tired", "Sad", "Frustrated", "Hopeful"],
      },
      color: {
        type: String,
        required: true,
      },
      message: {
        type: String,
      },
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
moodSchema.index({ date: -1 });
moodSchema.index({ "mood.name": 1 });

const Mood = mongoose.model("Mood", moodSchema);

module.exports = Mood;
