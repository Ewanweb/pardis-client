import axios from "axios";

// Production API URL
const PRODUCTION_API_URL = "https://api.pardistous.ir";

// Detect if running on localhost
const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('192.168.') ||
    window.location.hostname === '[::1]');

// Define isProduction based on the new localhost detection
const isProduction = !isLocalhost;

// Logic: If explicitly localhost, try env var or localhost fallback.
// If NOT localhost (meaning deployed anywhere), FORCE production URL.
export const SERVER_URL = isLocalhost
  ? (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  : PRODUCTION_API_URL;

// Debug information
console.log("🔧 API Configuration:");
console.log("Hostname:", typeof window !== 'undefined' ? window.location.hostname : 'server');
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
