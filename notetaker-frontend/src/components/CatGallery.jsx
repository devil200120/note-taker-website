import React, { useState } from "react";

const CatGallery = () => {
  const [hoveredCat, setHoveredCat] = useState(null);

  const cats = [
    { src: "/cat.jpg", name: "Whiskers", message: "You are purrfect! 💕" },
    {
      src: "/cate-2.jpg",
      name: "Mittens",
      message: "So cute, just like you! 🌸",
    },
    { src: "/cute-cat.jpg", name: "Luna", message: "Sending love! 💝" },
    { src: "/cute-cate2.jpg", name: "Coco", message: "You make me smile! ✨" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="font-romantic text-4xl text-center gradient-text mb-8 animate-fade-in">
        🐱 Cute Cat Friends 🐱
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {cats.map((cat, index) => (
          <div
            key={index}
            className="relative group"
            onMouseEnter={() => setHoveredCat(index)}
            onMouseLeave={() => setHoveredCat(null)}
          >
            <div
              className="cat-frame overflow-hidden transform transition-all duration-500 hover:scale-105 hover:rotate-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img
                src={cat.src}
                alt={cat.name}
                className="w-full h-40 md:h-48 object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            {/* Cat Name Badge */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-rose-400 to-pink-400 text-white px-4 py-1 rounded-full text-sm font-sweet shadow-lg">
              {cat.name}
            </div>

            {/* Hover Message */}
            {hoveredCat === index && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-xl shadow-romantic text-rose-500 font-sweet text-sm whitespace-nowrap animate-scale-in">
                {cat.message}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Extra Decorative Cat Image */}
      <div className="mt-8 flex justify-center">
        <div className="relative">
          <img
            src="/top-10-cutest-cat-photos-of-all-time.avif"
            alt="Cutest Cat"
            className="w-64 h-48 object-cover rounded-3xl shadow-romantic cat-frame animate-float"
          />
          <div className="absolute -top-4 -right-4 text-4xl animate-wiggle">
            😻
          </div>
          <div className="absolute -bottom-4 -left-4 text-3xl animate-bounce-slow">
            💕
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatGallery;
