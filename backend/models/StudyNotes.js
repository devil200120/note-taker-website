const mongoose = require("mongoose");

const studyPdfSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "PDF name is required"],
      trim: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudySection",
      required: true,
    },
    fileData: {
      type: String, // Base64 encoded PDF data
      required: true,
    },
    size: {
      type: String,
    },
    lastPage: {
      type: Number,
      default: 1,
    },
    totalPages: {
      type: Number,
      default: 1,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const studySectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Section name is required"],
      trim: true,
    },
    emoji: {
      type: String,
      default: "📚",
    },
    color: {
      type: String,
      enum: ["rose", "purple", "blue", "green", "yellow", "orange", "cyan", "pink"],
      default: "rose",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
studyPdfSchema.index({ sectionId: 1, createdAt: -1 });
studyPdfSchema.index({ isFavorite: -1 });
studySectionSchema.index({ createdAt: -1 });

const StudySection = mongoose.model("StudySection", studySectionSchema);
const StudyPdf = mongoose.model("StudyPdf", studyPdfSchema);

module.exports = { StudySection, StudyPdf };
