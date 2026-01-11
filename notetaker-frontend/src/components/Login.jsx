import React, { useState } from "react";
import { authApi } from "../services/api";

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Try API login first
      const response = await authApi.login(credentials);
      
      if (response.success) {
        // Store auth token and login state
        localStorage.setItem("sradha-auth-token", response.data.token);
        localStorage.setItem("sradha-logged-in", "true");
        localStorage.setItem("sradha-login-time", new Date().toISOString());
        onLogin(true);
      }
    } catch (apiError) {
      // Fallback to local validation if API fails
      console.log("API unavailable, using local validation");
      
      if (
        credentials.username.toLowerCase() === "sradha" &&
        credentials.password === "iloveyou"
      ) {
        localStorage.setItem("sradha-logged-in", "true");
        localStorage.setItem("sradha-login-time", new Date().toISOString());
        onLogin(true);
      } else {
        setError(apiError.message || "Oops! Wrong credentials, my love 💔");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-purple-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            <span className="text-2xl opacity-30">
              {["💕", "💖", "💗", "💝", "🌸", "✨", "🦋", "🐱"][Math.floor(Math.random() * 8)]}
            </span>
          </div>
        ))}
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Decorative Elements */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2">
          <div className="w-28 h-28 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-2xl animate-float">
            <span className="text-5xl">💝</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 pt-20 border border-white/50">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-romantic text-4xl gradient-text mb-2">
              Welcome Back
            </h1>
            <p className="font-sweet text-gray-500">
              Sradha Priyadarshini's Personal Space 💕
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="font-sweet text-gray-600 text-sm flex items-center gap-2">
                <span>👸</span> Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  className="w-full px-4 py-3 pl-12 bg-rose-50/50 border-2 border-rose-100 rounded-xl font-sweet text-gray-700 placeholder-gray-400 focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-100 transition-all"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                  💌
                </span>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="font-sweet text-gray-600 text-sm flex items-center gap-2">
                <span>🔐</span> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="w-full px-4 py-3 pl-12 pr-12 bg-rose-50/50 border-2 border-rose-100 rounded-xl font-sweet text-gray-700 placeholder-gray-400 focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-100 transition-all"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                  🔑
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-400 transition-colors"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 animate-scale-in">
                <span className="text-xl">😢</span>
                <p className="font-sweet text-red-500 text-sm">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-sweet font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 ${
                isLoading ? "opacity-80 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Enter My Space</span>
                  <span className="text-xl animate-heart-beat">💖</span>
                </>
              )}
            </button>
          </form>

          {/* Hint Section */}
          <div className="mt-8 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
            <p className="font-sweet text-center text-gray-500 text-sm">
              <span className="text-rose-400">💡 Hint:</span> Your username is your first name (lowercase) and password is something special between us 💕
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="font-sweet text-xs text-gray-400">
              Made with 💖 just for you, my love
            </p>
            <div className="flex justify-center gap-2 mt-2">
              <span className="text-lg animate-wiggle">🐱</span>
              <span className="text-lg animate-heart-beat">💕</span>
              <span className="text-lg animate-float">✨</span>
            </div>
          </div>
        </div>

        {/* Bottom Decoration */}
        <div className="flex justify-center gap-4 mt-6">
          {["🌸", "💝", "🦋", "💖", "🌸"].map((emoji, i) => (
            <span
              key={i}
              className="text-2xl animate-float opacity-60"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {emoji}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
