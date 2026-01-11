import React, { useState, useEffect } from "react";
import { notesApi, authApi } from "./services/api";
import Login from "./components/Login";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import NoteInput from "./components/NoteInput";
import NotesList from "./components/NotesList";
import FloatingHearts from "./components/FloatingHearts";
import CatGallery from "./components/CatGallery";
import LoveMessage from "./components/LoveMessage";
import MoodTracker from "./components/MoodTracker";
import LoveLetters from "./components/LoveLetters";
import Memories from "./components/Memories";
import TodoList from "./components/TodoList";
import QuoteOfDay from "./components/QuoteOfDay";
import MusicPlayer from "./components/MusicPlayer";
import SearchBar from "./components/SearchBar";
import CategoryFilter from "./components/CategoryFilter";
import Calendar from "./components/Calendar";
import ThemeSelector from "./components/ThemeSelector";
import WelcomeScreen from "./components/WelcomeScreen";
import StatsCard from "./components/StatsCard";
import StudyNotes from "./components/StudyNotes";

function App() {
  const [notes, setNotes] = useState([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [showLoveMessage, setShowLoveMessage] = useState(true);
  const [currentSection, setCurrentSection] = useState("notes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("sradha-theme") || "rose";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("sradha-sidebar-collapsed") === "true";
  });
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem("sradha-welcomed");
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("sradha-logged-in") === "true";
  });
  const [isViewingPdf, setIsViewingPdf] = useState(false);

  // Fetch notes from API when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotes();
    }
  }, [isLoggedIn]);

  const fetchNotes = async () => {
    try {
      setIsLoadingNotes(true);
      const response = await notesApi.getAll();
      if (response.success) {
        setNotes(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      const savedNotes = localStorage.getItem("sradha-notes");
      if (savedNotes) setNotes(JSON.parse(savedNotes));
    } finally {
      setIsLoadingNotes(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("sradha-logged-in");
    localStorage.removeItem("sradha-login-time");
    localStorage.removeItem("sradha-auth-token");
    setIsLoggedIn(false);
    setNotes([]);
  };

  const categories = [
    { id: "all", name: "All Notes", emoji: "📚", color: "rose" },
    { id: "personal", name: "Personal", emoji: "💭", color: "purple" },
    { id: "study", name: "Study", emoji: "📖", color: "blue" },
    { id: "dreams", name: "Dreams", emoji: "✨", color: "yellow" },
    { id: "memories", name: "Memories", emoji: "💝", color: "pink" },
    { id: "ideas", name: "Ideas", emoji: "💡", color: "green" },
  ];

  const themes = {
    rose: {
      primary: "from-rose-100 to-pink-200",
      accent: "rose",
      bg: "bg-gradient-to-br from-rose-50 via-pink-50 to-purple-100",
    },
    lavender: {
      primary: "from-purple-100 to-violet-200",
      accent: "purple",
      bg: "bg-gradient-to-br from-purple-50 via-violet-50 to-pink-100",
    },
    ocean: {
      primary: "from-blue-100 to-cyan-200",
      accent: "blue",
      bg: "bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-100",
    },
    sunset: {
      primary: "from-orange-100 to-rose-200",
      accent: "orange",
      bg: "bg-gradient-to-br from-orange-50 via-rose-50 to-pink-100",
    },
  };

  useEffect(() => {
    localStorage.setItem("sradha-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("sradha-sidebar-collapsed", sidebarCollapsed);
  }, [sidebarCollapsed]);

  const addNote = async (noteData) => {
    try {
      const response = await notesApi.create(noteData);
      if (response.success) {
        setNotes([response.data, ...notes]);
        return;
      }
    } catch (error) {
      console.error("Failed to add note:", error);
    }
    // Fallback to local
    const newNote = {
      id: Date.now(),
      ...noteData,
      createdAt: new Date().toISOString(),
      isLoved: false,
      isPinned: false,
      isArchived: false,
    };
    setNotes([newNote, ...notes]);
    localStorage.setItem("sradha-notes", JSON.stringify([newNote, ...notes]));
  };

  const deleteNote = async (id) => {
    try {
      await notesApi.delete(id);
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
    setNotes(notes.filter((note) => note._id !== id && note.id !== id));
  };

  const toggleLove = async (id) => {
    const note = notes.find((n) => n._id === id || n.id === id);
    if (!note) return;

    try {
      await notesApi.update(id, { isLoved: !note.isLoved });
    } catch (error) {
      console.error("Failed to toggle love:", error);
    }
    setNotes(
      notes.map((note) =>
        note._id === id || note.id === id
          ? { ...note, isLoved: !note.isLoved }
          : note
      )
    );
  };

  const togglePin = async (id) => {
    const note = notes.find((n) => n._id === id || n.id === id);
    if (!note) return;

    try {
      await notesApi.update(id, { isPinned: !note.isPinned });
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
    setNotes(
      notes.map((note) =>
        note._id === id || note.id === id
          ? { ...note, isPinned: !note.isPinned }
          : note
      )
    );
  };

  const toggleArchive = async (id) => {
    const note = notes.find((n) => n._id === id || n.id === id);
    if (!note) return;

    try {
      await notesApi.update(id, { isArchived: !note.isArchived });
    } catch (error) {
      console.error("Failed to toggle archive:", error);
    }
    setNotes(
      notes.map((note) =>
        note._id === id || note.id === id
          ? { ...note, isArchived: !note.isArchived }
          : note
      )
    );
  };

  const editNote = async (id, updatedData) => {
    try {
      await notesApi.update(id, updatedData);
    } catch (error) {
      console.error("Failed to edit note:", error);
    }
    setNotes(
      notes.map((note) =>
        note._id === id || note.id === id
          ? { ...note, ...updatedData, updatedAt: new Date().toISOString() }
          : note
      )
    );
  };

  const duplicateNote = async (id) => {
    const noteToDuplicate = notes.find(
      (note) => note._id === id || note.id === id
    );
    if (noteToDuplicate) {
      const duplicateData = {
        content: noteToDuplicate.content + " (Copy)",
        title: noteToDuplicate.title,
        category: noteToDuplicate.category,
      };
      try {
        const response = await notesApi.create(duplicateData);
        if (response.success) {
          setNotes([response.data, ...notes]);
          return;
        }
      } catch (error) {
        console.error("Failed to duplicate note:", error);
      }
      // Fallback
      const newNote = {
        ...noteToDuplicate,
        id: Date.now(),
        content: noteToDuplicate.content + " (Copy)",
        createdAt: new Date().toISOString(),
        isPinned: false,
      };
      setNotes([newNote, ...notes]);
    }
  };

  const filteredNotes = notes
    .filter((note) => !note.isArchived)
    .filter((note) =>
      selectedCategory === "all" ? true : note.category === selectedCategory
    )
    .filter(
      (note) =>
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const archivedNotes = notes.filter((note) => note.isArchived);

  const handleWelcomeComplete = () => {
    localStorage.setItem("sradha-welcomed", "true");
    setShowWelcome(false);
  };

  const renderSection = () => {
    switch (currentSection) {
      case "notes":
        return (
          <>
            <div className="max-w-4xl mx-auto px-4 py-6">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </div>
            <div className="max-w-4xl mx-auto px-4 py-4">
              <NoteInput onAddNote={addNote} categories={categories} />
            </div>
            <div className="max-w-6xl mx-auto px-4 pb-20">
              <NotesList
                notes={filteredNotes}
                onDelete={deleteNote}
                onToggleLove={toggleLove}
                onTogglePin={togglePin}
                onToggleArchive={toggleArchive}
                onEdit={editNote}
                onDuplicate={duplicateNote}
              />
            </div>
          </>
        );
      case "cats":
        return <CatGallery />;
      case "study":
        return <StudyNotes onPdfViewChange={setIsViewingPdf} />;
      case "mood":
        return <MoodTracker />;
      case "letters":
        return <LoveLetters />;
      case "memories":
        return <Memories />;
      case "todos":
        return <TodoList />;
      case "calendar":
        return <Calendar />;
      case "archived":
        return (
          <div className="max-w-6xl mx-auto px-4 pb-20">
            <div className="text-center mb-8">
              <h2 className="font-romantic text-4xl gradient-text">
                📦 Archived Notes
              </h2>
              <p className="font-sweet text-gray-500 mt-2">
                Your safely stored memories
              </p>
            </div>
            <NotesList
              notes={archivedNotes}
              onDelete={deleteNote}
              onToggleLove={toggleLove}
              onTogglePin={togglePin}
              onToggleArchive={toggleArchive}
              onEdit={editNote}
              onDuplicate={duplicateNote}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${themes[theme].bg}`}
    >
      {/* Login Screen */}
      {!isLoggedIn && <Login onLogin={setIsLoggedIn} />}

      {/* Main App - Only show when logged in */}
      {isLoggedIn && (
        <>
          {/* Floating Hearts Background */}
          {!isViewingPdf && <FloatingHearts theme={theme} />}

          {/* Love Message Modal */}
          {showLoveMessage && (
            <LoveMessage onClose={() => setShowLoveMessage(false)} />
          )}

          {/* Music Player - Fixed Position */}
          {!isViewingPdf && <MusicPlayer />}

          {/* Theme Selector - Fixed Position */}
          {!isViewingPdf && (
            <ThemeSelector theme={theme} setTheme={setTheme} themes={themes} />
          )}

          {/* Mobile Menu Button - Hide when viewing PDF */}
          {!isViewingPdf && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="fixed top-4 left-4 z-50 lg:hidden bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <span className="text-2xl">{sidebarOpen ? "✕" : "☰"}</span>
            </button>
          )}

          {/* Sidebar - Hide when viewing PDF on mobile */}
          {!isViewingPdf && (
            <Sidebar
              currentSection={currentSection}
              setCurrentSection={setCurrentSection}
              isOpen={sidebarOpen}
              setIsOpen={setSidebarOpen}
              isCollapsed={sidebarCollapsed}
              setIsCollapsed={setSidebarCollapsed}
              notesCount={notes.filter((n) => !n.isArchived).length}
              archivedCount={archivedNotes.length}
            />
          )}

          {/* Main Content */}
          <div
            className={`relative z-10 min-h-screen transition-all duration-300 ${
              sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
            }`}
          >
            {/* Header */}
            <Header theme={theme} />

            {/* Quote of the Day */}
            <QuoteOfDay />

            {/* Stats Cards */}
            <StatsCard notes={notes} />

            {/* Dynamic Section Content */}
            {renderSection()}

            {/* Footer */}
            <footer className="text-center py-8 text-rose-400 font-sweet border-t border-rose-100 mt-12 bg-white/30 backdrop-blur-sm">
              <p className="flex items-center justify-center gap-2">
                Made with{" "}
                <span className="text-2xl animate-heart-beat">💖</span> for
                Sradha Priyadarshini
              </p>
              <p className="text-sm mt-2 opacity-70">
                You are the most beautiful thing that ever happened to me ✨
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <span className="text-2xl animate-bounce-slow">🐱</span>
                <span className="text-2xl animate-float">💕</span>
                <span className="text-2xl animate-wiggle">🌸</span>
                <span className="text-2xl animate-float-delayed">✨</span>
              </div>
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="mt-6 px-6 py-2 bg-rose-100 hover:bg-rose-200 text-rose-500 font-sweet text-sm rounded-full transition-all duration-300 flex items-center gap-2 mx-auto"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </footer>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
