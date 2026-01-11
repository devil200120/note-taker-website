import React, { useState, useEffect, useRef } from "react";
import PDFViewer from "./PDFViewer";
import { studyApi } from "../services/api";

// Beautiful Confirmation Dialog Component
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  emoji,
  type = "danger",
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      gradient: "from-red-400 to-rose-500",
      buttonBg: "bg-red-500 hover:bg-red-600",
      iconBg: "bg-red-100",
      borderColor: "border-red-200",
    },
    warning: {
      gradient: "from-yellow-400 to-orange-500",
      buttonBg: "bg-orange-500 hover:bg-orange-600",
      iconBg: "bg-orange-100",
      borderColor: "border-orange-200",
    },
    info: {
      gradient: "from-blue-400 to-cyan-500",
      buttonBg: "bg-blue-500 hover:bg-blue-600",
      iconBg: "bg-blue-100",
      borderColor: "border-blue-200",
    },
  };

  const styles = typeStyles[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden">
        {/* Header gradient */}
        <div className={`h-2 bg-gradient-to-r ${styles.gradient}`} />

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className={`w-20 h-20 rounded-full ${styles.iconBg} flex items-center justify-center animate-bounce-slow`}
            >
              <span className="text-5xl">{emoji}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-romantic text-2xl text-center gradient-text mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="font-sweet text-gray-600 text-center mb-6">{message}</p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-sweet text-gray-700 transition-all duration-300 hover:scale-105"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-6 py-3 rounded-xl ${styles.buttonBg} font-sweet text-white transition-all duration-300 hover:scale-105 shadow-lg`}
            >
              Yes, Delete
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 text-2xl opacity-20 animate-wiggle">
          ✨
        </div>
        <div className="absolute bottom-4 left-4 text-2xl opacity-20 animate-float">
          🌸
        </div>
      </div>
    </div>
  );
};

