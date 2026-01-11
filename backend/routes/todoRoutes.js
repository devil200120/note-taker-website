const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");

// Get all todos
router.get("/", async (req, res) => {
  try {
    const { filter } = req.query;
    let query = {};
    
    if (filter === "active") {
      query.completed = false;
    } else if (filter === "completed") {
      query.completed = true;
    }
    
    const todos = await Todo.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: todos.length,
      data: todos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch todos 😿",
      error: error.message,
    });
  }
});

// Create new todo
router.post("/", async (req, res) => {
  try {
    const { text, priority } = req.body;
    
    const todo = await Todo.create({
      text,
      priority: priority || "normal",
    });
    
    res.status(201).json({
      success: true,
      message: "Todo added! ✅",
      data: todo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create todo 😿",
      error: error.message,
    });
  }
});

// Toggle todo completion
router.patch("/:id/toggle", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found 🔍",
      });
    }
    
    todo.completed = !todo.completed;
    await todo.save();
    
    res.json({
      success: true,
      message: todo.completed ? "Task completed! 🎉" : "Task reopened",
      data: todo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update todo 😿",
      error: error.message,
    });
  }
});

// Delete todo
router.delete("/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found 🔍",
      });
    }
    
    res.json({
      success: true,
      message: "Todo deleted! 🗑️",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete todo 😿",
      error: error.message,
    });
  }
});

// Clear completed todos
router.delete("/completed/clear", async (req, res) => {
  try {
    const result = await Todo.deleteMany({ completed: true });
    
    res.json({
      success: true,
      message: `${result.deletedCount} completed todos cleared! 🧹`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear todos 😿",
      error: error.message,
    });
  }
});

module.exports = router;
