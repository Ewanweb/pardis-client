/**
 * 🧹 Cache Manager - مدیریت کش برنامه
 * برای پاک کردن خودکار کش هنگام دیپلوی جدید
 */

class CacheManager {
  constructor() {
    // استفاده از timestamp برای اطمینان از پاک شدن کش بعد از هر دیپلوی
    this.APP_VERSION = "2026.02.07.2138"; // تاریخ و نسخه دیپلوی
    this.VERSION_KEY = "app-version";
    
    // فقط کلیدهای ضروری که باید نگه داشته شوند
    // بقیه کش‌ها به صورت خودکار پاک می‌شوند
    this.ESSENTIAL_KEYS = [
      "app-version",      // برای مدیریت نسخه
      "token",            // برای authentication (از AuthContext)
      "user",             // برای authentication (از AuthContext)
      "themeMode",        // برای تنظیمات تم (از ThemeContext)
      "colorTheme",       // برای تنظیمات تم (از ThemeContext)
      "themeManualOverride", // برای تنظیمات تم (از ThemeContext)
    ];
    
    // کلیدهای غیرضروری که باید پاک شوند
    this.CACHE_KEYS_TO_REMOVE = [
      "heroSlides",
      "featuredStories",
      "categories",
      "courses",
      "instructors",
      "user-preferences",
      "homePageData",
      "pendingPayment", // فقط برای callback - بعد از استفاده پاک می‌شود
    ];
    
    // محدودیت اندازه کش (KB)
    this.MAX_CACHE_SIZE_KB = 100; // حداکثر 100KB
  }

  /**
   * مقایسه دو version برای تشخیص نیاز به cache clear
   */
  compareVersions(version1, version2) {
    if (!version1 || !version2) return true; // اگر یکی null باشد، cache clear کن

    const v1Parts = version1.replace("v", "").split(".").map(Number);
    const v2Parts = version2.replace("v", "").split(".").map(Number);

    // مقایسه major.minor.patch
    for (let i = 0; i < 3; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part !== v2Part) {
        return true; // version تغییر کرده، cache clear کن
      }
    }

