import React, { useState, useEffect } from "react";

const MoodTracker = () => {
  const [moods, setMoods] = useState(() => {
    const saved = localStorage.getItem("sradha-moods");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");

  const moodOptions = [
    {
      emoji: "😊",
      name: "Happy",
      color: "from-yellow-200 to-orange-200",
      message: "Your happiness lights up the world! ✨",
    },
    {
      emoji: "🥰",
      name: "Loved",
      color: "from-rose-200 to-pink-300",
      message: "You are so loved, always! 💕",
    },
    {
      emoji: "😌",
      name: "Peaceful",
      color: "from-green-200 to-teal-200",
      message: "Peace suits you beautifully! 🌿",
    },
    {
      emoji: "🤩",
      name: "Excited",
      color: "from-purple-200 to-pink-200",
      message: "Your excitement is contagious! 🎉",
    },
    {
      emoji: "😴",
      name: "Tired",
      color: "from-blue-200 to-indigo-200",
      message: "Rest well, beautiful soul! 💤",
    },
    {
      emoji: "🥺",
      name: "Sad",
      color: "from-gray-200 to-blue-200",
      message: "Sending you all my love and hugs! 🤗",
    },
    {
      emoji: "😤",
      name: "Frustrated",
      color: "from-red-200 to-orange-200",
      message: "This too shall pass, stay strong! 💪",
    },
    {
      emoji: "🦋",
      name: "Hopeful",
      color: "from-cyan-200 to-blue-200",
      message: "Beautiful things are coming! 🌈",
    },
  ];

  useEffect(() => {
    localStorage.setItem("sradha-moods", JSON.stringify(moods));
  }, [moods]);

  const saveMood = () => {
    if (selectedMood) {
      const newMood = {
        id: Date.now(),
        mood: selectedMood,
        note: note,
        date: new Date().toISOString(),
      };
      setMoods([newMood, ...moods]);
      setSelectedMood(null);
      setNote("");
    }
  };

  const deleteMood = (id) => {
    setMoods(moods.filter((m) => m.id !== id));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMoodStats = () => {
    const stats = {};
    moods.forEach((m) => {
      stats[m.mood.name] = (stats[m.mood.name] || 0) + 1;
    });
    return stats;
  };

  const stats = getMoodStats();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="font-romantic text-4xl gradient-text mb-2">
          💕 Mood Tracker 💕
        </h2>
        <p className="font-sweet text-gray-500">
          How are you feeling today, beautiful? 🌸
        </p>
      </div>

      {/* Mood Selection */}
      <div className="glass rounded-3xl p-6 mb-8 animate-slide-up">
        <h3 className="font-sweet text-lg text-rose-400 mb-4 text-center">
          Select your current mood:
        </h3>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {moodOptions.map((mood) => (
            <button
              key={mood.name}
              onClick={() => setSelectedMood(mood)}
              className={`p-4 rounded-2xl transition-all duration-300 flex flex-col items-center gap-2 ${
                selectedMood?.name === mood.name
                  ? `bg-gradient-to-br ${mood.color} scale-105 shadow-lg ring-4 ring-white`
                  : "bg-white/50 hover:bg-white/80 hover:scale-105"
              }`}
            >
              <span className="text-4xl">{mood.emoji}</span>
              <span className="font-sweet text-sm text-gray-600">
                {mood.name}
              </span>
            </button>
          ))}
        </div>

        {/* Selected Mood Message */}
        {selectedMood && (
          <div
            className={`p-4 rounded-2xl bg-gradient-to-r ${selectedMood.color} mb-4 animate-scale-in text-center`}
          >
            <p className="font-sweet text-gray-700">{selectedMood.message}</p>
          </div>
        )}

        {/* Note Input */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a little note about how you're feeling... 💭"
          className="w-full p-4 rounded-2xl border-2 border-rose-100 font-sweet text-gray-700 resize-none h-24 bg-white/80 focus:border-rose-400 focus:outline-none transition-colors"
        />

        {/* Save Button */}
        <button
          onClick={saveMood}
          disabled={!selectedMood}
          className="w-full mt-4 love-button text-white font-sweet text-lg py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Save My Mood</span>
          <span className="text-2xl">💝</span>
        </button>
      </div>

      {/* Mood Stats */}
      {moods.length > 0 && (
        <div className="glass rounded-3xl p-6 mb-8 animate-slide-up">
          <h3 className="font-sweet text-lg text-rose-400 mb-4 text-center">
            📊 Your Mood Journey
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {Object.entries(stats).map(([name, count]) => {
              const mood = moodOptions.find((m) => m.name === name);
              return (
                <div
                  key={name}
                  className={`px-4 py-2 rounded-full bg-gradient-to-r ${mood?.color} flex items-center gap-2`}
                >
                  <span className="text-xl">{mood?.emoji}</span>
                  <span className="font-sweet text-gray-700">{name}</span>
                  <span className="bg-white/50 px-2 py-0.5 rounded-full text-sm font-sweet">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mood History */}
      <div className="space-y-4">
        <h3 className="font-romantic text-2xl gradient-text text-center mb-4">
          ✨ Mood History ✨
        </h3>
        {moods.length === 0 ? (
          <div className="text-center py-12 glass rounded-3xl animate-fade-in">
            <span className="text-6xl block mb-4">🌸</span>
            <p className="font-sweet text-gray-500">
              No moods recorded yet. Start tracking your beautiful emotions!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {moods.map((moodEntry, index) => (
              <div
                key={moodEntry.id}
                className={`p-4 rounded-2xl bg-gradient-to-r ${moodEntry.mood.color} animate-scale-in relative group`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{moodEntry.mood.emoji}</span>
                  <div className="flex-1">
                    <p className="font-sweet font-semibold text-gray-700">
                      {moodEntry.mood.name}
                    </p>
                    {moodEntry.note && (
                      <p className="font-sweet text-gray-600 text-sm mt-1">
                        "{moodEntry.note}"
                      </p>
                    )}
                    <p className="font-sweet text-gray-500 text-xs mt-2">
                      📅 {formatDate(moodEntry.date)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMood(moodEntry.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;
