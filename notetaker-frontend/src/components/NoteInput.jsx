import React, { useState, useRef } from "react";

const NoteInput = ({ onAddNote, categories }) => {
  const [title, setTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [selectedColor, setSelectedColor] = useState("rose");
  const [selectedEmoji, setSelectedEmoji] = useState("💕");
  const [selectedCategory, setSelectedCategory] = useState("personal");
  const [isExpanded, setIsExpanded] = useState(false);
  const [images, setImages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const colors = [
    {
      name: "rose",
      bg: "bg-rose-100",
      border: "border-rose-300",
      gradient: "from-rose-100 to-pink-100",
    },
    {
      name: "purple",
      bg: "bg-purple-100",
      border: "border-purple-300",
      gradient: "from-purple-100 to-violet-100",
    },
    {
      name: "blue",
      bg: "bg-blue-100",
      border: "border-blue-300",
      gradient: "from-blue-100 to-cyan-100",
    },
    {
      name: "yellow",
      bg: "bg-yellow-100",
      border: "border-yellow-300",
      gradient: "from-yellow-100 to-amber-100",
    },
    {
      name: "green",
      bg: "bg-green-100",
      border: "border-green-300",
      gradient: "from-green-100 to-emerald-100",
    },
    {
      name: "orange",
      bg: "bg-orange-100",
      border: "border-orange-300",
      gradient: "from-orange-100 to-amber-100",
    },
  ];

  const emojis = [
    "💕",
    "💖",
    "💝",
    "🌸",
    "✨",
    "🦋",
    "🐱",
    "🌷",
    "🎀",
    "💜",
    "⭐",
    "🌙",
    "🌹",
    "🍀",
    "🌈",
    "☀️",
    "🌺",
    "🍃",
    "💫",
    "🎯",
    "📚",
    "💡",
    "🎵",
    "🌻",
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (noteContent.trim() || images.length > 0) {
      onAddNote({
        title: title.trim(),
        content: noteContent,
        color: selectedColor,
        emoji: selectedEmoji,
        category: selectedCategory,
        images: images,
      });
      setTitle("");
      setNoteContent("");
      setImages([]);
      setIsExpanded(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-6 md:p-8 shadow-romantic animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl animate-wiggle">📝</span>
        <h2 className="font-romantic text-3xl gradient-text">Write a Note</h2>
        <span className="text-3xl animate-heart-beat">💕</span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="Give your note a title... ✨"
          className="w-full p-4 rounded-2xl border-2 border-rose-100 note-input font-sweet text-gray-700 bg-white/80 mb-4 focus:border-rose-400 focus:outline-none"
        />

        {/* Text Area */}
        <div className="relative mb-6">
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Dear Sradha, write your lovely thoughts here... 💭"
            className={`w-full p-4 rounded-2xl border-2 border-rose-200 note-input font-sweet text-gray-700 resize-none transition-all duration-300 bg-white/80 focus:border-rose-400 focus:outline-none ${
              isExpanded ? "h-40" : "h-24"
            }`}
          />
          <span className="absolute bottom-3 right-3 text-2xl">
            {selectedEmoji}
          </span>
        </div>

        {/* Image Upload */}
        {isExpanded && (
          <div className="mb-6 animate-fade-in">
            <p className="font-sweet text-rose-400 mb-3 flex items-center gap-2">
              <span>📷</span> Add photos to your note:
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-rose-200 rounded-2xl hover:border-rose-400 hover:bg-rose-50/50 transition-all text-center"
            >
              <span className="text-2xl block mb-1">📸</span>
              <span className="font-sweet text-gray-500 text-sm">
                Click to upload photos
              </span>
            </button>

            {/* Preview Images */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-20 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-400 text-white w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Selection */}
        {isExpanded && (
          <div className="mb-6 animate-fade-in">
            <p className="font-sweet text-rose-400 mb-3 flex items-center gap-2">
              <span>📂</span> Choose a category:
            </p>
            <div className="flex gap-2 flex-wrap">
              {categories
                .filter((c) => c.id !== "all")
                .map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-2 rounded-full font-sweet text-sm flex items-center gap-1 transition-all ${
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white scale-105"
                        : "bg-white/80 hover:bg-rose-50 text-gray-600 border border-rose-100"
                    }`}
                  >
                    <span>{category.emoji}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Color Selection */}
        <div className="mb-6">
          <p className="font-sweet text-rose-400 mb-3 flex items-center gap-2">
            <span>🎨</span> Choose a pretty color:
          </p>
          <div className="flex gap-3 flex-wrap">
            {colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color.name)}
                className={`w-10 h-10 rounded-full ${color.bg} ${
                  color.border
                } border-2 transition-all duration-300 hover:scale-110 ${
                  selectedColor === color.name
                    ? "ring-4 ring-rose-300 ring-offset-2 scale-110"
                    : ""
                }`}
              />
            ))}
          </div>
        </div>

        {/* Emoji Selection */}
        <div className="mb-6">
          <p className="font-sweet text-rose-400 mb-3 flex items-center gap-2">
            <span>😊</span> Pick a cute emoji:
          </p>
          <div className="flex gap-2 flex-wrap">
            {emojis
              .slice(0, showEmojiPicker ? emojis.length : 12)
              .map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-2xl p-2 rounded-xl transition-all duration-300 hover:scale-125 hover:bg-rose-100 ${
                    selectedEmoji === emoji ? "bg-rose-200 scale-110" : ""
                  }`}
                >
                  {emoji}
                </button>
              ))}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 font-sweet text-sm text-rose-400 transition-colors"
            >
              {showEmojiPicker ? "Less" : "More..."}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!noteContent.trim() && images.length === 0}
          className="w-full love-button text-white font-sweet text-lg py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Save My Note</span>
          <span className="text-2xl">💝</span>
        </button>
      </form>
    </div>
  );
};

export default NoteInput;
