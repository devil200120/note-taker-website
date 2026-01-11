const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    date: {
      type: Date,
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
memorySchema.index({ createdAt: -1 });
memorySchema.index({ date: -1 });

const Memory = mongoose.model("Memory", memorySchema);

module.exports = Memory;
