import React from "react";

const StatsCard = ({ notes }) => {
  const totalNotes = notes.length;
  const lovedNotes = notes.filter((n) => n.isLoved).length;
  const pinnedNotes = notes.filter((n) => n.isPinned).length;
  const archivedNotes = notes.filter((n) => n.isArchived).length;
  const activeNotes = notes.filter((n) => !n.isArchived).length;

  const stats = [
    {
      label: "Total Notes",
      value: totalNotes,
      emoji: "📝",
      color: "from-rose-100 to-pink-100",
    },
    {
      label: "Loved",
      value: lovedNotes,
      emoji: "❤️",
      color: "from-red-100 to-rose-100",
    },
    {
      label: "Pinned",
      value: pinnedNotes,
      emoji: "📌",
      color: "from-yellow-100 to-orange-100",
    },
    {
      label: "Active",
      value: activeNotes,
      emoji: "✨",
      color: "from-purple-100 to-pink-100",
    },
  ];

  if (totalNotes === 0) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`glass rounded-2xl p-4 bg-gradient-to-br ${stat.color} hover:scale-105 transition-transform cursor-default`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-sweet text-gray-500 text-xs">{stat.label}</p>
                <p className="font-romantic text-2xl text-gray-700">
                  {stat.value}
                </p>
              </div>
              <span className="text-3xl">{stat.emoji}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCard;
