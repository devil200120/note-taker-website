import React, { useState, useEffect } from "react";
import { lettersApi } from "../services/api";

const LoveLetters = () => {
  const [letters, setLetters] = useState([]);
  const [isWriting, setIsWriting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentLetter, setCurrentLetter] = useState({
    to: "",
    subject: "",
    content: "",
  });
  const [selectedLetter, setSelectedLetter] = useState(null);

  const letterTemplates = [
    { emoji: "💕", name: "Love Letter", bg: "from-rose-200 to-pink-200" },
    { emoji: "💌", name: "Secret Message", bg: "from-purple-200 to-pink-200" },
    { emoji: "🌸", name: "Sweet Note", bg: "from-pink-200 to-rose-100" },
    { emoji: "✨", name: "Special Wish", bg: "from-yellow-200 to-pink-200" },
  ];

  // Fetch letters from API
  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      setIsLoading(true);
      const response = await lettersApi.getAll();
      if (response.success) {
        setLetters(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch letters:", error);
      const saved = localStorage.getItem("sradha-letters");
      if (saved) setLetters(JSON.parse(saved));
    } finally {
      setIsLoading(false);
    }
  };

  const saveLetter = async () => {
    if (currentLetter.content.trim()) {
      setIsSaving(true);
      try {
        const response = await lettersApi.create(currentLetter);
        if (response.success) {
          setLetters([response.data, ...letters]);
        }
      } catch (error) {
        console.error("Failed to save letter:", error);
        const newLetter = {
          id: Date.now(),
          ...currentLetter,
          date: new Date().toISOString(),
          isRead: false,
          hearts: 0,
        };
        const updatedLetters = [newLetter, ...letters];
        setLetters(updatedLetters);
        localStorage.setItem("sradha-letters", JSON.stringify(updatedLetters));
      } finally {
        setCurrentLetter({ to: "", subject: "", content: "" });
        setIsWriting(false);
        setIsSaving(false);
      }
    }
  };

  const deleteLetter = async (id) => {
    try {
      await lettersApi.delete(id);
      setLetters(letters.filter((l) => l._id !== id && l.id !== id));
      setSelectedLetter(null);
    } catch (error) {
      console.error("Failed to delete letter:", error);
      setLetters(letters.filter((l) => l._id !== id && l.id !== id));
      setSelectedLetter(null);
    }
  };

  const addHeart = async (id) => {
    try {
      const response = await lettersApi.addHeart(id);
      if (response.success) {
        setLetters(
          letters.map((l) =>
            l._id === id || l.id === id ? { ...l, hearts: l.hearts + 1 } : l
          )
        );
        if (
          selectedLetter &&
          (selectedLetter._id === id || selectedLetter.id === id)
        ) {
          setSelectedLetter({
            ...selectedLetter,
            hearts: selectedLetter.hearts + 1,
          });
        }
      }
    } catch (error) {
      console.error("Failed to add heart:", error);
      setLetters(
        letters.map((l) =>
          l._id === id || l.id === id ? { ...l, hearts: l.hearts + 1 } : l
        )
      );
    }
  };

  const markAsRead = async (letter) => {
    try {
      if (!letter.isRead) {
        await lettersApi.markAsRead(letter._id || letter.id);
        setLetters(
          letters.map((l) =>
            l._id === letter._id || l.id === letter.id
              ? { ...l, isRead: true }
              : l
          )
        );
      }
      setSelectedLetter({ ...letter, isRead: true });
    } catch (error) {
      console.error("Failed to mark as read:", error);
      setSelectedLetter(letter);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="font-romantic text-4xl gradient-text mb-2">
          💌 Love Letters 💌
        </h2>
        <p className="font-sweet text-gray-500">
          Write beautiful letters to yourself or someone special 🌸
        </p>
      </div>

      {/* Write New Letter Button */}
      {!isWriting && !selectedLetter && (
        <button
          onClick={() => setIsWriting(true)}
          className="w-full mb-8 glass rounded-3xl p-6 flex items-center justify-center gap-4 hover:scale-[1.02] transition-transform animate-slide-up group"
        >
          <span className="text-4xl group-hover:animate-wiggle">✉️</span>
          <span className="font-romantic text-2xl gradient-text">
            Write a New Letter
          </span>
          <span className="text-4xl group-hover:animate-heart-beat">💕</span>
        </button>
      )}

      {/* Letter Writing Form */}
      {isWriting && (
        <div className="glass rounded-3xl p-6 mb-8 animate-scale-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-romantic text-2xl gradient-text">
              ✍️ Writing a Love Letter
            </h3>
            <button
              onClick={() => {
                setIsWriting(false);
                setCurrentLetter({ to: "", subject: "", content: "" });
              }}
              className="text-gray-400 hover:text-rose-400 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Template Selection */}
          <div className="mb-6">
            <p className="font-sweet text-rose-400 mb-3">Choose a style:</p>
            <div className="flex gap-3 flex-wrap">
              {letterTemplates.map((template) => (
                <button
                  key={template.name}
                  className={`px-4 py-2 rounded-full bg-gradient-to-r ${template.bg} font-sweet text-gray-700 hover:scale-105 transition-transform flex items-center gap-2`}
                >
                  <span>{template.emoji}</span>
                  <span>{template.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* To Field */}
          <input
            type="text"
            value={currentLetter.to}
            onChange={(e) =>
              setCurrentLetter({ ...currentLetter, to: e.target.value })
            }
            placeholder="To: My Beautiful Self / Someone Special 💕"
            className="w-full p-4 rounded-2xl border-2 border-rose-100 font-sweet text-gray-700 bg-white/80 focus:border-rose-400 focus:outline-none transition-colors mb-4"
          />

          {/* Subject Field */}
          <input
            type="text"
            value={currentLetter.subject}
            onChange={(e) =>
              setCurrentLetter({ ...currentLetter, subject: e.target.value })
            }
            placeholder="Subject: Something Sweet... ✨"
            className="w-full p-4 rounded-2xl border-2 border-rose-100 font-sweet text-gray-700 bg-white/80 focus:border-rose-400 focus:outline-none transition-colors mb-4"
          />

          {/* Letter Content */}
          <div className="relative">
            <div className="absolute top-4 left-4 text-4xl opacity-20">💌</div>
            <textarea
              value={currentLetter.content}
              onChange={(e) =>
                setCurrentLetter({ ...currentLetter, content: e.target.value })
              }
              placeholder="Dear beautiful soul...

Write your heart out here. Express your feelings, dreams, and wishes. This is your safe space to pour out all your emotions. 💕

With all my love..."
              className="w-full p-6 pt-16 rounded-2xl border-2 border-rose-100 font-sweet text-gray-700 resize-none h-64 bg-gradient-to-b from-rose-50/50 to-white/80 focus:border-rose-400 focus:outline-none transition-colors"
              style={{ lineHeight: "2" }}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={saveLetter}
            disabled={!currentLetter.content.trim() || isSaving}
            className="w-full mt-6 love-button text-white font-sweet text-lg py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sealing...</span>
              </>
            ) : (
              <>
                <span>Seal with Love</span>
                <span className="text-2xl">💋</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* View Selected Letter */}
      {selectedLetter && (
        <div className="glass rounded-3xl p-8 mb-8 animate-scale-in relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 text-6xl opacity-10">💌</div>
          <div className="absolute bottom-4 left-4 text-4xl opacity-10">🌸</div>

          <button
            onClick={() => setSelectedLetter(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-rose-400 text-2xl z-10"
          >
            ✕
          </button>

          <div className="mb-6">
            <p className="font-sweet text-rose-400 text-sm">
              {formatDate(selectedLetter.date)}
            </p>
            <h3 className="font-romantic text-3xl gradient-text mt-2">
              {selectedLetter.subject || "A Letter of Love"}
            </h3>
            <p className="font-sweet text-gray-500 mt-1">
              To: {selectedLetter.to || "My Beautiful Self"}
            </p>
          </div>

          <div
            className="bg-gradient-to-b from-rose-50/50 to-white/30 rounded-2xl p-6 mb-6"
            style={{ lineHeight: "2" }}
          >
            <p className="font-sweet text-gray-700 whitespace-pre-wrap">
              {selectedLetter.content}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => addHeart(selectedLetter._id || selectedLetter.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              <span className="animate-heart-beat">💕</span>
              <span className="font-sweet text-rose-500">
                {selectedLetter.hearts} Hearts
              </span>
            </button>
            <button
              onClick={() =>
                deleteLetter(selectedLetter._id || selectedLetter.id)
              }
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-400 transition-colors"
            >
              <span>🗑️</span>
              <span className="font-sweet">Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Letters List */}
      {!isWriting && !selectedLetter && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-16 glass rounded-3xl animate-fade-in">
              <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="font-sweet text-gray-500">
                Loading your letters...
              </p>
            </div>
          ) : letters.length === 0 ? (
            <div className="text-center py-16 glass rounded-3xl animate-fade-in">
              <span className="text-6xl block mb-4 animate-float">💌</span>
              <h3 className="font-romantic text-2xl text-rose-400 mb-3">
                No letters yet!
              </h3>
              <p className="font-sweet text-gray-500">
                Start writing beautiful letters to cherish forever 💕
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {letters.map((letter, index) => (
                <div
                  key={letter._id || letter.id}
                  onClick={() => markAsRead(letter)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-scale-in ${
                    letter.isRead
                      ? "bg-white/80"
                      : "bg-gradient-to-r from-rose-100 to-pink-100 ring-2 ring-rose-200"
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">
                      {letter.isRead ? "📬" : "📩"}
                    </span>
                    <div className="flex-1">
                      <p className="font-sweet font-semibold text-gray-700">
                        {letter.subject || "A Letter of Love"}
                      </p>
                      <p className="font-sweet text-gray-500 text-sm">
                        To: {letter.to || "My Beautiful Self"}
                      </p>
                      <p className="font-sweet text-gray-400 text-xs mt-1">
                        {formatDate(letter.date || letter.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {letter.hearts > 0 && (
                        <span className="flex items-center gap-1 text-rose-400 font-sweet text-sm">
                          💕 {letter.hearts}
                        </span>
                      )}
                      {!letter.isRead && (
                        <span className="bg-rose-400 text-white text-xs px-2 py-1 rounded-full font-sweet">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoveLetters;
