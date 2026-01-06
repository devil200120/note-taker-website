import React, { useState, useRef, useEffect } from "react";

const MusicPlayer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef(null);

  // Romantic ambient tracks (using placeholder - in real app, these would be actual audio files)
  const playlist = [
    { name: "Peaceful Dreams", emoji: "🌙", duration: "3:45" },
    { name: "Soft Rain", emoji: "🌧️", duration: "4:20" },
    { name: "Gentle Waves", emoji: "🌊", duration: "5:00" },
    { name: "Forest Melody", emoji: "🌲", duration: "4:15" },
    { name: "Starlight Serenade", emoji: "⭐", duration: "3:55" },
  ];

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  return (
    <>
      {/* Floating Music Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isPlaying
            ? "bg-gradient-to-r from-rose-400 to-pink-400 animate-pulse"
            : "bg-white/90 hover:bg-rose-50"
        }`}
      >
        <span className={`text-2xl ${isPlaying ? "animate-spin-slow" : ""}`}>
          🎵
        </span>
      </button>

      {/* Music Player Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-72 glass rounded-3xl p-4 shadow-2xl animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sweet text-rose-500 font-semibold">
              🎶 Relaxing Music
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-rose-400"
            >
              ✕
            </button>
          </div>

          {/* Current Track */}
          <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{playlist[currentTrack].emoji}</span>
              <div>
                <p className="font-sweet font-semibold text-gray-700">
                  {playlist[currentTrack].name}
                </p>
                <p className="font-sweet text-gray-500 text-sm">
                  {playlist[currentTrack].duration}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-1 bg-white/50 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-rose-400 to-pink-400 rounded-full ${
                  isPlaying ? "animate-progress" : ""
                }`}
                style={{ width: isPlaying ? "100%" : "0%" }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prevTrack}
              className="w-10 h-10 rounded-full bg-rose-50 hover:bg-rose-100 flex items-center justify-center transition-colors"
            >
              ⏮️
            </button>
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-transform"
            >
              {isPlaying ? "⏸️" : "▶️"}
            </button>
            <button
              onClick={nextTrack}
              className="w-10 h-10 rounded-full bg-rose-50 hover:bg-rose-100 flex items-center justify-center transition-colors"
            >
              ⏭️
            </button>
          </div>

          {/* Playlist */}
          <div className="mt-4 max-h-40 overflow-y-auto space-y-2">
            {playlist.map((track, index) => (
              <button
                key={index}
                onClick={() => setCurrentTrack(index)}
                className={`w-full p-2 rounded-xl flex items-center gap-3 transition-colors ${
                  currentTrack === index ? "bg-rose-100" : "hover:bg-rose-50"
                }`}
              >
                <span className="text-xl">{track.emoji}</span>
                <span className="font-sweet text-sm text-gray-700 flex-1 text-left">
                  {track.name}
                </span>
                <span className="font-sweet text-xs text-gray-400">
                  {track.duration}
                </span>
              </button>
            ))}
          </div>

          {/* Note */}
          <p className="text-center font-sweet text-xs text-gray-400 mt-4">
            🎧 Put on headphones for the best experience
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 180s linear infinite;
        }
      `}</style>
    </>
  );
};

export default MusicPlayer;