const StudyNotes = ({ onPdfViewChange }) => {
  const [sections, setSections] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSection, setNewSection] = useState({
    name: "",
    emoji: "📚",
    color: "rose",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(""); // Current upload status message
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const fileInputRef = useRef(null);

  // Confirmation dialog states
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    type: null, // 'section' or 'pdf'
    item: null,
  });

  const colorOptions = [
    {
      name: "rose",
      bg: "bg-rose-100",
      border: "border-rose-300",
      text: "text-rose-600",
    },
    {
      name: "blue",
      bg: "bg-blue-100",
      border: "border-blue-300",
      text: "text-blue-600",
    },
    {
      name: "green",
      bg: "bg-green-100",
      border: "border-green-300",
      text: "text-green-600",
    },
    {
      name: "purple",
      bg: "bg-purple-100",
      border: "border-purple-300",
      text: "text-purple-600",
    },
    {
      name: "yellow",
      bg: "bg-yellow-100",
      border: "border-yellow-300",
      text: "text-yellow-600",
    },
    {
      name: "cyan",
      bg: "bg-cyan-100",
      border: "border-cyan-300",
      text: "text-cyan-600",
    },
    {
      name: "orange",
      bg: "bg-orange-100",
      border: "border-orange-300",
      text: "text-orange-600",
    },
    {
      name: "pink",
      bg: "bg-pink-100",
      border: "border-pink-300",
      text: "text-pink-600",
    },
  ];

  const emojiOptions = [
    "📚",
    "📖",
    "📝",
    "🔬",
    "⚛️",
    "🧪",
    "📐",
    "🧬",
    "💻",
    "🎨",
    "🌍",
    "📊",
    "🎵",
    "💡",
    "🔭",
    "🧮",
  ];

  // Fetch sections and PDFs from API on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Notify parent when PDF view changes
  useEffect(() => {
    if (onPdfViewChange) {
      onPdfViewChange(!!selectedPdf);
    }
  }, [selectedPdf, onPdfViewChange]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [sectionsRes, pdfsRes] = await Promise.all([
        studyApi.getSections(),
        studyApi.getPdfs(),
      ]);
      
      if (sectionsRes.success) {
        setSections(sectionsRes.data);
      }
      if (pdfsRes.success) {
        setPdfs(pdfsRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch study data:", error);
      // Fallback to localStorage
      const savedSections = localStorage.getItem("sradha-study-sections");
      const savedPdfs = localStorage.getItem("sradha-study-pdfs");
      if (savedSections) setSections(JSON.parse(savedSections));
      if (savedPdfs) setPdfs(JSON.parse(savedPdfs));
    } finally {
      setIsLoading(false);
    }
  };

  const getColorClasses = (colorName) => {
    return colorOptions.find((c) => c.name === colorName) || colorOptions[0];
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!selectedSection || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setTotalFiles(files.length);
    setCurrentFileIndex(0);

    const sectionId = selectedSection._id || selectedSection.id;

    // Process files sequentially for proper progress tracking
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== "application/pdf") {
        alert(`${file.name} is not a PDF file!`);
        continue;
      }

      setCurrentFileIndex(i + 1);
      setUploadStatus(`Reading ${file.name}...`);
      setUploadProgress(0);

      // Read file as base64
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            const readProgress = Math.round((event.loaded / event.total) * 30); // 0-30% for reading
            setUploadProgress(readProgress);
          }
        };
        reader.readAsDataURL(file);
      });

      setUploadStatus(`Uploading ${file.name}...`);

      const pdfData = {
        name: file.name.replace(".pdf", ""),
        fileName: file.name,
        sectionId: sectionId,
        fileData: base64Data,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      };

      try {
        const response = await studyApi.uploadPdf(pdfData, (progress) => {
          // 30-100% for uploading
          setUploadProgress(30 + Math.round(progress * 0.7));
        });
        
        if (response.success) {
          setPdfs((prev) => [...prev, response.data]);
          setUploadStatus(`✓ ${file.name} uploaded!`);
        }
      } catch (error) {
        console.error("Failed to upload PDF:", error);
        setUploadStatus(`⚠️ ${file.name} - saving locally...`);
        // Fallback to local storage
        const newPdf = {
          id: Date.now() + i,
          ...pdfData,
          uploadedAt: new Date().toISOString(),
          lastReadAt: null,
          lastPage: 1,
          totalPages: null,
          isFavorite: false,
        };
        setPdfs((prev) => [...prev, newPdf]);
        localStorage.setItem("sradha-study-pdfs", JSON.stringify([...pdfs, newPdf]));
      }

      // Brief pause between files
      if (i < files.length - 1) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    setUploadStatus("All files uploaded! 🎉");
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatus("");
      setCurrentFileIndex(0);
      setTotalFiles(0);
    }, 1500);
  };

  const addSection = async () => {
    if (newSection.name.trim()) {
      try {
        const response = await studyApi.createSection({
          name: newSection.name.trim(),
          emoji: newSection.emoji,
          color: newSection.color,
        });
        if (response.success) {
          setSections([...sections, response.data]);
        }
      } catch (error) {
        console.error("Failed to create section:", error);
        // Fallback to local
        const section = {
          id: Date.now(),
          name: newSection.name.trim(),
          emoji: newSection.emoji,
          color: newSection.color,
        };
        setSections([...sections, section]);
        localStorage.setItem("sradha-study-sections", JSON.stringify([...sections, section]));
      }
      setNewSection({ name: "", emoji: "📚", color: "rose" });
      setIsAddingSection(false);
    }
  };

  // Open delete confirmation dialog for section
  const confirmDeleteSection = (section) => {
    setDeleteDialog({
      isOpen: true,
      type: "section",
      item: section,
    });
  };

  // Open delete confirmation dialog for PDF
  const confirmDeletePdf = (pdf) => {
    setDeleteDialog({
      isOpen: true,
      type: "pdf",
      item: pdf,
    });
  };

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (deleteDialog.type === "section") {
      const sectionId = deleteDialog.item._id || deleteDialog.item.id;
      try {
        await studyApi.deleteSection(sectionId);
      } catch (error) {
        console.error("Failed to delete section:", error);
      }
      setSections(sections.filter((s) => (s._id || s.id) !== sectionId));
      setPdfs(pdfs.filter((p) => p.sectionId !== sectionId));
      if (selectedSection && (selectedSection._id || selectedSection.id) === sectionId) {
        setSelectedSection(null);
      }
    } else if (deleteDialog.type === "pdf") {
      const pdfId = deleteDialog.item._id || deleteDialog.item.id;
      try {
        await studyApi.deletePdf(pdfId);
      } catch (error) {
        console.error("Failed to delete PDF:", error);
      }
      setPdfs(pdfs.filter((p) => (p._id || p.id) !== pdfId));
      if (selectedPdf && (selectedPdf._id || selectedPdf.id) === pdfId) {
        setSelectedPdf(null);
      }
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, type: null, item: null });
  };

  const toggleFavorite = async (pdfId) => {
    try {
      await studyApi.toggleFavorite(pdfId);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
    setPdfs(
      pdfs.map((p) =>
        (p._id === pdfId || p.id === pdfId) ? { ...p, isFavorite: !p.isFavorite } : p
      )
    );
  };

  const updatePdfProgress = async (pdfId, page, totalPages) => {
    try {
      await studyApi.updatePdf(pdfId, { lastPage: page, totalPages });
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
    setPdfs(
      pdfs.map((p) =>
        (p._id === pdfId || p.id === pdfId)
          ? {
              ...p,
              lastPage: page,
              totalPages,
              lastReadAt: new Date().toISOString(),
            }
          : p
      )
    );
  };

  const getSectionPdfs = (sectionId) => {
    return pdfs
      .filter((p) => {
        // Handle both string and ObjectId comparison
        const pSectionId = p.sectionId?._id || p.sectionId;
        return pSectionId === sectionId || String(pSectionId) === String(sectionId);
      })
      .filter(
        (p) =>
          !searchQuery || 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.fileName && p.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  };

  // Filter sections by search query
  const getFilteredSections = () => {
    if (!searchQuery) return sections;
    return sections.filter(
      (s) => s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Get all PDFs matching search query (for global search)
  const getSearchResults = () => {
    if (!searchQuery) return [];
    return pdfs.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.fileName && p.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  // Open PDF with full data (including fileData)
  const openPdf = async (pdf) => {
    const pdfId = pdf._id || pdf.id;
    
    // If we already have fileData, just open it
    if (pdf.fileData) {
      setSelectedPdf(pdf);
      return;
    }
    
    // Otherwise, fetch the full PDF from API
    try {
      const response = await studyApi.getPdf(pdfId);
      if (response.success) {
        setSelectedPdf(response.data);
      } else {
        console.error("Failed to fetch PDF data");
        setSelectedPdf(pdf); // Fallback to what we have
      }
    } catch (error) {
      console.error("Failed to fetch PDF:", error);
      setSelectedPdf(pdf); // Fallback
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // If viewing a PDF
  if (selectedPdf) {
    return (
      <PDFViewer
        pdf={selectedPdf}
        onClose={() => setSelectedPdf(null)}
        onProgressUpdate={updatePdfProgress}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="font-romantic text-4xl gradient-text mb-2">
            📚 Study Notes 📚
          </h2>
        </div>
        <div className="text-center py-16 glass rounded-3xl animate-fade-in">
          <span className="text-6xl block mb-4 animate-spin">💫</span>
          <h3 className="font-romantic text-2xl text-rose-400 mb-3">
            Loading your study materials...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 animate-fade-in">
        <h2 className="font-romantic text-2xl sm:text-4xl gradient-text mb-2">
          📚 Study Notes 📚
        </h2>
        <p className="font-sweet text-gray-500 text-sm sm:text-base">
          Organize and read your PDFs beautifully, Sradha! ✨
        </p>
      </div>

      {/* Search Bar */}
      <div className="glass rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 animate-slide-up">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className="flex-1 min-w-0 relative">
            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-lg sm:text-xl">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sections & PDFs..."
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl border-2 border-rose-100 font-sweet text-gray-700 bg-white/80 focus:border-rose-400 focus:outline-none text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 sm:p-3 rounded-xl transition-all text-sm sm:text-base ${
                viewMode === "grid"
                  ? "bg-rose-400 text-white"
                  : "bg-white/80 hover:bg-rose-50"
              }`}
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 sm:p-3 rounded-xl transition-all text-sm sm:text-base ${
                viewMode === "list"
                  ? "bg-rose-400 text-white"
                  : "bg-white/80 hover:bg-rose-50"
              }`}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && !selectedSection && getSearchResults().length > 0 && (
        <div className="glass rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 animate-fade-in">
          <h3 className="font-romantic text-lg sm:text-xl gradient-text mb-4">
            🔍 Search Results ({getSearchResults().length} PDFs found)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {getSearchResults().map((pdf) => {
              const section = sections.find(
                (s) => (s._id || s.id) === pdf.sectionId || String(s._id || s.id) === String(pdf.sectionId)
              );
              return (
                <div
                  key={pdf._id || pdf.id}
                  onClick={() => {
                    setSelectedSection(section);
                    openPdf(pdf);
                  }}
                  className="p-3 sm:p-4 bg-white/70 rounded-xl hover:bg-white/90 transition-all cursor-pointer flex items-center gap-3"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl sm:text-2xl">📄</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sweet text-gray-700 text-sm sm:text-base truncate font-semibold">
                      {pdf.name}
                    </p>
                    <p className="font-sweet text-gray-400 text-xs sm:text-sm">
                      {section?.emoji} {section?.name || "Unknown Section"}
                    </p>
                  </div>
                  {pdf.isFavorite && <span className="text-lg">⭐</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Section View */}
      {selectedSection ? (
        <div className="animate-fade-in">
          {/* Section Header */}
          <div className="glass rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => setSelectedSection(null)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-rose-100 hover:bg-rose-200 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  ←
                </button>
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl ${
                    getColorClasses(selectedSection.color).bg
                  } flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0`}
                >
                  {selectedSection.emoji}
                </div>
                <div className="min-w-0">
                  <h3 className="font-romantic text-lg sm:text-2xl text-gray-700 truncate">
                    {selectedSection.name}
                  </h3>
                  <p className="font-sweet text-gray-500 text-xs sm:text-sm">
                    {getSectionPdfs(selectedSection._id || selectedSection.id).length} PDFs
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="love-button text-white font-sweet px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                  <span>📤</span> Upload PDF
                </button>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4 glass rounded-xl p-4">
                {/* File counter */}
                {totalFiles > 1 && (
                  <p className="font-sweet text-xs text-gray-500 mb-2 text-center">
                    File {currentFileIndex} of {totalFiles}
                  </p>
                )}
                
                {/* Progress bar */}
                <div className="h-3 bg-rose-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 transition-all duration-300 relative"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
                  </div>
                </div>
                
                {/* Progress percentage */}
                <div className="flex justify-between items-center mt-2">
                  <p className="font-sweet text-sm text-rose-400">
                    {uploadStatus || `Uploading... ${Math.round(uploadProgress)}%`}
                  </p>
                  <span className="font-sweet text-sm font-semibold text-rose-500">
                    {Math.round(uploadProgress)}%
                  </span>
                </div>
                
                {/* Animated loading indicator */}
                <div className="flex justify-center gap-1 mt-3">
                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* PDFs Grid/List */}
          {getSectionPdfs(selectedSection._id || selectedSection.id).length === 0 ? (
            <div className="text-center py-10 sm:py-16 glass rounded-2xl sm:rounded-3xl animate-fade-in">
              <span className="text-4xl sm:text-6xl block mb-4">📄</span>
              <h3 className="font-romantic text-xl sm:text-2xl text-rose-400 mb-3">
                No PDFs yet!
              </h3>
              <p className="font-sweet text-gray-500 mb-6">
                Upload your first PDF to start studying! 📚
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="love-button text-white font-sweet px-8 py-4 rounded-xl"
              >
                📤 Upload Your First PDF
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {getSectionPdfs(selectedSection._id || selectedSection.id).map((pdf, index) => {
                const pdfId = pdf._id || pdf.id;
                return (
                <div
                  key={pdfId}
                  className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:scale-[1.02] transition-all cursor-pointer group animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => openPdf(pdf)}
                >
                  <div className="relative mb-3 sm:mb-4">
                    <div className="w-full h-24 sm:h-32 bg-gradient-to-br from-rose-100 to-pink-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <span className="text-4xl sm:text-5xl">📄</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(pdfId);
                      }}
                      className="absolute top-2 right-2 text-xl sm:text-2xl"
                    >
                      {pdf.isFavorite ? "⭐" : "☆"}
                    </button>
                    {pdf.lastPage > 1 && pdf.totalPages && (
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-sweet">
                        Page {pdf.lastPage}/{pdf.totalPages}
                      </div>
                    )}
                  </div>
                  <h4 className="font-sweet font-semibold text-gray-700 truncate text-sm sm:text-base">
                    {pdf.name}
                  </h4>
                  <p className="font-sweet text-gray-400 text-xs mt-1">
                    {pdf.size} • {formatDate(pdf.uploadedAt || pdf.createdAt)}
                  </p>
                  <div className="flex justify-between items-center mt-2 sm:mt-3">
                    <span className="text-xs text-rose-400 font-sweet">
                      {pdf.lastReadAt
                        ? `Last read: ${formatDate(pdf.lastReadAt)}`
                        : "Not read yet"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDeletePdf(pdf);
                      }}
                      className="sm:opacity-0 sm:group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all p-1"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
              })}
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {getSectionPdfs(selectedSection._id || selectedSection.id).map((pdf, index) => {
                const pdfId = pdf._id || pdf.id;
                return (
                <div
                  key={pdfId}
                  className="glass rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:scale-[1.01] transition-all cursor-pointer group animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => openPdf(pdf)}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl sm:text-2xl">📄</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-sweet font-semibold text-gray-700 truncate text-sm sm:text-base">
                      {pdf.name}
                    </h4>
                    <p className="font-sweet text-gray-400 text-xs">
                      {pdf.size} • {formatDate(pdf.uploadedAt || pdf.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {pdf.lastPage > 1 && pdf.totalPages && (
                      <span className="text-xs bg-rose-100 text-rose-500 px-2 py-1 rounded-full font-sweet">
                        {pdf.lastPage}/{pdf.totalPages}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(pdfId);
                      }}
                      className="text-xl"
                    >
                      {pdf.isFavorite ? "⭐" : "☆"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDeletePdf(pdf);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* No results message */}
          {searchQuery && getFilteredSections().length === 0 && getSearchResults().length === 0 && (
            <div className="text-center py-10 glass rounded-2xl mb-4 animate-fade-in">
              <span className="text-4xl block mb-3">🔍</span>
              <p className="font-sweet text-gray-500">
                No sections or PDFs found for "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 text-rose-400 font-sweet hover:underline"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Sections Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {getFilteredSections().map((section, index) => {
              const colorClasses = getColorClasses(section.color);
              const sectionId = section._id || section.id;
              const sectionPdfs = getSectionPdfs(sectionId);
              return (
                <div
                  key={sectionId}
                  className={`glass rounded-xl sm:rounded-2xl p-4 sm:p-5 cursor-pointer hover:scale-[1.02] sm:hover:scale-[1.03] transition-all group animate-scale-in border-2 ${colorClasses.border}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => setSelectedSection(section)}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${colorClasses.bg} flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-3`}
                    >
                      {section.emoji}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDeleteSection(section);
                      }}
                      className="sm:opacity-0 sm:group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all p-1"
                    >
                      🗑️
                    </button>
                  </div>
                  <h3
                    className={`font-sweet font-semibold ${colorClasses.text} text-base sm:text-lg truncate`}
                  >
                    {section.name}
                  </h3>
                  <p className="font-sweet text-gray-400 text-sm mt-1">
                    {sectionPdfs.length} PDF
                    {sectionPdfs.length !== 1 ? "s" : ""}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div
                      className={`h-1 flex-1 ${colorClasses.bg} rounded-full overflow-hidden`}
                    >
                      <div
                        className={`h-full bg-gradient-to-r from-${section.color}-400 to-${section.color}-500`}
                        style={{
                          width: sectionPdfs.length > 0 ? "100%" : "0%",
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">→</span>
                  </div>
                </div>
              );
            })}

            {/* Add Section Card */}
            {isAddingSection ? (
              <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-dashed border-rose-300 animate-scale-in">
                <input
                  type="text"
                  value={newSection.name}
                  onChange={(e) =>
                    setNewSection({ ...newSection, name: e.target.value })
                  }
                  placeholder="Section name..."
                  className="w-full p-2.5 sm:p-3 rounded-xl border-2 border-rose-100 font-sweet text-gray-700 bg-white/80 focus:border-rose-400 focus:outline-none mb-3 text-sm sm:text-base"
                  autoFocus
                />

                {/* Emoji Selection */}
                <div className="mb-3">
                  <p className="font-sweet text-xs text-gray-500 mb-2">
                    Pick an emoji:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setNewSection({ ...newSection, emoji })}
                        className={`text-lg sm:text-xl p-1 rounded-lg transition-all ${
                          newSection.emoji === emoji
                            ? "bg-rose-200 scale-110"
                            : "hover:bg-rose-50"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="mb-4">
                  <p className="font-sweet text-xs text-gray-500 mb-2">
                    Pick a color:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        onClick={() =>
                          setNewSection({ ...newSection, color: color.name })
                        }
                        className={`w-6 h-6 rounded-full ${color.bg} ${
                          color.border
                        } border-2 transition-all ${
                          newSection.color === color.name
                            ? "ring-2 ring-rose-400 scale-110"
                            : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={addSection}
                    className="flex-1 bg-green-400 hover:bg-green-500 text-white font-sweet py-2 rounded-xl transition-colors text-sm sm:text-base"
                  >
                    ✓ Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingSection(false);
                      setNewSection({ name: "", emoji: "📚", color: "rose" });
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-sweet py-2 rounded-xl transition-colors text-sm sm:text-base"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingSection(true)}
                className="glass rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-dashed border-rose-200 hover:border-rose-400 hover:bg-rose-50/50 transition-all flex flex-col items-center justify-center min-h-[140px] sm:min-h-[180px] group"
              >
                <span className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform">
                  ➕
                </span>
                <span className="font-sweet text-rose-400">
                  Add New Section
                </span>
              </button>
            )}
          </div>

          {/* Recent PDFs */}
          {pdfs.length > 0 && (
            <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-slide-up">
              <h3 className="font-romantic text-lg sm:text-xl gradient-text mb-3 sm:mb-4">
                ✨ Recently Added
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {pdfs
                  .sort(
                    (a, b) => new Date(b.uploadedAt || b.createdAt) - new Date(a.uploadedAt || a.createdAt)
                  )
                  .slice(0, 4)
                  .map((pdf) => {
                    const section = sections.find(
                      (s) => (s._id || s.id) === pdf.sectionId || String(s._id || s.id) === String(pdf.sectionId)
                    );
                    return (
                      <div
                        key={pdf._id || pdf.id}
                        onClick={() => {
                          setSelectedSection(section);
                          openPdf(pdf);
                        }}
                        className="p-2.5 sm:p-3 bg-white/50 rounded-xl hover:bg-white/80 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xl sm:text-2xl">📄</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-sweet text-gray-700 text-xs sm:text-sm truncate">
                              {pdf.name}
                            </p>
                            <p className="font-sweet text-gray-400 text-xs truncate">
                              {section?.emoji} {section?.name || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Favorites */}
          {pdfs.filter((p) => p.isFavorite).length > 0 && (
            <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-4 sm:mt-6 animate-slide-up">
              <h3 className="font-romantic text-lg sm:text-xl gradient-text mb-3 sm:mb-4">
                ⭐ Favorite PDFs
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {pdfs
                  .filter((p) => p.isFavorite)
                  .map((pdf) => {
                    const section = sections.find(
                      (s) => (s._id || s.id) === pdf.sectionId || String(s._id || s.id) === String(pdf.sectionId)
                    );
                    return (
                      <div
                        key={pdf._id || pdf.id}
                        onClick={() => {
                          setSelectedSection(section);
                          openPdf(pdf);
                        }}
                        className="p-2.5 sm:p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl hover:scale-[1.02] transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xl sm:text-2xl">📄</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-sweet text-gray-700 text-xs sm:text-sm truncate">
                              {pdf.name}
                            </p>
                            <p className="font-sweet text-gray-400 text-xs truncate">
                              {section?.emoji} {section?.name || "Unknown"}
                            </p>
                          </div>
                          <span className="text-lg sm:text-xl">⭐</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Beautiful Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={
          deleteDialog.type === "section"
            ? `Delete "${deleteDialog.item?.name}"?`
            : `Delete "${deleteDialog.item?.name}"?`
        }
        message={
          deleteDialog.type === "section"
            ? "This will permanently delete this section and all its PDFs. This action cannot be undone! 💔"
            : "This PDF will be removed from your study notes. You can always upload it again later! 📄"
        }
        confirmText={
          deleteDialog.type === "section" ? "Delete Section" : "Delete PDF"
        }
        cancelText="Keep it! 💕"
        type="danger"
        emoji={deleteDialog.type === "section" ? "📁" : "📄"}
      />
    </div>
  );
};

export default StudyNotes;
