import React, { useState } from "react";

const ThemeSelector = ({ theme, setTheme, themes }) => {
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions = [
    { id: "rose", name: "Rose Garden", emoji: "🌹", color: "bg-rose-400" },
    {
      id: "lavender",
      name: "Lavender Dreams",
      emoji: "💜",
      color: "bg-purple-400",
    },
    { id: "ocean", name: "Ocean Breeze", emoji: "🌊", color: "bg-blue-400" },
    { id: "sunset", name: "Sunset Glow", emoji: "🌅", color: "bg-orange-400" },
  ];

  return (
    <>
      {/* Theme Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-white/90 shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
      >
        <span className="text-2xl">🎨</span>
      </button>

      {/* Theme Panel */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 w-64 glass rounded-3xl p-4 shadow-2xl animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sweet text-rose-500 font-semibold">
              🎨 Choose Theme
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-rose-400"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setTheme(option.id);
                  setIsOpen(false);
                }}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                  theme === option.id
                    ? "bg-gradient-to-r from-rose-100 to-pink-100 ring-2 ring-rose-300"
                    : "hover:bg-rose-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full ${option.color} flex items-center justify-center text-white`}
                >
                  {option.emoji}
                </div>
                <span className="font-sweet text-gray-700">{option.name}</span>
                {theme === option.id && (
                  <span className="ml-auto text-rose-500">✓</span>
                )}
              </button>
            ))}
          </div>

          <p className="text-center font-sweet text-xs text-gray-400 mt-4">
            Pick a theme that matches your mood! 💕
          </p>
        </div>
      )}
    </>
  );
};

export default ThemeSelector;
