import React, { useState } from "react";

const NoteCard = ({
  note,
  index,
  onDelete,
  onToggleLove,
  onTogglePin,
  onToggleArchive,
  onEdit,
  onDuplicate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [editTitle, setEditTitle] = useState(note.title || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const colorClasses = {
    rose: "bg-gradient-to-br from-rose-50 to-pink-100 border-rose-200",
    purple: "bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200",
    blue: "bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200",
    yellow: "bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200",
    green: "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200",
    orange: "bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200",
  };

  const categoryEmojis = {
    personal: "💭",
    study: "📖",
    dreams: "✨",
    memories: "💝",
    ideas: "💡",
  };

  const handleSaveEdit = () => {
    if (editContent.trim() || note.images?.length > 0) {
      const noteId = note._id || note.id;
      onEdit(noteId, { content: editContent, title: editTitle });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    const noteId = note._id || note.id;
    onDelete(noteId);
    setShowDeleteConfirm(false);
  };

  const getNoteId = () => note._id || note.id;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div
        className={`romantic-card rounded-2xl p-5 border-2 ${
          colorClasses[note.color] || colorClasses.rose
        } relative overflow-hidden animate-scale-in group`}
        style={{ animationDelay: `${index * 0.1}s` }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Pinned Badge */}
        {note.isPinned && (
          <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-3 py-1 rounded-br-xl font-sweet">
            📌 Pinned
          </div>
        )}

        {/* Emoji Badge */}
        <div className="absolute -top-2 -right-2 text-3xl transform rotate-12 animate-wiggle">
          {note.emoji}
        </div>

        {/* Love Button */}
        <button
          onClick={() => onToggleLove(getNoteId())}
          className="absolute top-3 left-3 text-2xl transition-transform duration-300 hover:scale-125"
        >
          {note.isLoved ? (
            <span className="animate-heart-beat">❤️</span>
          ) : (
            <span className="opacity-50 hover:opacity-100">🤍</span>
          )}
        </button>

        {/* Category Badge */}
        {note.category && (
          <div className="absolute top-3 right-12 text-lg opacity-70">
            {categoryEmojis[note.category]}
          </div>
        )}

        {/* Content */}
        <div className={`${note.isPinned ? "mt-8" : "mt-8"} mb-4`}>
          {isEditing ? (
            <>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title..."
                className="w-full p-2 mb-2 rounded-xl border-2 border-rose-200 font-sweet text-gray-700 bg-white/80 focus:border-rose-400 focus:outline-none"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-rose-200 font-sweet text-gray-700 resize-none h-32 bg-white/80 focus:border-rose-400 focus:outline-none"
                autoFocus
              />
            </>
          ) : (
            <>
              {note.title && (
                <h3 className="font-sweet font-semibold text-gray-700 text-lg mb-2">
                  {note.title}
                </h3>
              )}
              <p className="font-sweet text-gray-700 leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>
            </>
          )}
        </div>

        {/* Images */}
        {note.images && note.images.length > 0 && !isEditing && (
          <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {note.images.slice(0, 3).map((img, idx) => (
              <div
                key={idx}
                className="relative cursor-pointer"
                onClick={() => setSelectedImage(img)}
              >
                <img
                  src={img}
                  alt={`Note image ${idx + 1}`}
                  className="w-full h-20 object-cover rounded-lg hover:opacity-90 transition-opacity"
                />
                {idx === 2 && note.images.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center text-white font-sweet">
                    +{note.images.length - 3}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Date & Updated */}
        <div className="text-xs text-gray-400 font-sweet mb-4">
          <p className="flex items-center gap-1">
            <span>📅</span> {formatDate(note.createdAt)}
          </p>
          {note.updatedAt && (
            <p className="flex items-center gap-1 mt-1">
              <span>✏️</span> Edited {formatDate(note.updatedAt)}
            </p>
          )}
        </div>

        {/* Quick Actions (shown on hover on desktop, always on mobile) */}
        {!isEditing && (
          <div
            className={`absolute top-1/2 right-2 transform -translate-y-1/2 flex flex-col gap-1 ${
              showActions
                ? "opacity-100"
                : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            } transition-opacity animate-fade-in`}
          >
            <button
              onClick={() => onTogglePin(getNoteId())}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-yellow-100 flex items-center justify-center text-sm transition-colors shadow"
              title={note.isPinned ? "Unpin" : "Pin"}
            >
              📌
            </button>
            <button
              onClick={() => onDuplicate(getNoteId())}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-blue-100 flex items-center justify-center text-sm transition-colors shadow"
              title="Duplicate"
            >
              📋
            </button>
            <button
              onClick={() => onToggleArchive(getNoteId())}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-gray-100 flex items-center justify-center text-sm transition-colors shadow"
              title={note.isArchived ? "Unarchive" : "Archive"}
            >
              📦
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded-xl font-sweet text-sm transition-all duration-300 flex items-center justify-center gap-1"
              >
                <span>✓</span> Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(note.content);
                  setEditTitle(note.title || "");
                }}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-xl font-sweet text-sm transition-all duration-300 flex items-center justify-center gap-1"
              >
                <span>✕</span> Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-2 rounded-xl font-sweet text-sm transition-all duration-300 flex items-center justify-center gap-1"
              >
                <span>✏️</span> Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 bg-gradient-to-r from-rose-400 to-red-400 hover:from-rose-500 hover:to-red-500 text-white px-4 py-2 rounded-xl font-sweet text-sm transition-all duration-300 flex items-center justify-center gap-1"
              >
                <span>🗑️</span> Delete
              </button>
            </>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 animate-fade-in z-10">
            <span className="text-4xl mb-3">😿</span>
            <p className="font-sweet text-gray-600 text-center mb-4">
              Are you sure you want to delete this note?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded-xl font-sweet text-sm transition-all duration-300"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-xl font-sweet text-sm transition-all duration-300"
              >
                Keep it
              </button>
            </div>
          </div>
        )}

        {/* Decorative Paw Print */}
        <div className="absolute bottom-2 right-2 text-lg opacity-30">🐾</div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-xl hover:bg-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NoteCard;
