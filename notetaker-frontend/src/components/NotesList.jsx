import React from "react";
import NoteCard from "./NoteCard";

const NotesList = ({
  notes,
  onDelete,
  onToggleLove,
  onTogglePin,
  onToggleArchive,
  onEdit,
  onDuplicate,
}) => {
  if (notes.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="text-6xl mb-4 animate-bounce-slow">📝</div>
        <h3 className="font-romantic text-3xl text-rose-400 mb-3">
          No notes yet!
        </h3>
        <p className="font-sweet text-gray-500">
          Start writing your beautiful thoughts, Sradha! 💕
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <span className="text-4xl animate-float">🐱</span>
          <span className="text-4xl animate-float-delayed">🌸</span>
          <span className="text-4xl animate-float">✨</span>
        </div>
      </div>
    );
  }

  const pinnedNotes = notes.filter((note) => note.isPinned);
  const regularNotes = notes.filter((note) => !note.isPinned);

  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className="text-3xl animate-sparkle">✨</span>
        <h2 className="font-romantic text-4xl gradient-text">
          Your Beautiful Notes
        </h2>
        <span className="text-3xl animate-sparkle">✨</span>
      </div>

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="mb-8">
          <h3 className="font-sweet text-rose-400 mb-4 flex items-center gap-2">
            <span>📌</span> Pinned Notes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinnedNotes.map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                index={index}
                onDelete={onDelete}
                onToggleLove={onToggleLove}
                onTogglePin={onTogglePin}
                onToggleArchive={onToggleArchive}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Notes */}
      {regularNotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularNotes.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              index={index}
              onDelete={onDelete}
              onToggleLove={onToggleLove}
              onTogglePin={onTogglePin}
              onToggleArchive={onToggleArchive}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesList;
