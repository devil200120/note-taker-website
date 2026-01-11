import React, { useState, useEffect, useRef } from "react";
import { memoriesApi, uploadApi } from "../services/api";

const Memories = () => {
  const [memories, setMemories] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMemory, setCurrentMemory] = useState({
    title: "",
    description: "",
    images: [],
    date: "",
  });
  const [selectedMemory, setSelectedMemory] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch memories from API
  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      setIsLoading(true);
      const response = await memoriesApi.getAll();
      if (response.success) {
        setMemories(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch memories:", error);
      const saved = localStorage.getItem("sradha-memories");
      if (saved) setMemories(JSON.parse(saved));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
      try {
        // Try to upload to cloudinary
        const response = await uploadApi.uploadImage(file);
        if (response.success) {
          setCurrentMemory((prev) => ({
            ...prev,
            images: [...prev.images, response.url],
          }));
        }
      } catch (error) {
        // Fallback to local base64
        console.error("Failed to upload to cloud, using local:", error);
        const reader = new FileReader();
        reader.onloadend = () => {
          setCurrentMemory((prev) => ({
            ...prev,
            images: [...prev.images, reader.result],
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (index) => {
    setCurrentMemory((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const saveMemory = async () => {
    if (currentMemory.title.trim() || currentMemory.images.length > 0) {
      setIsSaving(true);
      try {
        const response = await memoriesApi.create({
          ...currentMemory,
          hearts: 0,
        });
        if (response.success) {
          setMemories([response.data, ...memories]);
        }
      } catch (error) {
        console.error("Failed to save memory:", error);
        const newMemory = {
          id: Date.now(),
          ...currentMemory,
          createdAt: new Date().toISOString(),
          hearts: 0,
        };
        setMemories([newMemory, ...memories]);
        localStorage.setItem(
          "sradha-memories",
          JSON.stringify([newMemory, ...memories])
        );
      } finally {
        setCurrentMemory({ title: "", description: "", images: [], date: "" });
        setIsAdding(false);
        setIsSaving(false);
      }
    }
  };

  const deleteMemory = async (id) => {
    try {
      await memoriesApi.delete(id);
      setMemories(memories.filter((m) => m._id !== id && m.id !== id));
      setSelectedMemory(null);
    } catch (error) {
      console.error("Failed to delete memory:", error);
      setMemories(memories.filter((m) => m._id !== id && m.id !== id));
      setSelectedMemory(null);
    }
  };

  const addHeart = async (id) => {
    try {
      const response = await memoriesApi.addHeart(id);
      if (response.success) {
        setMemories(
          memories.map((m) =>
            m._id === id || m.id === id ? { ...m, hearts: m.hearts + 1 } : m
          )
        );
        if (
          selectedMemory &&
          (selectedMemory._id === id || selectedMemory.id === id)
        ) {
          setSelectedMemory({
            ...selectedMemory,
            hearts: selectedMemory.hearts + 1,
          });
        }
      }
    } catch (error) {
      console.error("Failed to add heart:", error);
      setMemories(
        memories.map((m) =>
          m._id === id || m.id === id ? { ...m, hearts: m.hearts + 1 } : m
        )
      );
      if (
        selectedMemory &&
        (selectedMemory._id === id || selectedMemory.id === id)
      ) {
        setSelectedMemory({
          ...selectedMemory,
          hearts: selectedMemory.hearts + 1,
        });
      }
    }
  };

  // Helper to get image URL (handles both string URLs and {url} objects)
  const getImageUrl = (img) => {
    if (typeof img === "string") return img;
    if (typeof img === "object" && img.url) return img.url;
    return "";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="font-romantic text-4xl gradient-text mb-2">
          📸 Precious Memories 📸
        </h2>
        <p className="font-sweet text-gray-500">
          Capture and cherish your beautiful moments 🌸
        </p>
      </div>

      {/* Add Memory Button */}
      {!isAdding && !selectedMemory && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full mb-8 glass rounded-3xl p-6 flex items-center justify-center gap-4 hover:scale-[1.02] transition-transform animate-slide-up group"
        >
          <span className="text-4xl group-hover:animate-wiggle">📷</span>
          <span className="font-romantic text-2xl gradient-text">
            Add New Memory
          </span>
          <span className="text-4xl group-hover:animate-heart-beat">✨</span>
        </button>
      )}

      {/* Add Memory Form */}
      {isAdding && (
        <div className="glass rounded-3xl p-6 mb-8 animate-scale-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-romantic text-2xl gradient-text">
              ✨ Create a Memory
            </h3>
            <button
              onClick={() => {
                setIsAdding(false);
                setCurrentMemory({
                  title: "",
                  description: "",
                  images: [],
                  date: "",
                });
              }}
              className="text-gray-400 hover:text-rose-400 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Title */}
          <input
            type="text"
            value={currentMemory.title}
            onChange={(e) =>
              setCurrentMemory({ ...currentMemory, title: e.target.value })
            }
            placeholder="Give this memory a sweet title... 💕"
            className="w-full p-4 rounded-2xl border-2 border-rose-100 font-sweet text-gray-700 bg-white/80 focus:border-rose-400 focus:outline-none transition-colors mb-4"
          />

          {/* Date */}
          <input
            type="date"
            value={currentMemory.date}
            onChange={(e) =>
              setCurrentMemory({ ...currentMemory, date: e.target.value })
            }
            className="w-full p-4 rounded-2xl border-2 border-rose-100 font-sweet text-gray-700 bg-white/80 focus:border-rose-400 focus:outline-none transition-colors mb-4"
          />

          {/* Description */}
          <textarea
            value={currentMemory.description}
            onChange={(e) =>
              setCurrentMemory({
                ...currentMemory,
                description: e.target.value,
              })
            }
            placeholder="Describe this beautiful moment... What made it special? 🌸"
            className="w-full p-4 rounded-2xl border-2 border-rose-100 font-sweet text-gray-700 resize-none h-32 bg-white/80 focus:border-rose-400 focus:outline-none transition-colors mb-4"
          />

          {/* Image Upload */}
          <div className="mb-6">
            <p className="font-sweet text-rose-400 mb-3 flex items-center gap-2">
              <span>📸</span> Add photos:
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
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 border-2 border-dashed border-rose-200 rounded-2xl hover:border-rose-400 hover:bg-rose-50/50 transition-all text-center"
            >
              <span className="text-4xl block mb-2">📷</span>
              <span className="font-sweet text-gray-500">
                Click to upload photos
              </span>
            </button>

            {/* Preview Images */}
            {currentMemory.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
                {currentMemory.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={getImageUrl(img)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-400 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={saveMemory}
            disabled={
              (!currentMemory.title.trim() &&
                currentMemory.images.length === 0) ||
              isSaving
            }
            className="w-full love-button text-white font-sweet text-lg py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isSaving ? "Saving..." : "Save Memory"}</span>
            <span className="text-2xl">💝</span>
          </button>
        </div>
      )}

      {/* View Selected Memory */}
      {selectedMemory && (
        <div className="glass rounded-3xl p-8 mb-8 animate-scale-in">
          <button
            onClick={() => setSelectedMemory(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-rose-400 text-2xl"
          >
            ✕
          </button>

          <div className="mb-6">
            <p className="font-sweet text-rose-400 text-sm">
              {formatDate(selectedMemory.date) ||
                formatDate(selectedMemory.createdAt)}
            </p>
            <h3 className="font-romantic text-3xl gradient-text mt-2">
              {selectedMemory.title || "A Beautiful Memory"}
            </h3>
          </div>

          {/* Images Gallery */}
          {selectedMemory.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {selectedMemory.images.map((img, index) => (
                <img
                  key={index}
                  src={getImageUrl(img)}
                  alt={`Memory ${index + 1}`}
                  className="w-full h-48 object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform cursor-pointer cat-frame"
                />
              ))}
            </div>
          )}

          {selectedMemory.description && (
            <p className="font-sweet text-gray-700 bg-rose-50/50 rounded-2xl p-4 mb-6">
              {selectedMemory.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => addHeart(selectedMemory._id || selectedMemory.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              <span className="animate-heart-beat">💕</span>
              <span className="font-sweet text-rose-500">
                {selectedMemory.hearts} Hearts
              </span>
            </button>
            <button
              onClick={() =>
                deleteMemory(selectedMemory._id || selectedMemory.id)
              }
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-400 transition-colors"
            >
              <span>🗑️</span>
              <span className="font-sweet">Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Memories Grid */}
      {!isAdding && !selectedMemory && (
        <>
          {isLoading ? (
            <div className="text-center py-16 glass rounded-3xl animate-fade-in">
              <span className="text-6xl block mb-4 animate-spin">💫</span>
              <h3 className="font-romantic text-2xl text-rose-400 mb-3">
                Loading memories...
              </h3>
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-16 glass rounded-3xl animate-fade-in">
              <span className="text-6xl block mb-4 animate-float">📸</span>
              <h3 className="font-romantic text-2xl text-rose-400 mb-3">
                No memories yet!
              </h3>
              <p className="font-sweet text-gray-500">
                Start capturing your beautiful moments 🌸
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memories.map((memory, index) => {
                const memoryId = memory._id || memory.id;
                return (
                  <div
                    key={memoryId}
                    onClick={() => setSelectedMemory(memory)}
                    className="glass rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.03] transition-all duration-300 animate-scale-in group"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Preview Image */}
                    {memory.images.length > 0 ? (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={getImageUrl(memory.images[0])}
                          alt={memory.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {memory.images.length > 1 && (
                          <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full font-sweet">
                            +{memory.images.length - 1} more
                          </span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                        <span className="text-6xl">📸</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4">
                      <p className="font-sweet text-rose-400 text-xs mb-1">
                        {formatDate(memory.date) ||
                          formatDate(memory.createdAt)}
                      </p>
                      <h4 className="font-sweet font-semibold text-gray-700 mb-2">
                        {memory.title || "A Beautiful Memory"}
                      </h4>
                      {memory.description && (
                        <p className="font-sweet text-gray-500 text-sm line-clamp-2">
                          {memory.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <span className="flex items-center gap-1 text-rose-400 font-sweet text-sm">
                          💕 {memory.hearts}
                        </span>
                        <span className="text-gray-400 text-sm font-sweet">
                          📷 {memory.images.length}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Memories;
