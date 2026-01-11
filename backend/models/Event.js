const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: 200,
    },
    emoji: {
      type: String,
      default: "💕",
    },
    date: {
      type: String,
      required: [true, "Event date is required"],
    },
    time: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
eventSchema.index({ date: 1 });

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
