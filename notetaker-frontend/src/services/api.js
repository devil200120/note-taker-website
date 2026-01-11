// API Service for Sradha's Note Taker App 💕
// Connects frontend to backend with love!

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get auth token from localStorage
const getToken = () => localStorage.getItem("sradha-auth-token");

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong 😿");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// ==================== AUTH API ====================
export const authApi = {
  // Login
  login: (credentials) =>
    apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  // Verify token
  verify: () => apiCall("/auth/verify"),

  // Logout
  logout: () => apiCall("/auth/logout", { method: "POST" }),
};

// ==================== NOTES API ====================
export const notesApi = {
  // Get all notes
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/notes${queryString ? `?${queryString}` : ""}`);
  },

  // Get single note
  getOne: (id) => apiCall(`/notes/${id}`),

  // Create note
  create: (noteData) =>
    apiCall("/notes", {
      method: "POST",
      body: JSON.stringify(noteData),
    }),

  // Update note
  update: (id, noteData) =>
    apiCall(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(noteData),
    }),

  // Toggle love
  toggleLove: (id) =>
    apiCall(`/notes/${id}/love`, {
      method: "PATCH",
    }),

  // Toggle pin
  togglePin: (id) =>
    apiCall(`/notes/${id}/pin`, {
      method: "PATCH",
    }),

  // Toggle archive
  toggleArchive: (id) =>
    apiCall(`/notes/${id}/archive`, {
      method: "PATCH",
    }),

  // Duplicate note
  duplicate: (id) =>
    apiCall(`/notes/${id}/duplicate`, {
      method: "POST",
    }),

  // Delete note
  delete: (id) =>
    apiCall(`/notes/${id}`, {
      method: "DELETE",
    }),
};

// ==================== MOODS API ====================
export const moodsApi = {
  // Get all moods
  getAll: () => apiCall("/moods"),

  // Get mood stats
  getStats: () => apiCall("/moods/stats"),

  // Create mood
  create: (moodData) =>
    apiCall("/moods", {
      method: "POST",
      body: JSON.stringify(moodData),
    }),

  // Delete mood
  delete: (id) =>
    apiCall(`/moods/${id}`, {
      method: "DELETE",
    }),
};

// ==================== LETTERS API ====================
export const lettersApi = {
  // Get all letters
  getAll: () => apiCall("/letters"),

  // Get single letter
  getOne: (id) => apiCall(`/letters/${id}`),

  // Create letter
  create: (letterData) =>
    apiCall("/letters", {
      method: "POST",
      body: JSON.stringify(letterData),
    }),

  // Mark as read
  markAsRead: (id) =>
    apiCall(`/letters/${id}/read`, {
      method: "PATCH",
    }),

  // Add heart
  addHeart: (id) =>
    apiCall(`/letters/${id}/heart`, {
      method: "PATCH",
    }),

  // Delete letter
  delete: (id) =>
    apiCall(`/letters/${id}`, {
      method: "DELETE",
    }),
};

// ==================== MEMORIES API ====================
export const memoriesApi = {
  // Get all memories
  getAll: () => apiCall("/memories"),

  // Get single memory
  getOne: (id) => apiCall(`/memories/${id}`),

  // Create memory
  create: (memoryData) =>
    apiCall("/memories", {
      method: "POST",
      body: JSON.stringify(memoryData),
    }),

  // Add heart
  addHeart: (id) =>
    apiCall(`/memories/${id}/heart`, {
      method: "PATCH",
    }),

  // Delete memory
  delete: (id) =>
    apiCall(`/memories/${id}`, {
      method: "DELETE",
    }),
};

// ==================== TODOS API ====================
export const todosApi = {
  // Get all todos
  getAll: (filter) =>
    apiCall(`/todos${filter ? `?filter=${filter}` : ""}`),

  // Create todo
  create: (todoData) =>
    apiCall("/todos", {
      method: "POST",
      body: JSON.stringify(todoData),
    }),

  // Toggle todo
  toggle: (id) =>
    apiCall(`/todos/${id}/toggle`, {
      method: "PATCH",
    }),

  // Delete todo
  delete: (id) =>
    apiCall(`/todos/${id}`, {
      method: "DELETE",
    }),

  // Clear completed
  clearCompleted: () =>
    apiCall("/todos/completed/clear", {
      method: "DELETE",
    }),
};

// ==================== EVENTS API ====================
export const eventsApi = {
  // Get all events
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/events${queryString ? `?${queryString}` : ""}`);
  },

  // Get events for date
  getByDate: (date) => apiCall(`/events/date/${date}`),

  // Create event
  create: (eventData) =>
    apiCall("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    }),

  // Update event
  update: (id, eventData) =>
    apiCall(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    }),

  // Delete event
  delete: (id) =>
    apiCall(`/events/${id}`, {
      method: "DELETE",
    }),
};

// ==================== UPLOAD API ====================
export const uploadApi = {
  // Upload single base64 image
  uploadBase64: (image, folder) =>
    apiCall("/upload/base64", {
      method: "POST",
      body: JSON.stringify({ image, folder }),
    }),

  // Upload image file to Cloudinary
  uploadImage: async (file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("image", file);
    
    const response = await fetch(`${API_URL}/upload/image`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }
    // Return with url for compatibility
    return {
      success: data.success,
      url: data.data?.url || data.data?.secure_url || data.url,
      data: data.data,
    };
  },

  // Upload multiple images
  uploadMultiple: (images, folder) =>
    apiCall("/upload/multiple", {
      method: "POST",
      body: JSON.stringify({ images, folder }),
    }),

  // Delete image
  delete: (publicId) =>
    apiCall(`/upload/${publicId}`, {
      method: "DELETE",
    }),
};

// ==================== STUDY NOTES API ====================
export const studyApi = {
  // Get all sections
  getSections: () => apiCall("/study/sections"),

  // Create section
  createSection: (sectionData) =>
    apiCall("/study/sections", {
      method: "POST",
      body: JSON.stringify(sectionData),
    }),

  // Update section
  updateSection: (id, sectionData) =>
    apiCall(`/study/sections/${id}`, {
      method: "PUT",
      body: JSON.stringify(sectionData),
    }),

  // Delete section
  deleteSection: (id) =>
    apiCall(`/study/sections/${id}`, {
      method: "DELETE",
    }),

  // Get all PDFs (with optional filters)
  getPdfs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/study/pdfs${queryString ? `?${queryString}` : ""}`);
  },

  // Get single PDF (with file data)
  getPdf: (id) => apiCall(`/study/pdfs/${id}`),

  // Upload PDF
  uploadPdf: (pdfData) =>
    apiCall("/study/pdfs", {
      method: "POST",
      body: JSON.stringify(pdfData),
    }),

  // Update PDF
  updatePdf: (id, pdfData) =>
    apiCall(`/study/pdfs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(pdfData),
    }),

  // Toggle PDF favorite
  toggleFavorite: (id) =>
    apiCall(`/study/pdfs/${id}/favorite`, {
      method: "PATCH",
    }),

  // Delete PDF
  deletePdf: (id) =>
    apiCall(`/study/pdfs/${id}`, {
      method: "DELETE",
    }),
};

// Export default object with all APIs
export default {
  auth: authApi,
  notes: notesApi,
  moods: moodsApi,
  letters: lettersApi,
  memories: memoriesApi,
  todos: todosApi,
  events: eventsApi,
  upload: uploadApi,
  study: studyApi,
};
