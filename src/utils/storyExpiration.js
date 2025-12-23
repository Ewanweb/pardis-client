/**
 * Story and Slide Expiration Management Utilities
 * مدیریت انقضای استوری‌ها و اسلایدها
 */

/**
 * Check if a story/slide is expired
 * @param {Object} item - Story or slide object
 * @returns {boolean} - True if expired
 */
export const isExpired = (item) => {
  if (!item) return true;

  // Permanent items never expire
  if (item.storyType === "permanent" || item.slideType === "permanent") {
    return false;
  }

  // Check if item has expiration date
  if (!item.expiresAt) return false;

  const now = new Date();
  const expirationDate = new Date(item.expiresAt);

  return now > expirationDate;
};

/**
 * Filter out expired items from an array
 * @param {Array} items - Array of stories or slides
 * @returns {Array} - Filtered array without expired items
 */
export const filterExpiredItems = (items) => {
  if (!Array.isArray(items)) return [];

  return items.filter((item) => !isExpired(item));
};

/**
 * Get remaining time for a temporary item
 * @param {Object} item - Story or slide object
 * @returns {Object} - Object with remaining time info
 */
export const getRemainingTime = (item) => {
  if (!item || !item.expiresAt) {
    return { expired: true, timeLeft: 0, hours: 0, minutes: 0 };
  }

  const now = new Date();
  const expirationDate = new Date(item.expiresAt);
  const timeLeft = expirationDate - now;

  if (timeLeft <= 0) {
    return { expired: true, timeLeft: 0, hours: 0, minutes: 0 };
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return {
    expired: false,
    timeLeft,
    hours,
    minutes,
    formatted: `${hours}:${minutes.toString().padStart(2, "0")}`,
  };
};

/**
 * Create expiration date for temporary items (24 hours from now)
 * @returns {string} - ISO string of expiration date
 */
export const createExpirationDate = () => {
  const now = new Date();
  const expiration = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  return expiration.toISOString();
};

/**
 * Clean up expired items from localStorage
 * @param {string} storageKey - localStorage key
 */
export const cleanupExpiredItems = (storageKey) => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;

    const items = JSON.parse(stored);
    const validItems = filterExpiredItems(items);

    // Only update if there were expired items
    if (validItems.length !== items.length) {
      localStorage.setItem(storageKey, JSON.stringify(validItems));
      console.log(
        `Cleaned up ${
          items.length - validItems.length
        } expired items from ${storageKey}`
      );
    }
  } catch (error) {
    console.error("Error cleaning up expired items:", error);
  }
};

/**
 * Auto cleanup expired items on app start
 */
export const initExpirationCleanup = () => {
  // Clean up expired items
  cleanupExpiredItems("heroSlides");
  cleanupExpiredItems("successStories");

  // Set up periodic cleanup (every hour)
  setInterval(() => {
    cleanupExpiredItems("heroSlides");
    cleanupExpiredItems("successStories");
  }, 60 * 60 * 1000); // 1 hour
};

/**
 * Get story type badge color
 * @param {string} storyType - 'permanent' or 'temporary'
 * @returns {string} - CSS classes for badge styling
 */
export const getStoryTypeBadge = (storyType) => {
  switch (storyType) {
    case "permanent":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "temporary":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

/**
 * Get story type label in Persian
 * @param {string} storyType - 'permanent' or 'temporary'
 * @returns {string} - Persian label
 */
export const getStoryTypeLabel = (storyType) => {
  switch (storyType) {
    case "permanent":
      return "دائمی";
    case "temporary":
      return "موقت";
    default:
      return "نامشخص";
  }
};
