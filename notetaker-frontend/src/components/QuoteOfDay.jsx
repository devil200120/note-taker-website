import React, { useState, useEffect } from "react";

const QuoteOfDay = () => {
  const [quote, setQuote] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const quotes = [
    {
      text: "You are enough just as you are. Every piece of you is beautiful.",
      author: "💕 For Sradha",
    },
    {
      text: "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.",
      author: "💖 With Love",
    },
    {
      text: "Your smile is literally the cutest thing I've ever seen in my life.",
      author: "😊 Always",
    },
    {
      text: "The world is a better place because you're in it.",
      author: "🌸 Forever",
    },
    {
      text: "You don't have to be perfect to be amazing.",
      author: "✨ Remember This",
    },
    {
      text: "Today is going to be a beautiful day, because you're in it.",
      author: "🌷 Always",
    },
    {
      text: "You are braver than you believe, stronger than you seem, and smarter than you think.",
      author: "💪 Believe It",
    },
    {
      text: "Your kindness creates ripples that change the world.",
      author: "🌊 True Story",
    },
    { text: "Dream big, sparkle more, shine bright.", author: "⭐ Always" },
    {
      text: "You are the author of your own story. Make it beautiful.",
      author: "📖 With Love",
    },
    {
      text: "Every day may not be good, but there's something good in every day.",
      author: "🌈 Keep Smiling",
    },
    { text: "You are loved more than you know.", author: "❤️ Forever" },
    { text: "The best is yet to come.", author: "🌟 Promise" },
    {
      text: "You make everything around you more beautiful just by being you.",
      author: "🌸 Truth",
    },
    {
      text: "Stay positive, work hard, make it happen.",
      author: "💪 You Got This",
    },
  ];

  useEffect(() => {
    // Get a quote based on the day
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );
    const quoteIndex = dayOfYear % quotes.length;
    setQuote(quotes[quoteIndex]);
  }, []);

  if (!quote) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <div
        className={`glass rounded-2xl overflow-hidden transition-all duration-500 animate-slide-up ${
          isMinimized ? "p-2" : "p-6"
        }`}
      >
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="w-full flex items-center justify-center gap-2 text-rose-400 font-sweet hover:text-rose-500 transition-colors"
          >
            <span>✨</span>
            <span>Show Quote of the Day</span>
            <span>✨</span>
          </button>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl animate-wiggle">✨</span>
                <h3 className="font-romantic text-xl gradient-text">
                  Quote of the Day
                </h3>
                <span className="text-2xl animate-wiggle">✨</span>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 hover:text-rose-400 transition-colors"
              >
                −
              </button>
            </div>
            <div className="relative pl-6 border-l-4 border-rose-200">
              <span className="absolute -left-3 top-0 text-4xl text-rose-300">
                "
              </span>
              <p className="font-sweet text-gray-700 text-lg italic leading-relaxed">
                {quote.text}
              </p>
              <p className="font-sweet text-rose-400 mt-3">— {quote.author}</p>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <span className="text-xl animate-float">🌸</span>
              <span className="text-xl animate-heart-beat">💕</span>
              <span className="text-xl animate-float-delayed">🦋</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuoteOfDay;
