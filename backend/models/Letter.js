const mongoose = require("mongoose");

const letterSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      trim: true,
      default: "My Beautiful Self",
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, "Letter content is required"],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    hearts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
letterSchema.index({ createdAt: -1 });
letterSchema.index({ isRead: 1 });

const Letter = mongoose.model("Letter", letterSchema);

module.exports = Letter;