    return false; // version یکسان است
  }

  /**
   * بررسی و پاک کردن کش در صورت تغییر version
   */
  async checkAndClearCache() {
    try {
      const storedVersion = localStorage.getItem(this.VERSION_KEY);
      const needsClearCache = this.compareVersions(
        storedVersion,
        this.APP_VERSION
      );

      if (needsClearCache) {
        console.log(
          `🔄 Version changed from ${storedVersion || "none"} to ${
            this.APP_VERSION
          }`
        );
        await this.clearAllCache();
        localStorage.setItem(this.VERSION_KEY, this.APP_VERSION);

        // اطلاع‌رسانی به کاربر
        this.notifyUser(`برنامه به نسخه ${this.APP_VERSION} به‌روزرسانی شد!`);

        return true; // Cache cleared
      }

      return false; // No cache clearing needed
    } catch (error) {
      console.error("❌ Cache check failed:", error);
      return false;
    }
  }

  /**
   * پاک کردن تمام کش‌های غیرضروری localStorage
   */
  async clearAllCache() {
    try {
      console.log("🧹 Clearing non-essential cache...");

      // 1. پاک کردن کش‌های غیرضروری
      this.CACHE_KEYS_TO_REMOVE.forEach((key) => {
        localStorage.removeItem(key);
        console.log(`✅ Cleared localStorage: ${key}`);
      });

      // 2. پاک کردن تمام cache_* keys (از performanceOptimizations)
      const allKeys = Object.keys(localStorage);
      allKeys.forEach((key) => {
        if (key.startsWith("cache_") && !this.ESSENTIAL_KEYS.includes(key)) {
          localStorage.removeItem(key);
          console.log(`✅ Cleared cache key: ${key}`);
        }
      });

      // 3. پاک کردن sessionStorage (فقط داده‌های غیرضروری)
      // sessionStorage معمولاً برای داده‌های موقت است، پس پاک می‌کنیم
      sessionStorage.clear();
      console.log("✅ Cleared sessionStorage");

      // 4. پاک کردن Service Worker cache
      if ("serviceWorker" in navigator && "caches" in window) {
        await this.clearServiceWorkerCache();
      }

      // 5. پاک کردن IndexedDB (اگر استفاده می‌شود)
      await this.clearIndexedDB();

      // 6. بررسی و پاک کردن کش‌های بزرگ
      await this.cleanupLargeCache();

      console.log("✅ Non-essential cache cleared successfully");
    } catch (error) {
      console.error("❌ Failed to clear cache:", error);
    }
  }
  
  /**
   * پاک کردن کش‌های بزرگ
   */
  async cleanupLargeCache() {
    try {
      const cacheSize = await this.getCacheSize();
      if (parseFloat(cacheSize.kb) > this.MAX_CACHE_SIZE_KB) {
        console.log(`⚠️ Cache size (${cacheSize.kb}KB) exceeds limit (${this.MAX_CACHE_SIZE_KB}KB)`);
        
        // پاک کردن قدیمی‌ترین کش‌ها
        const allKeys = Object.keys(localStorage);
        const cacheItems = [];
        
        allKeys.forEach((key) => {
          if (!this.ESSENTIAL_KEYS.includes(key)) {
            try {
              const value = localStorage.getItem(key);
              const size = new Blob([value]).size;
              cacheItems.push({ key, size, value });
            } catch (e) {
              // Ignore errors
            }
          }
        });
        
        // مرتب‌سازی بر اساس اندازه (بزرگ‌ترین اول)
        cacheItems.sort((a, b) => b.size - a.size);
        
        // پاک کردن تا زمانی که اندازه کش کمتر از حد مجاز شود
        let currentSize = parseFloat(cacheSize.kb);
        for (const item of cacheItems) {
          if (currentSize <= this.MAX_CACHE_SIZE_KB) break;
          localStorage.removeItem(item.key);
          currentSize -= item.size / 1024;
          console.log(`🗑️ Removed large cache: ${item.key} (${(item.size / 1024).toFixed(2)}KB)`);
        }
      }
    } catch (error) {
      console.error("❌ Failed to cleanup large cache:", error);
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
      let essentialSize = 0;
      let nonEssentialSize = 0;

      // محاسبه اندازه localStorage
      for (let key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          const size = new Blob([localStorage[key]]).size;
          totalSize += size;
          
          if (this.ESSENTIAL_KEYS.includes(key)) {
            essentialSize += size;
          } else {
            nonEssentialSize += size;
          }
        }
      }

      // محاسبه اندازه sessionStorage
      for (let key in sessionStorage) {
        if (Object.prototype.hasOwnProperty.call(sessionStorage, key)) {
          const size = new Blob([sessionStorage[key]]).size;
          totalSize += size;
          nonEssentialSize += size; // sessionStorage معمولاً غیرضروری است
        }
      }

      // تبدیل به KB
      const sizeInKB = (totalSize / 1024).toFixed(2);
      const essentialKB = (essentialSize / 1024).toFixed(2);
      const nonEssentialKB = (nonEssentialSize / 1024).toFixed(2);

      return {
        bytes: totalSize,
        kb: sizeInKB,
        mb: (sizeInKB / 1024).toFixed(2),
        essential: {
          bytes: essentialSize,
          kb: essentialKB,
        },
        nonEssential: {
          bytes: nonEssentialSize,
          kb: nonEssentialKB,
        },
      };
    } catch (error) {
      console.error("❌ Failed to calculate cache size:", error);
      return { bytes: 0, kb: 0, mb: 0, essential: { bytes: 0, kb: 0 }, nonEssential: { bytes: 0, kb: 0 } };
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
cacheManager.checkAndClearCache().then(() => {
  // بعد از پاک کردن کش، اندازه را بررسی کن
  cacheManager.getCacheSize().then((size) => {
    if (parseFloat(size.kb) > 50) {
      console.warn(`⚠️ Cache size is ${size.kb}KB. Consider cleaning up.`);
    }
  });
});

export default cacheManager;
