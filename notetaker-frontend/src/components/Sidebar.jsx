import React, { useState } from "react";

const Sidebar = ({
  currentSection,
  setCurrentSection,
  isOpen,
  setIsOpen,
  notesCount,
  archivedCount,
  isCollapsed,
  setIsCollapsed,
}) => {
  const menuItems = [
    { id: "notes", name: "My Notes", emoji: "📝", count: notesCount },
    { id: "study", name: "Study Notes", emoji: "📚" },
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
        className={`fixed top-0 left-0 h-full bg-white/90 backdrop-blur-lg shadow-2xl z-40 transform transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${
          isCollapsed ? "lg:w-20" : "w-72"
        }`}
      >
        {/* Collapse Toggle Button - Desktop Only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full items-center justify-center text-white shadow-lg hover:scale-110 transition-all duration-300 z-50"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className={`text-xs transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}>
            ◀
          </span>
        </button>
        {/* Logo Section */}
        <div className={`border-b border-rose-100 transition-all duration-300 ${isCollapsed ? "p-4" : "p-6"}`}>
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
            <div className={`bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-float transition-all duration-300 ${isCollapsed ? "w-10 h-10" : "w-12 h-12"}`}>
              <span className={`transition-all duration-300 ${isCollapsed ? "text-xl" : "text-2xl"}`}>💝</span>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
              <h1 className="font-romantic text-2xl gradient-text whitespace-nowrap">Sradha's</h1>
              <p className="text-xs text-rose-400 font-sweet whitespace-nowrap">Personal Space</p>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className={`border-b border-rose-100 transition-all duration-300 ${isCollapsed ? "p-2" : "p-4"}`}>
          <div className={`flex items-center bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl transition-all duration-300 ${isCollapsed ? "p-2 justify-center" : "p-3 gap-3"}`}>
            <div className={`bg-gradient-to-br from-rose-300 to-pink-400 rounded-full flex items-center justify-center shadow-md ring-4 ring-white transition-all duration-300 ${isCollapsed ? "w-10 h-10 text-lg" : "w-14 h-14 text-2xl"}`}>
              👸
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
              <p className="font-sweet text-gray-700 font-semibold whitespace-nowrap">
                Sradha Priyadarshini
              </p>
              <p className="text-xs text-rose-400 flex items-center gap-1 whitespace-nowrap">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Online & Beautiful
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className={`space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto transition-all duration-300 ${isCollapsed ? "p-2" : "p-4"}`}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center rounded-xl transition-all duration-300 group relative ${
                isCollapsed ? "justify-center p-3" : "gap-3 p-3"
              } ${
                currentSection === item.id
                  ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg scale-105"
                  : "hover:bg-rose-50 text-gray-600 hover:text-rose-500"
              }`}
              title={isCollapsed ? item.name : ""}
            >
              <span
                className={`transition-transform duration-300 ${
                  isCollapsed ? "text-2xl" : "text-xl"
                } ${
                  currentSection === item.id
                    ? "scale-110"
                    : "group-hover:scale-110"
                }`}
              >
                {item.emoji}
              </span>
              <span className={`font-sweet flex-1 text-left transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
                {item.name}
              </span>
              {item.count !== undefined && !isCollapsed && (
                <span
                  className={`text-xs px-2 py-1 rounded-full transition-all duration-300 ${
                    currentSection === item.id
                      ? "bg-white/30"
                      : "bg-rose-100 text-rose-500"
                  }`}
                >
                  {item.count}
                </span>
              )}
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                  {item.name}
                  {item.count !== undefined && (
                    <span className="ml-2 bg-rose-400 px-2 py-0.5 rounded-full text-xs">
                      {item.count}
                    </span>
                  )}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className={`absolute bottom-0 left-0 right-0 border-t border-rose-100 bg-white/80 transition-all duration-300 ${isCollapsed ? "p-2" : "p-4"}`}>
          <div className="text-center">
            <p className={`font-sweet text-xs text-gray-400 transition-all duration-300 overflow-hidden ${isCollapsed ? "h-0 opacity-0" : "h-auto opacity-100"}`}>
              Made with 💖 just for you
            </p>
            <div className={`flex justify-center mt-2 transition-all duration-300 ${isCollapsed ? "flex-col gap-1" : "gap-2"}`}>
              <span className={`animate-wiggle transition-all duration-300 ${isCollapsed ? "text-xl" : "text-lg"}`}>🐱</span>
              <span className={`animate-heart-beat transition-all duration-300 ${isCollapsed ? "text-xl" : "text-lg"}`}>💕</span>
              <span className={`animate-float transition-all duration-300 ${isCollapsed ? "text-xl" : "text-lg"}`}>✨</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
