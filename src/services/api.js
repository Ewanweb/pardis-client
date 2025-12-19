import axios from "axios";

// Production API URL - this should NEVER change
const PRODUCTION_API_URL = "https://api.pardistous.ir";

// Detect if running on localhost during development
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.includes("192.168.") ||
    window.location.hostname === "[::1]");

// Check if we're in production mode (multiple checks for reliability)
const isProductionBuild =
  import.meta.env.MODE === "production" ||
  import.meta.env.PROD === true ||
  process.env.NODE_ENV === "production";

// Check if we're running on a production domain
const isProductionDomain =
  typeof window !== "undefined" &&
  (window.location.hostname.includes("pardistous.ir") ||
    window.location.hostname.includes("production") ||
    !isLocalhost);

// BULLETPROOF API URL DETERMINATION
// If ANY of these conditions are true, use production API:
// 1. Running on production domain
// 2. Production build detected
// 3. Environment variable explicitly set to production URL
// 4. NOT running on localhost (fallback safety)
const shouldUseProductionAPI =
  isProductionDomain ||
  isProductionBuild ||
  import.meta.env.VITE_API_BASE_URL === PRODUCTION_API_URL ||
  !isLocalhost;

export const SERVER_URL = shouldUseProductionAPI
  ? PRODUCTION_API_URL
  : import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Debug information (only in development)
if (import.meta.env.DEV) {
  console.log("🔧 API Configuration:");
  console.log(
    "Hostname:",
    typeof window !== "undefined" ? window.location.hostname : "server"
  );
  console.log("Is Localhost:", isLocalhost);
  console.log("Is Production Build:", isProductionBuild);
  console.log("Is Production Domain:", isProductionDomain);
  console.log("Should Use Production API:", shouldUseProductionAPI);
  console.log("Environment Mode:", import.meta.env.MODE);
  console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
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
