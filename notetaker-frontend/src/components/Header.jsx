import React from "react";

const Header = () => {
  return (
    <header className="relative py-12 px-4 text-center overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-4 left-10 text-4xl animate-bounce-slow">
        🌸
      </div>
      <div className="absolute top-8 right-12 text-3xl animate-float">✨</div>
      <div className="absolute top-20 left-1/4 text-2xl animate-wiggle">💕</div>
      <div className="absolute top-16 right-1/4 text-3xl animate-float-delayed">
        🦋
      </div>

      {/* Main Title */}
      <div className="relative">
        <h1 className="font-romantic text-6xl md:text-7xl lg:text-8xl gradient-text mb-4 animate-fade-in">
          Sradha's Notes
        </h1>
        <p className="font-sweet text-xl md:text-2xl text-rose-400 animate-slide-up">
          ✨ A special place for your beautiful thoughts ✨
        </p>

        {/* Subtitle with cat */}
        <div className="mt-6 flex items-center justify-center gap-3 animate-fade-in">
          <span className="text-3xl">🐱</span>
          <p className="font-sweet text-lg text-purple-400 italic">
            "Every note you write is a piece of your lovely heart"
          </p>
          <span className="text-3xl">💖</span>
        </div>
      </div>

      {/* Decorative Line */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-rose-300 to-rose-400 rounded-full"></div>
        <span className="text-2xl animate-heart-beat">💝</span>
        <div className="h-0.5 w-20 bg-gradient-to-l from-transparent via-rose-300 to-rose-400 rounded-full"></div>
      </div>
    </header>
  );
};

export default Header;
