import { api } from "../services/api";
import { requestCache } from "./requestCache";

// Initialize request cache with API instance
requestCache.setApiInstance(api);

export const waitForFonts = () => {
  const root = document.documentElement;

  if (!document?.fonts?.ready) {
    root.classList.add("fonts-loaded");
    return Promise.resolve();
  }

  return document.fonts.ready
    .then(() => {
      root.classList.add("fonts-loaded");
    })
    .catch(() => {
      root.classList.add("fonts-failed");
    });
};

// ✅ OPTIMIZATION: Removed global data preloading
// Each route now fetches its own data independently
// This prevents blocking the entire app on data that might not be needed
