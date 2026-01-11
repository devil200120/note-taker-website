const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, "Note content is required"],
      trim: true,
    },
    color: {
      type: String,
      enum: ["rose", "purple", "blue", "yellow", "green", "orange"],
      default: "rose",
    },
    emoji: {
      type: String,
      default: "💕",
    },
    category: {
      type: String,
      enum: ["personal", "study", "dreams", "memories", "ideas"],
      default: "personal",
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    isLoved: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
noteSchema.index({ createdAt: -1 });
noteSchema.index({ isPinned: -1, createdAt: -1 });
noteSchema.index({ category: 1 });
noteSchema.index({ isArchived: 1 });

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
