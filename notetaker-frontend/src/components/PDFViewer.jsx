import React, { useState, useRef, useEffect, useCallback } from "react";

const PDFViewer = ({ pdf, onClose, onProgressUpdate }) => {
  const [currentPage, setCurrentPage] = useState(pdf.lastPage || 1);
  const [totalPages, setTotalPages] = useState(pdf.totalPages || 1);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [showMobileZoom, setShowMobileZoom] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

  // Detect mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showNoteInput || showSearch) return;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case " ":
          e.preventDefault();
          goToNextPage();
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          goToPrevPage();
          break;
        case "Escape":
          if (isFullscreen) {
            toggleFullscreen();
          } else {
            onClose();
          }
          break;
        case "+":
        case "=":
          if (e.ctrlKey) {
            e.preventDefault();
            zoomIn();
          }
          break;
        case "-":
          if (e.ctrlKey) {
            e.preventDefault();
            zoomOut();
          }
          break;
        case "f":
          if (e.ctrlKey) {
            e.preventDefault();
            setShowSearch(true);
          }
          break;
        case "r":
          if (e.ctrlKey) {
            e.preventDefault();
            rotate();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, isFullscreen, showNoteInput, showSearch]);

  // Save progress when page changes
  useEffect(() => {
    if (pdf?.id) {
      onProgressUpdate(pdf.id, currentPage, totalPages);
    }
  }, [currentPage, totalPages, pdf?.id]);

  // Simulate loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [pdf]);

  // Auto-hide toolbar
  useEffect(() => {
    let timer;
    const handleMouseMove = () => {
      setShowToolbar(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (isFullscreen) setShowToolbar(false);
      }, 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timer);
    };
  }, [isFullscreen]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const goToPage = (page) => {
    const pageNum = parseInt(page);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const zoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex < zoomLevels.length - 1) {
      setZoom(zoomLevels[currentIndex + 1]);
    }
  };

  const zoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(zoomLevels[currentIndex - 1]);
    }
  };

  const fitToWidth = () => setZoom(1);
  const fitToPage = () => setZoom(0.75);

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const addBookmark = () => {
    if (!bookmarks.includes(currentPage)) {
      setBookmarks([...bookmarks, currentPage].sort((a, b) => a - b));
    }
  };

  const removeBookmark = (page) => {
    setBookmarks(bookmarks.filter((b) => b !== page));
  };

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([
        ...notes,
        { page: currentPage, text: newNote, createdAt: new Date() },
      ]);
      setNewNote("");
      setShowNoteInput(false);
    }
  };

  const getProgress = () => {
    return ((currentPage / totalPages) * 100).toFixed(0);
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* Top Toolbar */}
      <div
        className={`${
          showToolbar ? "translate-y-0" : "-translate-y-full"
        } transition-transform duration-300 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-b shadow-lg z-10`}
      >
        <div className="flex items-center justify-between px-2 sm:px-4 py-2">
          {/* Left Section - Back Button */}
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={onClose}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-all font-sweet ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-rose-100 hover:bg-rose-200 text-rose-600"
              }`}
              title="Close (Esc)"
            >
              <span className="text-lg">←</span>
              <span className="text-sm font-medium hidden sm:inline">Back</span>
            </button>
            <div className="hidden md:block">
              <h3
                className={`font-sweet font-semibold truncate max-w-[200px] ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {pdf.name}
              </h3>
            </div>
          </div>

          {/* Center Section - Navigation */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className={`p-2 sm:p-3 rounded-lg transition-all disabled:opacity-30 text-lg sm:text-xl ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-rose-50 text-gray-600"
              }`}
              title="Previous Page (←)"
            >
              ◀
            </button>

            <div className="flex items-center gap-1 sm:gap-2">
              <input
                type="number"
                value={currentPage}
                onChange={(e) => goToPage(e.target.value)}
                className={`w-10 sm:w-14 text-center py-1 px-1 sm:px-2 rounded-lg border font-sweet text-sm sm:text-base ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-200 text-gray-700"
                }`}
                min={1}
                max={totalPages}
              />
              <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                /
              </span>
              <span
                className={`font-sweet text-sm sm:text-base ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {totalPages}
              </span>
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
              className={`p-2 sm:p-3 rounded-lg transition-all disabled:opacity-30 text-lg sm:text-xl ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-rose-50 text-gray-600"
              }`}
              title="Next Page (→)"
            >
              ▶
            </button>
          </div>

          {/* Right Section - Tools */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Mobile Zoom Button */}
            <button
              onClick={() => setShowMobileZoom(!showMobileZoom)}
              className={`p-2 rounded-lg transition-all md:hidden ${
                showMobileZoom
                  ? "bg-rose-400 text-white"
                  : isDarkMode
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-rose-50 text-gray-600"
              }`}
              title="Zoom"
            >
              🔍
            </button>

            {/* Desktop Zoom Controls */}
            <div className="hidden md:flex items-center gap-1 mr-2">
              <button
                onClick={zoomOut}
                className={`p-2 rounded-lg transition-all ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-rose-50 text-gray-600"
                }`}
                title="Zoom Out (Ctrl+-)"
              >
                🔍−
              </button>
              <select
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className={`py-1 px-2 rounded-lg border font-sweet text-sm ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-200 text-gray-700"
                }`}
              >
                {zoomLevels.map((level) => (
                  <option key={level} value={level}>
                    {Math.round(level * 100)}%
                  </option>
                ))}
              </select>
              <button
                onClick={zoomIn}
                className={`p-2 rounded-lg transition-all ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-rose-50 text-gray-600"
                }`}
                title="Zoom In (Ctrl++)"
              >
                🔍+
              </button>
            </div>

            {/* Thumbnails - Hidden on very small screens */}
            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className={`p-2 rounded-lg transition-all hidden sm:block ${
                showThumbnails
                  ? "bg-rose-400 text-white"
                  : isDarkMode
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-rose-50 text-gray-600"
              }`}
              title="Thumbnails"
            >
              ⊞
            </button>

            <button
              onClick={rotate}
              className={`p-2 rounded-lg transition-all hidden sm:block ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-rose-50 text-gray-600"
              }`}
              title="Rotate (Ctrl+R)"
            >
              🔄
            </button>

            <button
              onClick={addBookmark}
              className={`p-2 rounded-lg transition-all hidden sm:block ${
                bookmarks.includes(currentPage)
                  ? "text-yellow-500"
                  : isDarkMode
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-rose-50 text-gray-600"
              }`}
              title="Add Bookmark"
            >
              {bookmarks.includes(currentPage) ? "🔖" : "📑"}
            </button>

            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className={`p-2 rounded-lg transition-all hidden sm:block ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-rose-50 text-gray-600"
              }`}
              title="Add Note"
            >
              📝
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-all ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-rose-50 text-gray-600"
              }`}
              title="Toggle Dark Mode"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>

            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-lg transition-all hidden sm:block ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-rose-50 text-gray-600"
              }`}
              title="Fullscreen"
            >
              {isFullscreen ? "⛶" : "⛶"}
            </button>
          </div>
        </div>

        {/* Mobile Zoom Panel */}
        {showMobileZoom && isMobile && (
          <div className={`flex items-center justify-center gap-3 py-3 border-t ${
            isDarkMode ? "bg-gray-750 border-gray-700" : "bg-gray-50 border-gray-200"
          }`}>
            <button
              onClick={zoomOut}
              className={`p-3 rounded-xl transition-all text-xl ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-white hover:bg-rose-50 text-gray-600 shadow"
              }`}
            >
              ➖
            </button>
            <div className={`px-4 py-2 rounded-xl font-sweet font-bold text-lg min-w-[80px] text-center ${
              isDarkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-700 shadow"
            }`}>
              {Math.round(zoom * 100)}%
            </div>
            <button
              onClick={zoomIn}
              className={`p-3 rounded-xl transition-all text-xl ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-white hover:bg-rose-50 text-gray-600 shadow"
              }`}
            >
              ➕
            </button>
            <button
              onClick={fitToWidth}
              className={`px-3 py-2 rounded-xl transition-all text-sm font-sweet ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-white hover:bg-rose-50 text-gray-600 shadow"
              }`}
            >
              Fit
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className={`h-1.5 sm:h-1 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-pink-400 transition-all duration-300"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Thumbnails/Bookmarks - Hidden on mobile */}
        {showThumbnails && !isMobile && (
          <div
            className={`w-64 flex-shrink-0 overflow-y-auto border-r ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            {/* Tabs */}
            <div
              className={`flex border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                className={`flex-1 py-3 font-sweet text-sm ${
                  isDarkMode ? "text-rose-400" : "text-rose-500"
                } border-b-2 border-rose-400`}
              >
                📄 Pages
              </button>
              <button
                className={`flex-1 py-3 font-sweet text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                🔖 Bookmarks ({bookmarks.length})
              </button>
            </div>

            {/* Page Thumbnails */}
            <div className="p-3 space-y-2">
              {Array.from(
                { length: Math.min(totalPages, 20) },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    currentPage === page
                      ? "bg-rose-100 border-2 border-rose-400"
                      : isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-14 rounded flex items-center justify-center text-xl ${
                        isDarkMode ? "bg-gray-600" : "bg-white"
                      }`}
                    >
                      📄
                    </div>
                    <div>
                      <p
                        className={`font-sweet text-sm ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Page {page}
                      </p>
                      {bookmarks.includes(page) && (
                        <span className="text-xs text-yellow-500">
                          🔖 Bookmarked
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {totalPages > 20 && (
                <p
                  className={`text-center font-sweet text-sm py-2 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  ... and {totalPages - 20} more pages
                </p>
              )}
            </div>
          </div>
        )}

        {/* PDF View Area */}
        <div className="flex-1 relative overflow-auto flex items-start sm:items-center justify-center p-0 sm:p-4">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-400 rounded-full animate-spin" />
              <p
                className={`font-sweet ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Loading your PDF... 📚
              </p>
            </div>
          ) : (
            <div
              className="relative transition-transform duration-300 w-full sm:w-auto"
              style={{
                transform: isMobile ? `scale(${zoom})` : `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "top center",
              }}
            >
              {/* PDF Content - Using iframe for base64 PDF */}
              <div
                className={`shadow-none sm:shadow-2xl sm:rounded-lg overflow-hidden ${
                  isDarkMode ? "bg-gray-700" : "bg-white"
                }`}
                style={{
                  width: isMobile ? "100%" : "min(800px, 90vw)",
                  height: isMobile ? "calc(100vh - 140px)" : "min(1000px, 75vh)",
                }}
              >
                <iframe
                  ref={iframeRef}
                  src={`${pdf.fileData || pdf.data}#page=${currentPage}`}
                  className="w-full h-full border-0"
                  title={pdf.name}
                  style={{ minHeight: isMobile ? "calc(100vh - 140px)" : "auto" }}
                />
              </div>

              {/* Page Number Indicator - Adjusted for mobile */}
              <div
                className={`absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-sweet text-xs sm:text-sm ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-200"
                    : "bg-white/90 text-gray-600 shadow-lg"
                }`}
              >
                📄 {currentPage} / {totalPages}
              </div>
            </div>
          )}

          {/* Note Input Popup */}
          {showNoteInput && (
            <div className="absolute top-4 right-4 w-72 glass rounded-2xl p-4 shadow-2xl z-20 animate-scale-in">
              <h4 className="font-sweet font-semibold text-gray-700 mb-2">
                📝 Add Note for Page {currentPage}
              </h4>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write your note here..."
                className="w-full p-3 rounded-xl border-2 border-rose-100 font-sweet text-gray-700 resize-none focus:border-rose-400 focus:outline-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={addNote}
                  className="flex-1 bg-rose-400 hover:bg-rose-500 text-white font-sweet py-2 rounded-xl transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowNoteInput(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-sweet py-2 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Notes List */}
          {notes.filter((n) => n.page === currentPage).length > 0 && (
            <div className="absolute top-4 left-4 w-64 max-h-48 overflow-y-auto glass rounded-2xl p-3 z-10">
              <h4 className="font-sweet font-semibold text-gray-700 mb-2 text-sm">
                📝 Notes on this page
              </h4>
              {notes
                .filter((n) => n.page === currentPage)
                .map((note, index) => (
                  <div
                    key={index}
                    className="bg-yellow-50 p-2 rounded-lg mb-2 border border-yellow-200"
                  >
                    <p className="font-sweet text-gray-700 text-sm">
                      {note.text}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Quick Navigation */}
      <div
        className={`${
          showToolbar ? "translate-y-0" : "translate-y-full"
        } transition-transform duration-300 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-t py-2 sm:py-2 px-2 sm:px-4`}
      >
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={`font-sweet text-xs sm:text-sm disabled:opacity-30 px-2 py-1.5 rounded-lg ${
              isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            ⏮ <span className="hidden sm:inline">First</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Quick page buttons - fewer on mobile */}
            {Array.from({ length: isMobile ? Math.min(3, totalPages) : Math.min(5, totalPages) }, (_, i) => {
              let page;
              const visiblePages = isMobile ? 3 : 5;
              if (totalPages <= visiblePages) {
                page = i + 1;
              } else if (currentPage <= Math.ceil(visiblePages / 2)) {
                page = i + 1;
              } else if (currentPage >= totalPages - Math.floor(visiblePages / 2)) {
                page = totalPages - visiblePages + 1 + i;
              } else {
                page = currentPage - Math.floor(visiblePages / 2) + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg font-sweet text-sm transition-all ${
                    currentPage === page
                      ? "bg-rose-400 text-white shadow-md"
                      : isDarkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className={`font-sweet text-xs sm:text-sm disabled:opacity-30 px-2 py-1.5 rounded-lg ${
              isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="hidden sm:inline">Last</span> ⏭
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Help - Hidden on mobile */}
      <div
        className={`absolute bottom-16 right-4 text-xs font-sweet hidden lg:block ${
          isDarkMode ? "text-gray-500" : "text-gray-400"
        }`}
      >
        ← → Navigate • Ctrl+/- Zoom • Ctrl+R Rotate • Esc Close
      </div>

      {/* Mobile Swipe Hint - Show only on first view */}
      {isMobile && !isLoading && (
        <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 text-xs font-sweet px-3 py-1.5 rounded-full animate-pulse ${
          isDarkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"
        }`}>
          💡 Use zoom 🔍 to read better
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
