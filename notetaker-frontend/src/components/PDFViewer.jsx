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
  const [visiblePages, setVisiblePages] = useState([1]); // Only render visible pages (virtualization)

  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const pageRefs = useRef({});
  const isScrollingRef = useRef(false);
  const estimatedPageHeight = useRef(800); // Estimated height for placeholder

  const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

  // Number of pages to render around current page (for smooth scrolling)
  const BUFFER_PAGES = isMobile ? 1 : 2;

  // Detect mobile/desktop and calculate page width
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (scrollContainerRef.current) {
        const containerWidth = scrollContainerRef.current.clientWidth;
        setPageWidth(mobile ? containerWidth : containerWidth - 64);
      }
    };

    setTimeout(handleResize, 100);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update visible pages based on current page (virtualization)
  useEffect(() => {
    const start = Math.max(1, currentPage - BUFFER_PAGES);
    const end = Math.min(totalPages, currentPage + BUFFER_PAGES);
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    setVisiblePages(pages);
  }, [currentPage, totalPages, BUFFER_PAGES]);

  // Track scroll position to determine current page
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || totalPages <= 1) return;

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollTop = container.scrollTop;
      const pageHeight = estimatedPageHeight.current * zoom;
      const newPage = Math.max(
        1,
        Math.min(totalPages, Math.floor(scrollTop / pageHeight) + 1)
      );

      if (newPage !== currentPage) {
        setCurrentPage(newPage);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [totalPages, currentPage, zoom]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
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
  }, []);

  // Save progress when page changes
  useEffect(() => {
    if (pdf?._id || pdf?.id) {
      onProgressUpdate(pdf._id || pdf.id, currentPage, totalPages);
    }
  }, [currentPage, totalPages, pdf?._id, pdf?.id]);

  // Scroll to last read page on initial load
  useEffect(() => {
    if (!isLoading && pdf.lastPage > 1) {
      setTimeout(() => {
        scrollToPage(pdf.lastPage);
      }, 300);
    }
  }, [isLoading, pdf.lastPage]);

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

  const onPageLoadSuccess = (page) => {
    // Update estimated page height based on actual rendered page
    if (page.height) {
      estimatedPageHeight.current = page.height;
    }
  };

  const scrollToPage = useCallback(
    (pageNum) => {
      if (scrollContainerRef.current) {
        isScrollingRef.current = true;
        const pageHeight = estimatedPageHeight.current * zoom;
        const scrollPosition = (pageNum - 1) * pageHeight;
        scrollContainerRef.current.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
        setCurrentPage(pageNum);
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 500);
      }
    },
    [zoom]
  );

  const goToPage = (page) => {
    const pageNum = parseInt(page);
    if (pageNum >= 1 && pageNum <= totalPages) {
      scrollToPage(pageNum);
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

  const getPdfSource = () => {
    const data = pdf.fileData || pdf.data;
    if (!data) return null;
    return data;
  };

  // Calculate total scroll height for virtualization
  const getTotalHeight = () => {
    return totalPages * estimatedPageHeight.current * zoom;
  };

  // Get top offset for a page
  const getPageOffset = (pageNum) => {
    return (pageNum - 1) * estimatedPageHeight.current * zoom;
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

          {/* Center Section - Page Navigation */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
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
              onClick={() =>
                scrollToPage(Math.min(totalPages, currentPage + 1))
              }
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
        <div className={`h-1.5 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-pink-400 transition-all duration-300"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      {/* Main Content Area - Virtualized Scrolling PDF */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-auto ${
          isDarkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
        style={{
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
        }}
      >
        {isLoading && !loadError && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
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
            className="flex flex-col items-center"
          >
            {/* Virtualized container with total height */}
            <div
              style={{
                height: getTotalHeight(),
                position: "relative",
                width: "100%",
              }}
            >
              {/* Only render visible pages + buffer */}
              {visiblePages.map((pageNum) => (
                <div
                  key={pageNum}
                  ref={(el) => (pageRefs.current[pageNum] = el)}
                  className={`absolute left-0 right-0 flex justify-center ${
                    isMobile ? "" : "px-4"
                  }`}
                  style={{
                    top: getPageOffset(pageNum),
                    height: estimatedPageHeight.current * zoom,
                  }}
                >
                  <div className="relative">
                    {/* Page number indicator */}
                    <div
                      className={`absolute top-2 left-2 z-10 px-2 py-1 rounded-lg text-xs font-sweet ${
                        isDarkMode
                          ? "bg-gray-800/90 text-gray-300"
                          : "bg-white/90 text-gray-600 shadow-sm"
                      } ${isMobile ? "text-[10px] px-1.5 py-0.5" : ""}`}
                    >
                      {pageNum} / {totalPages}
                    </div>

                    <Page
                      pageNumber={pageNum}
                      width={pageWidth ? pageWidth * zoom : undefined}
                      className={`${
                        isMobile ? "" : "shadow-xl rounded-lg"
                      } overflow-hidden`}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      onLoadSuccess={onPageLoadSuccess}
                      loading={
                        <div
                          className={`flex items-center justify-center bg-white ${
                            isMobile
                              ? "h-[70vh] w-full"
                              : "h-[700px] w-[500px] rounded-lg shadow-xl"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-400 rounded-full animate-spin" />
                            <span className="font-sweet text-gray-400 text-sm">
                              Page {pageNum}...
                            </span>
                          </div>
                        </div>
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* End of document indicator */}
            <div
              className={`py-8 text-center ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
              style={{ marginTop: getTotalHeight() }}
            >
              <span className="text-3xl mb-2 block">📚</span>
              <p className="font-sweet text-sm">End of Document</p>
              <p className="font-sweet text-xs mt-1">
                {totalPages} pages • {pdf.name}
              </p>
            </div>
          </Document>
        )}
      </div>

      {/* Floating Page Indicator */}
      <div
        className={`fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-lg font-sweet text-sm z-20 ${
          isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-700"
        }`}
      >
        📄 {currentPage} / {totalPages} • {getProgress()}%
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
            onClick={() => scrollToPage(1)}
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
                  ? Math.min(5, totalPages)
                  : Math.min(7, totalPages),
              },
              (_, i) => {
                let page;
                const visiblePages = isMobile ? 5 : 7;
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
                    onClick={() => scrollToPage(page)}
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
            onClick={() => scrollToPage(totalPages)}
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
      </div>
    </div>
  );
};

export default PDFViewer;
