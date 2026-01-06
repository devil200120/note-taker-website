import React from "react";

const Sidebar = ({
  currentSection,
  setCurrentSection,
  isOpen,
  setIsOpen,
  notesCount,
  archivedCount,
}) => {
  const menuItems = [
    { id: "notes", name: "My Notes", emoji: "📝", count: notesCount },
    { id: "cats", name: "Cute Cats", emoji: "🐱" },
    { id: "mood", name: "Mood Tracker", emoji: "💕" },
    { id: "letters", name: "Love Letters", emoji: "💌" },
    { id: "memories", name: "Memories", emoji: "📸" },
    { id: "todos", name: "To-Do List", emoji: "✅" },
    { id: "calendar", name: "Calendar", emoji: "📅" },
    { id: "archived", name: "Archived", emoji: "📦", count: archivedCount },
  ];

  const handleItemClick = (id) => {
    setCurrentSection(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white/90 backdrop-blur-lg shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-rose-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-float">
              <span className="text-2xl">💝</span>
            </div>
            <div>
              <h1 className="font-romantic text-2xl gradient-text">Sradha's</h1>
              <p className="text-xs text-rose-400 font-sweet">Personal Space</p>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="p-4 border-b border-rose-100">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-300 to-pink-400 rounded-full flex items-center justify-center text-2xl shadow-md ring-4 ring-white">
              👸
            </div>
            <div>
              <p className="font-sweet text-gray-700 font-semibold">
                Sradha Priyadarshini
              </p>
              <p className="text-xs text-rose-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Online & Beautiful
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${
                currentSection === item.id
                  ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg scale-105"
                  : "hover:bg-rose-50 text-gray-600 hover:text-rose-500"
              }`}
            >
              <span
                className={`text-xl transition-transform duration-300 ${
                  currentSection === item.id
                    ? "scale-110"
                    : "group-hover:scale-110"
                }`}
              >
                {item.emoji}
              </span>
              <span className="font-sweet flex-1 text-left">{item.name}</span>
              {item.count !== undefined && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    currentSection === item.id
                      ? "bg-white/30"
                      : "bg-rose-100 text-rose-500"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-rose-100 bg-white/80">
          <div className="text-center">
            <p className="font-sweet text-xs text-gray-400">
              Made with 💖 just for you
            </p>
            <div className="flex justify-center gap-2 mt-2">
              <span className="text-lg animate-wiggle">🐱</span>
              <span className="text-lg animate-heart-beat">💕</span>
              <span className="text-lg animate-float">✨</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
