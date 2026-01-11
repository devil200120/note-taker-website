const express = require("express");
const router = express.Router();
const Memory = require("../models/Memory");
const { uploadBase64ToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");

// Get all memories
router.get("/", async (req, res) => {
  try {
    const memories = await Memory.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: memories.length,
      data: memories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch memories 😿",
      error: error.message,
    });
  }
});

// Get single memory
router.get("/:id", async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    
    if (!memory) {
      return res.status(404).json({
        success: false,
        message: "Memory not found 🔍",
      });
    }
    
    res.json({
      success: true,
      data: memory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch memory 😿",
      error: error.message,
    });
  }
});

// Create new memory
router.post("/", async (req, res) => {
  try {
    const { title, description, images, date } = req.body;
    
    // Process images - handle both base64 and already-uploaded URLs
    let uploadedImages = [];
    if (images && images.length > 0) {
      for (const image of images) {
        if (typeof image === 'string') {
          if (image.startsWith("data:")) {
            // Base64 image - upload to Cloudinary
            const result = await uploadBase64ToCloudinary(image, "sradha-notes/memories");
            uploadedImages.push({
              url: result.url,
              publicId: result.publicId,
            });
          } else if (image.startsWith("http")) {
            // Already a URL (uploaded via separate upload endpoint)
            uploadedImages.push({
              url: image,
              publicId: null, // No publicId for pre-uploaded images
            });
          }
        } else if (typeof image === 'object' && image.url) {
          // Already in object format
          uploadedImages.push({
            url: image.url,
            publicId: image.publicId || null,
          });
        }
      }
    }
    
    const memory = await Memory.create({
      title,
      description,
      images: uploadedImages,
      date: date ? new Date(date) : null,
    });
    
    res.status(201).json({
      success: true,
      message: "Memory saved! 📸",
      data: memory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save memory 😿",
      error: error.message,
    });
  }
});

// Add heart to memory
router.patch("/:id/heart", async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    
    if (!memory) {
      return res.status(404).json({
        success: false,
        message: "Memory not found 🔍",
      });
    }
    
    memory.hearts += 1;
    await memory.save();
    
    res.json({
      success: true,
      message: "Heart added! 💕",
      data: memory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add heart 😿",
      error: error.message,
    });
  }
});

// Delete memory
router.delete("/:id", async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    
    if (!memory) {
      return res.status(404).json({
        success: false,
        message: "Memory not found 🔍",
      });
    }
    
    // Delete images from Cloudinary
    if (memory.images && memory.images.length > 0) {
      for (const image of memory.images) {
        if (image.publicId) {
          await deleteFromCloudinary(image.publicId);
        }
      }
    }
    
    await Memory.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: "Memory deleted! 🗑️",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete memory 😿",
      error: error.message,
    });
  }
});

module.exports = router;
