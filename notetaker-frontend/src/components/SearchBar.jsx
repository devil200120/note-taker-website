import React, { useState } from "react";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative mb-6 animate-slide-up">
      <div
        className={`relative flex items-center bg-white/80 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 ${
          isFocused
            ? "border-rose-400 shadow-lg shadow-rose-200/50"
            : "border-rose-100 hover:border-rose-200"
        }`}
      >
        <span className="pl-4 text-xl">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search your beautiful notes..."
          className="w-full py-4 px-4 bg-transparent font-sweet text-gray-700 placeholder-rose-300 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="pr-4 text-rose-400 hover:text-rose-600 transition-colors"
          >
            ✕
          </button>
        )}
        <span className="pr-4 text-xl animate-wiggle">💕</span>
      </div>

      {/* Search suggestions */}
      {isFocused && !searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-rose-100 p-4 z-10 animate-fade-in">
          <p className="font-sweet text-gray-500 text-sm mb-2">
            Quick searches:
          </p>
          <div className="flex flex-wrap gap-2">
            {["💭 Personal", "📖 Study", "✨ Dreams", "💝 Memories"].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setSearchQuery(suggestion.split(" ")[1])}
                  className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-full text-sm font-sweet transition-colors"
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
