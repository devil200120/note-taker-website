const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Todo text is required"],
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
todoSchema.index({ completed: 1, createdAt: -1 });
todoSchema.index({ priority: 1 });

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
