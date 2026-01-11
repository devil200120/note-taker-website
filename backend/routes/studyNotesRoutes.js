const express = require("express");
const router = express.Router();
const { StudySection, StudyPdf } = require("../models/StudyNotes");

// ==================== SECTIONS ====================

// Get all sections
router.get("/sections", async (req, res) => {
  try {
    const sections = await StudySection.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: sections.length,
      data: sections,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch sections 😿",
      error: error.message,
    });
  }
});

// Create new section
router.post("/sections", async (req, res) => {
  try {
    const { name, emoji, color } = req.body;
    
    const section = await StudySection.create({
      name,
      emoji: emoji || "📚",
      color: color || "rose",
    });
    
    res.status(201).json({
      success: true,
      message: "Section created! 📁",
      data: section,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create section 😿",
      error: error.message,
    });
  }
});

// Update section
router.put("/sections/:id", async (req, res) => {
  try {
    const { name, emoji, color } = req.body;
    
    const section = await StudySection.findByIdAndUpdate(
      req.params.id,
      { name, emoji, color },
      { new: true, runValidators: true }
    );
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found 🔍",
      });
    }
    
    res.json({
      success: true,
      message: "Section updated! ✨",
      data: section,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update section 😿",
      error: error.message,
    });
  }
});

// Delete section (and all its PDFs)
router.delete("/sections/:id", async (req, res) => {
  try {
    const section = await StudySection.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found 🔍",
      });
    }
    
    // Delete all PDFs in this section
    await StudyPdf.deleteMany({ sectionId: req.params.id });
    
    // Delete the section
    await StudySection.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: "Section and all its PDFs deleted! 🗑️",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete section 😿",
      error: error.message,
    });
  }
});

// ==================== PDFs ====================

// Get all PDFs
router.get("/pdfs", async (req, res) => {
  try {
    const { sectionId, favorite } = req.query;
    let query = {};
    
    if (sectionId) {
      query.sectionId = sectionId;
    }
    
    if (favorite === "true") {
      query.isFavorite = true;
    }
    
    // Don't send fileData in list view (too large)
    const pdfs = await StudyPdf.find(query)
      .select("-fileData")
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: pdfs.length,
      data: pdfs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch PDFs 😿",
      error: error.message,
    });
  }
});

// Get single PDF (with file data)
router.get("/pdfs/:id", async (req, res) => {
  try {
    const pdf = await StudyPdf.findById(req.params.id);
    
    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: "PDF not found 🔍",
      });
    }
    
    res.json({
      success: true,
      data: pdf,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch PDF 😿",
      error: error.message,
    });
  }
});

// Upload new PDF
router.post("/pdfs", async (req, res) => {
  try {
    const { name, sectionId, fileData, size, totalPages } = req.body;
    
    // Check if section exists
    const section = await StudySection.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found 🔍",
      });
    }
    
    const pdf = await StudyPdf.create({
      name,
      sectionId,
      fileData,
      size,
      totalPages: totalPages || 1,
    });
    
    // Return without fileData
    const pdfResponse = pdf.toObject();
    delete pdfResponse.fileData;
    
    res.status(201).json({
      success: true,
      message: "PDF uploaded successfully! 📄",
      data: pdfResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload PDF 😿",
      error: error.message,
    });
  }
});

// Update PDF (last page, favorite, etc.)
router.patch("/pdfs/:id", async (req, res) => {
  try {
    const { lastPage, totalPages, isFavorite, name } = req.body;
    
    const pdf = await StudyPdf.findById(req.params.id);
    
    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: "PDF not found 🔍",
      });
    }
    
    if (lastPage !== undefined) pdf.lastPage = lastPage;
    if (totalPages !== undefined) pdf.totalPages = totalPages;
    if (isFavorite !== undefined) pdf.isFavorite = isFavorite;
    if (name !== undefined) pdf.name = name;
    
    await pdf.save();
    
    // Return without fileData
    const pdfResponse = pdf.toObject();
    delete pdfResponse.fileData;
    
    res.json({
      success: true,
      message: "PDF updated! ✨",
      data: pdfResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update PDF 😿",
      error: error.message,
    });
  }
});

// Toggle PDF favorite
router.patch("/pdfs/:id/favorite", async (req, res) => {
  try {
    const pdf = await StudyPdf.findById(req.params.id);
    
    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: "PDF not found 🔍",
      });
    }
    
    pdf.isFavorite = !pdf.isFavorite;
    await pdf.save();
    
    res.json({
      success: true,
      message: pdf.isFavorite ? "Added to favorites! ⭐" : "Removed from favorites",
      data: { isFavorite: pdf.isFavorite },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update PDF 😿",
      error: error.message,
    });
  }
});

// Delete PDF
router.delete("/pdfs/:id", async (req, res) => {
  try {
    const pdf = await StudyPdf.findByIdAndDelete(req.params.id);
    
    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: "PDF not found 🔍",
      });
    }
    
    res.json({
      success: true,
      message: "PDF deleted! 🗑️",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete PDF 😿",
      error: error.message,
    });
  }
});

module.exports = router;
