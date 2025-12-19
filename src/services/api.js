import axios from "axios";

// Production API URL - this should NEVER change
const PRODUCTION_API_URL = "https://api.pardistous.ir";

// Simple and bulletproof API URL determination
// Only use localhost in development when explicitly running dev server
const isDevelopment =
  typeof window !== "undefined" &&
  window.location.hostname === "localhost" &&
  window.location.port === "5174"; // Vite dev server port

export const SERVER_URL = isDevelopment
  ? "http://localhost:5000"
  : PRODUCTION_API_URL;

// Debug information (only in development)
if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  console.log("🔧 API Configuration:");
  console.log("Hostname:", window.location.hostname);
  console.log("Port:", window.location.port);
  console.log("Is Development:", isDevelopment);
  console.log("Final SERVER_URL:", SERVER_URL);
  console.log("Full API Base URL:", `${SERVER_URL}/api`);
}

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
