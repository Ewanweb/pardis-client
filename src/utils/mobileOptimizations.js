// بهینه‌سازی‌های عملکرد برای موبایل

// تشخیص نوع دستگاه
export const detectDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  return {
    isMobile:
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent
      ),
    isIOS: /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream,
    isAndroid: /android/i.test(userAgent),
    isSafari: /safari/i.test(userAgent) && !/chrome/i.test(userAgent),
    isChrome: /chrome/i.test(userAgent),
    isFirefox: /firefox/i.test(userAgent),
    isTouchDevice: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
  };
};

// بهینه‌سازی تصاویر برای موبایل
export const optimizeImageForMobile = (src, options = {}) => {
  const device = detectDevice();
  const {
    quality = device.isMobile ? 80 : 90,
    format = "webp",
    width,
    height,
    lazy = true,
  } = options;

  // اگر تصویر از CDN یا سرویس بهینه‌سازی استفاده می‌کند
  if (src.includes("cloudinary") || src.includes("imagekit")) {
    let optimizedSrc = src;

    // اضافه کردن پارامترهای بهینه‌سازی
    if (width) optimizedSrc += `?w=${width}`;
    if (height) optimizedSrc += `${width ? "&" : "?"}h=${height}`;
    if (quality) optimizedSrc += `${width || height ? "&" : "?"}q=${quality}`;
    if (format)
      optimizedSrc += `${width || height || quality ? "&" : "?"}f=${format}`;

    return optimizedSrc;
  }

  return src;
};

// Lazy loading برای تصاویر
export const setupLazyLoading = () => {
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }
};

// بهینه‌سازی اسکرول برای موبایل
export const optimizeScrolling = () => {
  // فعال‌سازی smooth scrolling برای iOS
  if (detectDevice().isIOS) {
    document.body.style.webkitOverflowScrolling = "touch";
  }

  // جلوگیری از bounce effect در iOS
  document.addEventListener(
    "touchmove",
    (e) => {
      if (e.target.closest(".prevent-bounce")) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
};

// بهینه‌سازی touch events
export const optimizeTouchEvents = () => {
  // اضافه کردن کلاس hover فقط برای دستگاه‌های غیر لمسی
  if (!detectDevice().isTouchDevice) {
    document.body.classList.add("no-touch");
  }

  // بهبود tap delay در iOS
  if (detectDevice().isIOS) {
    document.addEventListener("touchstart", () => {}, { passive: true });
  }
};

// مدیریت viewport برای موبایل
export const setupMobileViewport = () => {
  const device = detectDevice();

  // تنظیم viewport meta tag
  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement("meta");
    viewport.name = "viewport";
    document.head.appendChild(viewport);
  }

  // تنظیمات مختلف برای دستگاه‌های مختلف
  if (device.isIOS) {
    viewport.content =
      "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover";
  } else {
    viewport.content =
      "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes";
  }

  // اضافه کردن theme-color برای موبایل
  let themeColor = document.querySelector('meta[name="theme-color"]');
  if (!themeColor) {
    themeColor = document.createElement("meta");
    themeColor.name = "theme-color";
    themeColor.content = "#1c39bb"; // رنگ اصلی
    document.head.appendChild(themeColor);
  }
};

// بهینه‌سازی فونت‌ها برای موبایل
export const optimizeFonts = () => {
  const device = detectDevice();

  // preload کردن فونت‌های مهم
  const fontPreload = document.createElement("link");
  fontPreload.rel = "preload";
  fontPreload.href =
    "https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css";
  fontPreload.as = "style";
  fontPreload.crossOrigin = "anonymous";
  document.head.appendChild(fontPreload);

  // تنظیم اندازه فونت برای موبایل
  if (device.isMobile && device.screenWidth < 375) {
    document.documentElement.style.fontSize = "14px";
  }
};

// کش کردن منابع مهم
export const setupResourceCaching = () => {
  // Service Worker برای کش کردن
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.log("Service Worker registration failed:", err);
    });
  }

  // Prefetch کردن صفحات مهم
  const prefetchPages = ["/login", "/register", "/profile"];
  prefetchPages.forEach((page) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = page;
    document.head.appendChild(link);
  });
};

// بهینه‌سازی عملکرد JavaScript
export const optimizePerformance = () => {
  // Debounce برای resize events
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // اجرای کدهای resize
      window.dispatchEvent(new Event("optimizedResize"));
    }, 250);
  });

  // Throttle برای scroll events
  let scrollTimeout;
  let scrolling = false;
  window.addEventListener("scroll", () => {
    if (!scrolling) {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("optimizedScroll"));
        scrolling = false;
      });
      scrolling = true;
    }
  });
};

// تنظیم کامل بهینه‌سازی موبایل
export const initMobileOptimizations = () => {
  // اجرای همه بهینه‌سازی‌ها
  setupMobileViewport();
  optimizeScrolling();
  optimizeTouchEvents();
  optimizeFonts();
  setupResourceCaching();
  optimizePerformance();

  // اجرای lazy loading پس از load شدن صفحه
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupLazyLoading);
  } else {
    setupLazyLoading();
  }

  console.log("Mobile optimizations initialized");
};

// Hook React برای استفاده از بهینه‌سازی‌ها
export const useMobileOptimizations = () => {
  React.useEffect(() => {
    initMobileOptimizations();
  }, []);

  return detectDevice();
};

export default {
  detectDevice,
  optimizeImageForMobile,
  setupLazyLoading,
  optimizeScrolling,
  optimizeTouchEvents,
  setupMobileViewport,
  optimizeFonts,
  setupResourceCaching,
  optimizePerformance,
  initMobileOptimizations,
  useMobileOptimizations,
};
