import React from "react";

const FloatingHearts = () => {
  const hearts = ["💕", "💖", "💗", "💝", "💘", "🌸", "✨", "🦋", "🐱", "💜"];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="floating-heart"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
            fontSize: `${15 + Math.random() * 20}px`,
          }}
        >
          {hearts[Math.floor(Math.random() * hearts.length)]}
        </div>
      ))}
    </div>
  );
};

export default FloatingHearts;
