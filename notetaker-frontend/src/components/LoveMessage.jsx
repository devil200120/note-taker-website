import React, { useState, useEffect } from "react";

const LoveMessage = ({ onClose }) => {
  const [currentMessage, setCurrentMessage] = useState(0);

  const messages = [
    { text: "Hello, my beautiful Sradha! 💕", emoji: "👋" },
    { text: "Welcome to your special note-taking space!", emoji: "✨" },
    { text: "Every thought you write here is precious...", emoji: "💝" },
    { text: "Just like you are to someone special! 🌸", emoji: "🥰" },
  ];

  useEffect(() => {
    if (currentMessage < messages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentMessage((prev) => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentMessage]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Decorative Background Hearts */}
        <div className="absolute -top-10 -left-10 text-8xl opacity-10 animate-float">
          💕
        </div>
        <div className="absolute -bottom-10 -right-10 text-8xl opacity-10 animate-float-delayed">
          💖
        </div>

        {/* Cat Image */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src="/cute-cat.jpg"
              alt="Welcome Cat"
              className="w-32 h-32 object-cover rounded-full border-4 border-rose-300 shadow-romantic animate-float"
            />
            <span className="absolute -bottom-2 -right-2 text-3xl animate-wiggle">
              💝
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="text-center mb-8">
          <div className="h-24 flex flex-col items-center justify-center">
            <span className="text-4xl mb-2 animate-bounce-slow">
              {messages[currentMessage].emoji}
            </span>
            <p
              className="font-romantic text-2xl gradient-text animate-fade-in"
              key={currentMessage}
            >
              {messages[currentMessage].text}
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {messages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentMessage
                    ? "bg-rose-400 scale-110"
                    : "bg-rose-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Special Message */}
        <div className="bg-gradient-to-r from-rose-50 to-purple-50 rounded-2xl p-4 mb-6">
          <p className="font-sweet text-center text-gray-600">
            <span className="text-rose-500 font-semibold">
              Sradha Priyadarshini
            </span>
            , this space is made with love, just for you! Write down your
            dreams, thoughts, and beautiful moments. 💫
          </p>
        </div>

        {/* Enter Button */}
        <button
          onClick={onClose}
          className="w-full love-button text-white font-sweet text-lg py-4 rounded-2xl flex items-center justify-center gap-3"
        >
          <span>Enter My Space</span>
          <span className="text-2xl animate-heart-beat">💖</span>
        </button>

        {/* Decorative Elements */}
        <div className="flex justify-center gap-4 mt-6">
          <span className="text-2xl animate-float">🌸</span>
          <span className="text-2xl animate-wiggle">🐱</span>
          <span className="text-2xl animate-float-delayed">✨</span>
          <span className="text-2xl animate-bounce-slow">🦋</span>
        </div>
      </div>
    </div>
  );
};

export default LoveMessage;
