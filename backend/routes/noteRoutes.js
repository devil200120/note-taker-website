const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const { uploadBase64ToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");

// Get all notes
router.get("/", async (req, res) => {
  try {
    const { category, archived, search } = req.query;
    
    let query = {};
    
    if (category && category !== "all") {
      query.category = category;
    }
    
    if (archived === "true") {
      query.isArchived = true;
    } else {
      query.isArchived = false;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }
    
    const notes = await Note.find(query)
      .sort({ isPinned: -1, createdAt: -1 });
    
    res.json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notes 😿",
      error: error.message,
    });
  }
});

// Get single note
router.get("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found 🔍",
      });
    }
    
    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch note 😿",
      error: error.message,
    });
  }
});

// Create new note
router.post("/", async (req, res) => {
  try {
    const { title, content, color, emoji, category, images } = req.body;
    
    // Upload images to Cloudinary if provided
    let uploadedImages = [];
    if (images && images.length > 0) {
      for (const image of images) {
        if (image.startsWith("data:")) {
          const result = await uploadBase64ToCloudinary(image, "sradha-notes/notes");
          uploadedImages.push({
            url: result.url,
            publicId: result.publicId,
          });
        }
      }
    }
    
    const note = await Note.create({
      title,
      content,
      color,
      emoji,
      category,
      images: uploadedImages,
    });
    
    res.status(201).json({
      success: true,
      message: "Note created successfully! 💕",
      data: note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create note 😿",
      error: error.message,
    });
  }
});

// Update note
router.put("/:id", async (req, res) => {
  try {
    const { title, content, color, emoji, category, images, isLoved, isPinned, isArchived } = req.body;
    
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found 🔍",
      });
    }
    
    // Handle new images
    let uploadedImages = note.images || [];
    if (images && images.length > 0) {
      for (const image of images) {
        if (image.startsWith && image.startsWith("data:")) {
          const result = await uploadBase64ToCloudinary(image, "sradha-notes/notes");
          uploadedImages.push({
            url: result.url,
            publicId: result.publicId,
          });
        }
      }
    }
    
    // Update fields
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (color !== undefined) note.color = color;
    if (emoji !== undefined) note.emoji = emoji;
    if (category !== undefined) note.category = category;
    if (isLoved !== undefined) note.isLoved = isLoved;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (isArchived !== undefined) note.isArchived = isArchived;
    note.images = uploadedImages;
    
    await note.save();
    
    res.json({
      success: true,
      message: "Note updated successfully! ✨",
      data: note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update note 😿",
      error: error.message,
    });
  }
});

// Toggle love
router.patch("/:id/love", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found 🔍",
      });
    }
    
    note.isLoved = !note.isLoved;
    await note.save();
    
    res.json({
      success: true,
      message: note.isLoved ? "Note loved! ❤️" : "Love removed 🤍",
      data: note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle love 😿",
      error: error.message,
    });
  }
});

// Toggle pin
router.patch("/:id/pin", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found 🔍",
      });
    }
    
    note.isPinned = !note.isPinned;
    await note.save();
    
    res.json({
      success: true,
      message: note.isPinned ? "Note pinned! 📌" : "Note unpinned",
      data: note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle pin 😿",
      error: error.message,
    });
  }
});

// Toggle archive
router.patch("/:id/archive", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found 🔍",
      });
    }
    
    note.isArchived = !note.isArchived;
    if (note.isArchived) {
      note.isPinned = false; // Unpin when archiving
    }
    await note.save();
    
    res.json({
      success: true,
      message: note.isArchived ? "Note archived! 📦" : "Note restored! ✨",
      data: note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle archive 😿",
      error: error.message,
    });
  }
});

// Duplicate note
router.post("/:id/duplicate", async (req, res) => {
  try {
    const originalNote = await Note.findById(req.params.id);
    
    if (!originalNote) {
      return res.status(404).json({
        success: false,
        message: "Note not found 🔍",
      });
    }
    
    const duplicatedNote = await Note.create({
      title: originalNote.title ? `${originalNote.title} (Copy)` : "",
      content: `${originalNote.content} (Copy)`,
      color: originalNote.color,
      emoji: originalNote.emoji,
      category: originalNote.category,
      images: originalNote.images,
      isLoved: false,
      isPinned: false,
      isArchived: false,
    });
    
    res.status(201).json({
      success: true,
      message: "Note duplicated! 📋",
      data: duplicatedNote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to duplicate note 😿",
      error: error.message,
    });
  }
});

// Delete note
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found 🔍",
      });
    }
    
    // Delete images from Cloudinary
    if (note.images && note.images.length > 0) {
      for (const image of note.images) {
        if (image.publicId) {
          await deleteFromCloudinary(image.publicId);
        }
      }
    }
    
    await Note.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: "Note deleted successfully! 🗑️",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete note 😿",
      error: error.message,
    });
  }
});

module.exports = router;
