import React, { useState, useEffect } from "react";
import { todosApi } from "../services/api";

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [priority, setPriority] = useState("normal");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const priorities = [
    {
      id: "low",
      name: "Low",
      emoji: "🌱",
      color: "from-green-200 to-emerald-200",
    },
    {
      id: "normal",
      name: "Normal",
      emoji: "🌸",
      color: "from-blue-200 to-cyan-200",
    },
    {
      id: "high",
      name: "High",
      emoji: "⭐",
      color: "from-yellow-200 to-orange-200",
    },
    {
      id: "urgent",
      name: "Urgent",
      emoji: "💫",
      color: "from-rose-200 to-pink-200",
    },
  ];

  // Fetch todos from API
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const response = await todosApi.getAll();
      if (response.success) {
        setTodos(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch todos:", error);
      const saved = localStorage.getItem("sradha-todos");
      if (saved) setTodos(JSON.parse(saved));
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (newTodo.trim()) {
      setIsAdding(true);
      try {
        const response = await todosApi.create({
          text: newTodo,
          priority: priority,
        });
        if (response.success) {
          setTodos([response.data, ...todos]);
        }
      } catch (error) {
        console.error("Failed to add todo:", error);
        const todo = {
          id: Date.now(),
          text: newTodo,
          priority: priority,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        const updatedTodos = [todo, ...todos];
        setTodos(updatedTodos);
        localStorage.setItem("sradha-todos", JSON.stringify(updatedTodos));
      } finally {
        setNewTodo("");
        setPriority("normal");
        setIsAdding(false);
      }
    }
  };

  const toggleTodo = async (id) => {
    try {
      const response = await todosApi.toggle(id);
      if (response.success) {
        setTodos(
          todos.map((todo) =>
            (todo._id === id || todo.id === id) ? { ...todo, completed: !todo.completed } : todo
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle todo:", error);
      setTodos(
        todos.map((todo) =>
          (todo._id === id || todo.id === id) ? { ...todo, completed: !todo.completed } : todo
        )
      );
    }
  };

  const deleteTodo = async (id) => {
    try {
      await todosApi.delete(id);
      setTodos(todos.filter((todo) => todo._id !== id && todo.id !== id));
    } catch (error) {
      console.error("Failed to delete todo:", error);
      setTodos(todos.filter((todo) => todo._id !== id && todo.id !== id));
    }
  };

  const clearCompleted = async () => {
    try {
      await todosApi.clearCompleted();
      setTodos(todos.filter((todo) => !todo.completed));
    } catch (error) {
      console.error("Failed to clear completed:", error);
      setTodos(todos.filter((todo) => !todo.completed));
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = todos.filter((t) => !t.completed).length;

  const getPriorityData = (priorityId) => {
    return priorities.find((p) => p.id === priorityId) || priorities[1];
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="font-romantic text-4xl gradient-text mb-2">
          ✅ To-Do List ✅
        </h2>
        <p className="font-sweet text-gray-500">
          Stay organized and accomplish your dreams! 🌟
        </p>
      </div>

      {/* Progress Bar */}
      <div className="glass rounded-2xl p-4 mb-6 animate-slide-up">
        <div className="flex items-center justify-between mb-2">
          <span className="font-sweet text-gray-600">Your Progress</span>
          <span className="font-sweet text-rose-500">
            {completedCount}/{todos.length} completed
          </span>
        </div>
        <div className="h-3 bg-rose-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-pink-400 rounded-full transition-all duration-500"
            style={{
              width:
                todos.length > 0
                  ? `${(completedCount / todos.length) * 100}%`
                  : "0%",
            }}
          />
        </div>
        {completedCount === todos.length && todos.length > 0 && (
          <p className="text-center font-sweet text-rose-500 mt-2 animate-scale-in">
            🎉 Amazing! You completed everything! 🎉
          </p>
        )}
      </div>

      {/* Add Todo Form */}
      <form
        onSubmit={addTodo}
        className="glass rounded-2xl p-4 mb-6 animate-slide-up"
      >
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="What would you like to do today? ✨"
            className="flex-1 p-4 rounded-xl border-2 border-rose-100 font-sweet text-gray-700 bg-white/80 focus:border-rose-400 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!newTodo.trim() || isAdding}
            className="px-6 love-button text-white font-sweet rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "..." : "Add ✨"}
          </button>
        </div>

        {/* Priority Selection */}
        <div className="flex gap-2 flex-wrap">
          <span className="font-sweet text-gray-500 mr-2">Priority:</span>
          {priorities.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPriority(p.id)}
              className={`px-3 py-1 rounded-full font-sweet text-sm flex items-center gap-1 transition-all ${
                priority === p.id
                  ? `bg-gradient-to-r ${p.color} scale-105`
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <span>{p.emoji}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 justify-center animate-slide-up">
        {[
          { id: "all", name: "All", count: todos.length },
          { id: "active", name: "Active", count: activeCount },
          { id: "completed", name: "Done", count: completedCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-full font-sweet text-sm transition-all ${
              filter === tab.id
                ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white"
                : "bg-white/80 hover:bg-rose-50 text-gray-600"
            }`}
          >
            {tab.name} ({tab.count})
          </button>
        ))}
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 glass rounded-3xl animate-fade-in">
            <span className="text-4xl block mb-4 animate-spin">💫</span>
            <p className="font-sweet text-gray-500">Loading your tasks...</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-12 glass rounded-3xl animate-fade-in">
            <span className="text-6xl block mb-4">
              {filter === "completed" ? "🎉" : "📝"}
            </span>
            <p className="font-sweet text-gray-500">
              {filter === "completed"
                ? "No completed tasks yet. Keep going! 💪"
                : filter === "active"
                ? "All done! Time to relax 🌸"
                : "No tasks yet. Add something wonderful! ✨"}
            </p>
          </div>
        ) : (
          filteredTodos.map((todo, index) => {
            const priorityData = getPriorityData(todo.priority);
            const todoId = todo._id || todo.id;
            return (
              <div
                key={todoId}
                className={`group p-4 rounded-2xl transition-all duration-300 animate-scale-in ${
                  todo.completed
                    ? "bg-gray-50 opacity-60"
                    : `bg-gradient-to-r ${priorityData.color}`
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleTodo(todoId)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      todo.completed
                        ? "bg-green-400 border-green-400 text-white"
                        : "border-gray-300 hover:border-rose-400 hover:bg-rose-50"
                    }`}
                  >
                    {todo.completed && "✓"}
                  </button>

                  <div className="flex-1">
                    <p
                      className={`font-sweet ${
                        todo.completed
                          ? "line-through text-gray-400"
                          : "text-gray-700"
                      }`}
                    >
                      {todo.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm">{priorityData.emoji}</span>
                      <span className="font-sweet text-xs text-gray-400">
                        {priorityData.name}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTodo(todoId)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all text-xl"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Clear Completed Button */}
      {completedCount > 0 && (
        <button
          onClick={clearCompleted}
          className="w-full mt-6 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-sweet text-gray-500 transition-colors"
        >
          🧹 Clear completed tasks ({completedCount})
        </button>
      )}

      {/* Motivational Message */}
      {activeCount > 0 && (
        <div className="text-center mt-8 animate-fade-in">
          <p className="font-sweet text-rose-400">
            You've got {activeCount} task{activeCount > 1 ? "s" : ""} to go. You
            can do it! 💪✨
          </p>
        </div>
      )}
    </div>
  );
};

export default TodoList;
