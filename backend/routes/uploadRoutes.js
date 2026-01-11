const express = require("express");
const router = express.Router();
const { uploadToCloudinary, uploadBase64ToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");

// Upload single image (file)
router.post("/image", async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: "No image file provided 📷",
      });
    }
    
    const file = req.files.image;
    const folder = req.body.folder || "sradha-notes";
    
    const result = await uploadToCloudinary(file, folder);
    
    res.json({
      success: true,
      message: "Image uploaded successfully! 📸",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload image 😿",
      error: error.message,
    });
  }
});

// Upload base64 image
router.post("/base64", async (req, res) => {
  try {
    const { image, folder } = req.body;
    
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "No image data provided 📷",
      });
    }
    
    const result = await uploadBase64ToCloudinary(image, folder || "sradha-notes");
    
    res.json({
      success: true,
      message: "Image uploaded successfully! 📸",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload image 😿",
      error: error.message,
    });
  }
});

// Upload multiple images
router.post("/multiple", async (req, res) => {
  try {
    const { images, folder } = req.body;
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images provided 📷",
      });
    }
    
    const uploadedImages = [];
    
    for (const image of images) {
      const result = await uploadBase64ToCloudinary(image, folder || "sradha-notes");
      uploadedImages.push(result);
    }
    
    res.json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully! 📸`,
      data: uploadedImages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload images 😿",
      error: error.message,
    });
  }
});

// Delete image
router.delete("/:publicId", async (req, res) => {
  try {
    const publicId = req.params.publicId;
    
    const result = await deleteFromCloudinary(publicId);
    
    res.json({
      success: true,
      message: "Image deleted successfully! 🗑️",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete image 😿",
      error: error.message,
    });
  }
});

module.exports = router;
