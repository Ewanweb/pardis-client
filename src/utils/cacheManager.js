/**
 * 🧹 Cache Manager - مدیریت کش برنامه
 * برای پاک کردن کش هنگام دیپلوی جدید
 */

class CacheManager {
  constructor() {
    this.APP_VERSION = "2.0.0"; // این را با هر دیپلوی جدید تغییر دهید
    this.VERSION_KEY = "app-version";
    this.CACHE_KEYS = [
      "heroSlides",
      "featuredStories",
      "categories",
      "courses",
      "instructors",
      "user-preferences",
      "theme-settings",
    ];
  }

  /**
   * بررسی و پاک کردن کش در صورت تغییر version
   */
  async checkAndClearCache() {
    try {
      const storedVersion = localStorage.getItem(this.VERSION_KEY);

      if (storedVersion !== this.APP_VERSION) {
        console.log(
          `🔄 Version changed from ${storedVersion} to ${this.APP_VERSION}`
        );
        await this.clearAllCache();
        localStorage.setItem(this.VERSION_KEY, this.APP_VERSION);

        // اطلاع‌رسانی به کاربر
        this.notifyUser("برنامه به‌روزرسانی شد! کش پاک شده است.");

        return true; // Cache cleared
      }

      return false; // No cache clearing needed
    } catch (error) {
      console.error("❌ Cache check failed:", error);
      return false;
    }
  }

  /**
   * پاک کردن تمام کش‌های localStorage
   */
  async clearAllCache() {
    try {
      console.log("🧹 Clearing all application cache...");

      // 1. پاک کردن localStorage
      this.CACHE_KEYS.forEach((key) => {
        localStorage.removeItem(key);
        console.log(`✅ Cleared localStorage: ${key}`);
      });

      // 2. پاک کردن sessionStorage
      sessionStorage.clear();
      console.log("✅ Cleared sessionStorage");

      // 3. پاک کردن Service Worker cache
      if ("serviceWorker" in navigator && "caches" in window) {
        await this.clearServiceWorkerCache();
      }

      // 4. پاک کردن IndexedDB (اگر استفاده می‌شود)
      await this.clearIndexedDB();

      console.log("✅ All cache cleared successfully");
    } catch (error) {
      console.error("❌ Failed to clear cache:", error);
    }
  }

  /**
   * پاک کردن Service Worker cache
   */
  async clearServiceWorkerCache() {
    try {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        // ارسال پیام به Service Worker برای پاک کردن کش
        const messageChannel = new MessageChannel();

        return new Promise((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            if (event.data.success) {
              console.log("✅ Service Worker cache cleared");
            }
            resolve();
          };

          navigator.serviceWorker.controller.postMessage(
            { type: "CLEAR_CACHE" },
            [messageChannel.port2]
          );
        });
      }
    } catch (error) {
      console.error("❌ Failed to clear Service Worker cache:", error);
    }
  }

  /**
   * پاک کردن IndexedDB
   */
  async clearIndexedDB() {
    try {
      if ("indexedDB" in window) {
        // لیست دیتابیس‌های احتمالی
        const dbNames = ["pardis-cache", "app-data", "user-data"];

        for (const dbName of dbNames) {
          try {
            const deleteReq = indexedDB.deleteDatabase(dbName);
            await new Promise((resolve, reject) => {
              deleteReq.onsuccess = () => resolve();
              deleteReq.onerror = () => reject(deleteReq.error);
            });
            console.log(`✅ Cleared IndexedDB: ${dbName}`);
          } catch {
            // Database might not exist, ignore error
          }
        }
      }
    } catch (error) {
      console.error("❌ Failed to clear IndexedDB:", error);
    }
  }

  /**
   * اجباری پاک کردن کش (برای دکمه manual refresh)
   */
  async forceClearCache() {
    await this.clearAllCache();

    // Reload page after clearing cache
    setTimeout(() => {
      window.location.reload(true); // Hard reload
    }, 1000);
  }

  /**
   * بررسی اندازه کش
   */
  async getCacheSize() {
    try {
      let totalSize = 0;

      // محاسبه اندازه localStorage
      for (let key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          totalSize += localStorage[key].length;
        }
      }

      // محاسبه اندازه sessionStorage
      for (let key in sessionStorage) {
        if (Object.prototype.hasOwnProperty.call(sessionStorage, key)) {
          totalSize += sessionStorage[key].length;
        }
      }

      // تبدیل به KB
      const sizeInKB = (totalSize / 1024).toFixed(2);

      return {
        bytes: totalSize,
        kb: sizeInKB,
        mb: (sizeInKB / 1024).toFixed(2),
      };
    } catch (error) {
      console.error("❌ Failed to calculate cache size:", error);
      return { bytes: 0, kb: 0, mb: 0 };
    }
  }

  /**
   * اطلاع‌رسانی به کاربر
   */
  notifyUser(message) {
    // اگر toast library موجود است
    if (typeof window !== "undefined" && window.toast) {
      window.toast.success(message);
    } else {
      console.log("📢", message);
    }
  }

  /**
   * تنظیم version جدید (برای استفاده در build process)
   */
  setVersion(newVersion) {
    this.APP_VERSION = newVersion;
    localStorage.setItem(this.VERSION_KEY, newVersion);
  }

  /**
   * دریافت version فعلی
   */
  getCurrentVersion() {
    return {
      app: this.APP_VERSION,
      stored: localStorage.getItem(this.VERSION_KEY),
    };
  }
}

// Export instance
export const cacheManager = new CacheManager();

// Auto-check cache on import
cacheManager.checkAndClearCache();

export default cacheManager;
