import axios from "axios";

// Production API URL
const PRODUCTION_API_URL = "https://api.pardistous.ir";

// Detect if running on localhost
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.includes("192.168.") ||
    window.location.hostname === "[::1]");

// Check if we're in production mode (build time)
const isProductionBuild = import.meta.env.MODE === "production";

// Define isProduction based on build mode and hostname
const isProduction = isProductionBuild || !isLocalhost;

// Logic:
// 1. If production build, ALWAYS use production URL
// 2. If localhost, use env var or localhost fallback
// 3. If deployed anywhere else, use production URL
export const SERVER_URL = isProductionBuild
  ? PRODUCTION_API_URL
  : isLocalhost
  ? import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
  : PRODUCTION_API_URL;

// Debug information
console.log("🔧 API Configuration:");
console.log(
  "Hostname:",
  typeof window !== "undefined" ? window.location.hostname : "server"
);
console.log("Is Localhost:", isLocalhost);
console.log("Is Production Build:", isProductionBuild);
console.log("Is Production:", isProduction);
console.log("Environment Mode:", import.meta.env.MODE);
console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
console.log("Production URL:", PRODUCTION_API_URL);
console.log("Final SERVER_URL:", SERVER_URL);
console.log("Full API Base URL:", `${SERVER_URL}/api`);
console.log("Is Production:", isProduction);
console.log("Environment:", import.meta.env.MODE);
console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
console.log("Final SERVER_URL:", SERVER_URL);
console.log("Full API Base URL:", `${SERVER_URL}/api`);

export const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Only redirect if not already on auth pages
      if (
        !currentPath.includes("/login") &&
        !currentPath.includes("/register")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Redirect to login after a short delay to allow error handling
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    }

    return Promise.reject(error);
  }
);
