import React, { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFViewer = ({ pdf, onClose, onProgressUpdate }) => {
  const [currentPage, setCurrentPage] = useState(pdf.lastPage || 1);
  const [totalPages, setTotalPages] = useState(pdf.totalPages || 1);
  const [zoom, setZoom] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileZoom, setShowMobileZoom] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [pageWidth, setPageWidth] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const containerRef = useRef(null);
  const pageContainerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const lastScrollY = useRef(0);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const wheelAccumulator = useRef(0);

  const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

  // Detect mobile/desktop and calculate page width
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (pageContainerRef.current) {
        const containerWidth = pageContainerRef.current.clientWidth;
        // On mobile, use full width with minimal padding
        setPageWidth(mobile ? containerWidth : containerWidth - 32);
      }
    };
    
    // Initial calculation after a small delay to ensure container is rendered
    setTimeout(handleResize, 100);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle scroll to change pages
  useEffect(() => {
    const container = pageContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      // Determine scroll direction
      const scrollingDown = scrollTop > lastScrollY.current;
      lastScrollY.current = scrollTop;

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Check if we've scrolled to the bottom (go to next page)
      if (scrollingDown && scrollTop + clientHeight >= scrollHeight - 50) {
        if (currentPage < totalPages && !isScrolling) {
          setIsScrolling(true);
          scrollTimeoutRef.current = setTimeout(() => {
            setCurrentPage(prev => Math.min(prev + 1, totalPages));
            container.scrollTop = 0;
            setIsScrolling(false);
          }, 150);
        }
      }
      
      // Check if we've scrolled to the top (go to previous page)
      if (!scrollingDown && scrollTop <= 10) {
        if (currentPage > 1 && !isScrolling) {
          setIsScrolling(true);
          scrollTimeoutRef.current = setTimeout(() => {
            setCurrentPage(prev => Math.max(prev - 1, 1));
            // Scroll to bottom of previous page
            setTimeout(() => {
              container.scrollTop = container.scrollHeight;
            }, 100);
            setIsScrolling(false);
          }, 150);
        }
      }
    };

    // Handle wheel event for page navigation when content doesn't scroll
    const handleWheel = (e) => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const canScroll = scrollHeight > clientHeight + 10;

      // If content can scroll normally, let it scroll
      if (canScroll) {
        const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
        const atTop = scrollTop <= 10;
        
        // Only handle page change at boundaries
        if (e.deltaY > 0 && atBottom && currentPage < totalPages && !isScrolling) {
          e.preventDefault();
          setIsScrolling(true);
          setCurrentPage(prev => Math.min(prev + 1, totalPages));
          container.scrollTop = 0;
          setTimeout(() => setIsScrolling(false), 300);
        } else if (e.deltaY < 0 && atTop && currentPage > 1 && !isScrolling) {
          e.preventDefault();
          setIsScrolling(true);
          setCurrentPage(prev => Math.max(prev - 1, 1));
          setTimeout(() => setIsScrolling(false), 300);
        }
        return;
      }

      // If content fits on screen, use wheel to change pages
      if (!isScrolling) {
        wheelAccumulator.current += e.deltaY;
        
        // Need accumulated scroll to trigger page change (prevents accidental swipes)
        if (Math.abs(wheelAccumulator.current) > 100) {
          if (wheelAccumulator.current > 0 && currentPage < totalPages) {
            setIsScrolling(true);
            setCurrentPage(prev => Math.min(prev + 1, totalPages));
            setTimeout(() => setIsScrolling(false), 300);
          } else if (wheelAccumulator.current < 0 && currentPage > 1) {
            setIsScrolling(true);
            setCurrentPage(prev => Math.max(prev - 1, 1));
            setTimeout(() => setIsScrolling(false), 300);
          }
          wheelAccumulator.current = 0;
        }
        
        // Reset accumulator after a pause
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          wheelAccumulator.current = 0;
        }, 200);
      }
    };

    // Touch events for swipe navigation on mobile
    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      touchEndY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      const swipeDistance = touchStartY.current - touchEndY.current;
      const minSwipeDistance = 80; // Minimum swipe distance to trigger page change

      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const canScroll = scrollHeight > clientHeight + 10;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
      const atTop = scrollTop <= 10;

      if (Math.abs(swipeDistance) > minSwipeDistance && !isScrolling) {
        // Swipe up (next page) - only if at bottom or can't scroll
        if (swipeDistance > 0 && currentPage < totalPages && (!canScroll || atBottom)) {
          setIsScrolling(true);
          setCurrentPage(prev => Math.min(prev + 1, totalPages));
          container.scrollTop = 0;
          setTimeout(() => setIsScrolling(false), 300);
        }
        // Swipe down (previous page) - only if at top or can't scroll
        else if (swipeDistance < 0 && currentPage > 1 && (!canScroll || atTop)) {
          setIsScrolling(true);
          setCurrentPage(prev => Math.max(prev - 1, 1));
          setTimeout(() => setIsScrolling(false), 300);
        }
      }
      
      touchStartY.current = 0;
      touchEndY.current = 0;
    };

    container.addEventListener("scroll", handleScroll);
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);
    container.addEventListener("touchend", handleTouchEnd);
    
    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentPage, totalPages, isScrolling]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
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
          onClose();
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
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages]);

  // Save progress when page changes
  useEffect(() => {
    if (pdf?.id) {
      onProgressUpdate(pdf.id, currentPage, totalPages);
    }
  }, [currentPage, totalPages, pdf?.id]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setTotalPages(numPages);
    setIsLoading(false);
    setLoadError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error("PDF Load Error:", error);
    setLoadError("Failed to load PDF");
    setIsLoading(false);
  };

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      // Scroll to top of page
      if (pageContainerRef.current) {
        pageContainerRef.current.scrollTop = 0;
      }
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // Scroll to top of page
      if (pageContainerRef.current) {
        pageContainerRef.current.scrollTop = 0;
      }
    }
  }, [currentPage]);

  const goToPage = (page) => {
    const pageNum = parseInt(page);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      // Scroll to top of page
      if (pageContainerRef.current) {
        pageContainerRef.current.scrollTop = 0;
      }
    }
  };

  const zoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex < zoomLevels.length - 1) {
      setZoom(zoomLevels[currentIndex + 1]);
    } else if (zoom < 3) {
      setZoom(Math.min(zoom + 0.25, 3));
    }
  };

  const zoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(zoomLevels[currentIndex - 1]);
    } else if (zoom > 0.5) {
      setZoom(Math.max(zoom - 0.25, 0.5));
    }
  };

  const fitToWidth = () => setZoom(1);

  const getProgress = () => {
    return ((currentPage / totalPages) * 100).toFixed(0);
  };

  // Get the PDF source (handle both base64 and URL)
  const getPdfSource = () => {
    const data = pdf.fileData || pdf.data;
    if (!data) return null;
    return data;
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
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-b shadow-lg z-10 flex-shrink-0`}
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
              title="Previous Page"
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
              <span
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
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
              title="Next Page"
            >
              ▶
            </button>
          </div>

          {/* Right Section - Tools */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Zoom Button */}
            <button
              onClick={() => setShowMobileZoom(!showMobileZoom)}
              className={`p-2 rounded-lg transition-all ${
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
                title="Zoom Out"
              >
                ➖
              </button>
              <span
                className={`px-2 font-sweet text-sm min-w-[50px] text-center ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className={`p-2 rounded-lg transition-all ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-rose-50 text-gray-600"
                }`}
                title="Zoom In"
              >
                ➕
              </button>
            </div>

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
          </div>
        </div>

        {/* Mobile Zoom Panel */}
        {showMobileZoom && (
          <div
            className={`flex items-center justify-center gap-3 py-3 border-t ${
              isDarkMode
                ? "bg-gray-750 border-gray-700"
                : "bg-gray-50 border-gray-200"
            }`}
          >
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
            <div
              className={`px-4 py-2 rounded-xl font-sweet font-bold text-lg min-w-[80px] text-center ${
                isDarkMode
                  ? "bg-gray-700 text-gray-200"
                  : "bg-white text-gray-700 shadow"
              }`}
            >
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
              Reset
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div
          className={`h-1.5 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}
        >
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-pink-400 transition-all duration-300"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      {/* Main Content Area - PDF */}
      <div
        ref={pageContainerRef}
        className={`flex-1 overflow-auto ${
          isDarkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <div className="flex justify-center py-0 sm:py-4 min-h-full">
          {isLoading && !loadError && (
            <div className="flex flex-col items-center justify-center gap-4 py-20 absolute inset-0 z-10">
              <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-400 rounded-full animate-spin" />
              <p
                className={`font-sweet ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Loading your PDF... 📚
              </p>
            </div>
          )}

          {loadError && (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <span className="text-6xl">😿</span>
              <p
                className={`font-sweet text-lg ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {loadError}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-rose-400 hover:bg-rose-500 text-white rounded-xl font-sweet transition-colors"
              >
                Go Back
              </button>
            </div>
          )}

          {!loadError && (
            <Document
              file={getPdfSource()}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
              error=""
              className={`flex flex-col items-center ${isMobile ? 'w-full' : ''}`}
            >
              <Page
                pageNumber={currentPage}
                width={pageWidth ? pageWidth * zoom : undefined}
                className={`${isMobile ? 'w-full' : 'shadow-2xl rounded-lg'} overflow-hidden`}
                renderTextLayer={!isMobile}
                renderAnnotationLayer={!isMobile}
                loading={
                  <div className="flex items-center justify-center p-20 bg-white rounded-lg shadow-2xl">
                    <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-400 rounded-full animate-spin" />
                  </div>
                }
              />
            </Document>
          )}
        </div>
      </div>

      {/* Bottom Quick Navigation */}
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-t py-2 px-2 sm:px-4 flex-shrink-0`}
      >
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={`font-sweet text-xs sm:text-sm disabled:opacity-30 px-2 py-1.5 rounded-lg ${
              isDarkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            ⏮ <span className="hidden sm:inline">First</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Quick page buttons */}
            {Array.from(
              {
                length: isMobile
                  ? Math.min(3, totalPages)
                  : Math.min(5, totalPages),
              },
              (_, i) => {
                let page;
                const visiblePages = isMobile ? 3 : 5;
                if (totalPages <= visiblePages) {
                  page = i + 1;
                } else if (currentPage <= Math.ceil(visiblePages / 2)) {
                  page = i + 1;
                } else if (
                  currentPage >=
                  totalPages - Math.floor(visiblePages / 2)
                ) {
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
              }
            )}
          </div>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className={`font-sweet text-xs sm:text-sm disabled:opacity-30 px-2 py-1.5 rounded-lg ${
              isDarkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="hidden sm:inline">Last</span> ⏭
          </button>
        </div>

        {/* Page indicator */}
        <div
          className={`text-center mt-1 font-sweet text-xs ${
            isDarkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          📄 Page {currentPage} of {totalPages} • {getProgress()}% complete
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
