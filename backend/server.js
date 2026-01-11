const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const path = require("path");

// Load environment variables
dotenv.config();

// Import routes
const noteRoutes = require("./routes/noteRoutes");
const moodRoutes = require("./routes/moodRoutes");
const letterRoutes = require("./routes/letterRoutes");
const memoryRoutes = require("./routes/memoryRoutes");
const todoRoutes = require("./routes/todoRoutes");
const eventRoutes = require("./routes/eventRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const studyNotesRoutes = require("./routes/studyNotesRoutes");
const authRoutes = require("./routes/authRoutes");

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
}));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("💕 Connected to MongoDB successfully!");
    console.log("✨ Sradha's Notes Database is ready!");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/letters", letterRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/study", studyNotesRoutes);

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "💕 Welcome to Sradha's Notes API! 💕",
    status: "Server is running beautifully ✨",
    endpoints: {
      auth: "/api/auth",
      notes: "/api/notes",
      moods: "/api/moods",
      letters: "/api/letters",
      memories: "/api/memories",
      todos: "/api/todos",
      events: "/api/events",
      upload: "/api/upload",
      study: "/api/study",
    },
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "Server is running with love 💖",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong 😿",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found 🔍",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌸 ================================== 🌸`);
  console.log(`   💖 Sradha's Notes Server 💖`);
  console.log(`   🚀 Running on port ${PORT}`);
  console.log(`   ✨ Made with love for Sradha ✨`);
  console.log(`🌸 ================================== 🌸\n`);
});

module.exports = app;
