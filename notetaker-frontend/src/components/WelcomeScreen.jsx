import React, { useState, useEffect } from "react";

const WelcomeScreen = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const welcomeSteps = [
    {
      emoji: "💕",
      title: "Welcome, Sradha!",
      message: "This beautiful space was created just for you...",
      bg: "from-rose-200 to-pink-300",
    },
    {
      emoji: "📝",
      title: "Your Personal Notes",
      message: "Write down your thoughts, dreams, and memories",
      bg: "from-pink-200 to-purple-300",
    },
    {
      emoji: "🐱",
      title: "Cute Cat Friends",
      message: "Adorable cats to make you smile every day",
      bg: "from-purple-200 to-violet-300",
    },
    {
      emoji: "💌",
      title: "Love Letters",
      message: "Write beautiful letters to yourself or someone special",
      bg: "from-violet-200 to-pink-300",
    },
    {
      emoji: "✨",
      title: "Ready to Begin!",
      message: "Let's make every day magical together",
      bg: "from-pink-200 to-rose-300",
    },
  ];

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [step]);

  const handleNext = () => {
    if (step < welcomeSteps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStep = welcomeSteps[step];

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${currentStep.bg} flex items-center justify-center p-4 transition-all duration-500`}
    >
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array(20)
          .fill(null)
          .map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            >
              {
                ["💕", "✨", "🌸", "💖", "🦋", "⭐"][
                  Math.floor(Math.random() * 6)
                ]
              }
            </div>
          ))}
      </div>

      {/* Main Card */}
      <div
        className={`relative bg-white/90 backdrop-blur-lg rounded-3xl p-8 md:p-12 max-w-md w-full shadow-2xl ${
          isAnimating ? "animate-scale-in" : ""
        }`}
      >
        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-sweet text-sm"
        >
          Skip →
        </button>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {welcomeSteps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 bg-rose-400"
                  : i < step
                  ? "bg-rose-300"
                  : "bg-rose-100"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="text-7xl mb-6 animate-bounce-slow">
            {currentStep.emoji}
          </div>
          <h1 className="font-romantic text-4xl gradient-text mb-4">
            {currentStep.title}
          </h1>
          <p className="font-sweet text-gray-600 text-lg mb-8">
            {currentStep.message}
          </p>

          {/* Cat Image */}
          {step === 2 && (
            <div className="mb-8">
              <img
                src="/cute-cat.jpg"
                alt="Cute Cat"
                className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-white shadow-lg animate-wiggle"
              />
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleNext}
            className="w-full love-button text-white font-sweet text-lg py-4 rounded-2xl flex items-center justify-center gap-3"
          >
            <span>
              {step === welcomeSteps.length - 1
                ? "Start My Journey"
                : "Continue"}
            </span>
            <span className="text-2xl">
              {step === welcomeSteps.length - 1 ? "💝" : "→"}
            </span>
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-6 -left-6 text-4xl animate-wiggle">
          🌸
        </div>
        <div className="absolute -bottom-6 -right-6 text-4xl animate-float">
          ✨
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
