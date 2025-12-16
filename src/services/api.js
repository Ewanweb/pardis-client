import axios from "axios";

export const SERVER_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.pardistous.ir";

// Debug information
console.log("🔧 API Configuration:");
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
