import React from "react";

const CategoryFilter = ({
  categories,
  selectedCategory,
  setSelectedCategory,
}) => {
  return (
    <div className="mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <p className="font-sweet text-rose-400 mb-3 flex items-center gap-2">
        <span>📂</span> Filter by category:
      </p>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full font-sweet text-sm transition-all duration-300 flex items-center gap-2 ${
              selectedCategory === category.id
                ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg scale-105"
                : "bg-white/80 hover:bg-rose-50 text-gray-600 hover:text-rose-500 border border-rose-100"
            }`}
          >
            <span>{category.emoji}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
