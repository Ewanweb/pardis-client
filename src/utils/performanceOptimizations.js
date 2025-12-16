// بهینه‌سازی‌های عملکرد و رفع مشکلات

export const initPerformanceOptimizations = () => {
  // بررسی و رفع مشکلات Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "SW_ERROR") {
        console.warn("Service Worker Error:", event.data.error);
      }
    });
  }

  // بهینه‌سازی بارگذاری فونت
  if (document.fonts) {
    document.fonts.ready.then(() => {
      console.log("✅ Fonts loaded successfully");
    });
  }

  // بررسی وضعیت PWA
  window.addEventListener("beforeinstallprompt", (e) => {
    console.log("✅ PWA install prompt available");
    // می‌توانید prompt را ذخیره کنید برای استفاده بعدی
    window.deferredPrompt = e;
  });

  // مدیریت حالت آفلاین
  window.addEventListener("online", () => {
    console.log("✅ Back online");
    // می‌توانید notification نمایش دهید
  });

  window.addEventListener("offline", () => {
    console.log("⚠️ Gone offline");
    // می‌توانید notification نمایش دهید
  });

  // بهینه‌سازی اسکرول
  let ticking = false;
  const optimizeScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        // عملیات‌های مربوط به اسکرول
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", optimizeScroll, { passive: true });

  // بهینه‌سازی resize
  let resizeTimeout;
  const optimizeResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // عملیات‌های مربوط به resize
      console.log("Window resized");
    }, 150);
  };

  window.addEventListener("resize", optimizeResize);

  console.log("✅ Performance optimizations initialized");
};

// تشخیص نوع دستگاه
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);

  return {
    isMobile,
    isIOS,
    isAndroid,
    isDesktop: !isMobile,
    supportsTouch: "ontouchstart" in window,
    supportsServiceWorker: "serviceWorker" in navigator,
    supportsPWA: "serviceWorker" in navigator && "PushManager" in window,
  };
};

// بهینه‌سازی تصاویر
export const optimizeImage = (src, options = {}) => {
  const { width = 800, quality = 80, format = "webp" } = options;

  // اگر تصویر از CDN است، پارامترهای بهینه‌سازی اضافه کن
  if (
    src.includes("cdn.") ||
    src.includes("cloudinary") ||
    src.includes("imagekit")
  ) {
    // برای CDN های مختلف می‌توانید پارامترهای مخصوص اضافه کنید
    return src;
  }

  return src;
};

// مدیریت کش
export const cacheManager = {
  set: (key, data, ttl = 3600000) => {
    // 1 hour default
    const item = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(item));
  },

  get: (key) => {
    try {
      const item = JSON.parse(localStorage.getItem(`cache_${key}`));
      if (!item) return null;

      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  },

  clear: (pattern) => {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("cache_") && (!pattern || key.includes(pattern))) {
        localStorage.removeItem(key);
      }
    });
  },
};

// بررسی وضعیت شبکه
export const networkStatus = {
  isOnline: () => navigator.onLine,

  getConnectionInfo: () => {
    if ("connection" in navigator) {
      const conn = navigator.connection;
      return {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData,
      };
    }
    return null;
  },

  isFastConnection: () => {
    const conn = networkStatus.getConnectionInfo();
    if (!conn) return true; // فرض کنیم اتصال سریع است

    return conn.effectiveType === "4g" || conn.downlink > 1.5;
  },
};

export default {
  initPerformanceOptimizations,
  getDeviceInfo,
  optimizeImage,
  cacheManager,
  networkStatus,
};
