/**
 * 🚨 Emergency Cache Clear Script
 * این اسکریپت در صورت بروز مشکل کش اجرا می‌شود
 */

(function () {
  "use strict";

  // تشخیص خطاهای مربوط به کش
  const cacheErrors = [
    "Cannot set properties of undefined",
    "Cannot read properties of undefined",
    "Module not found",
    "Unexpected token",
    "SyntaxError",
  ];

  // بررسی خطاهای JavaScript
  window.addEventListener("error", function (event) {
    const errorMessage = event.message || "";
    const isCacheError = cacheErrors.some((error) =>
      errorMessage.includes(error)
    );

    if (isCacheError) {
      console.warn("🚨 Cache-related error detected:", errorMessage);
      emergencyCacheClear();
    }
  });

  // بررسی خطاهای Promise
  window.addEventListener("unhandledrejection", function (event) {
    const errorMessage = event.reason?.message || "";
    const isCacheError = cacheErrors.some((error) =>
      errorMessage.includes(error)
    );

    if (isCacheError) {
      console.warn("🚨 Cache-related promise rejection:", errorMessage);
      emergencyCacheClear();
    }
  });

  // پاک کردن اضطراری کش
  async function emergencyCacheClear() {
    try {
      console.log("🧹 Starting emergency cache clear...");

      // 1. پاک کردن localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) keysToRemove.push(key);
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      console.log("✅ localStorage cleared");

      // 2. پاک کردن sessionStorage
      sessionStorage.clear();
      console.log("✅ sessionStorage cleared");

      // 3. پاک کردن Service Worker cache
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
        console.log("✅ Service Workers unregistered");
      }

      // 4. پاک کردن browser cache
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        console.log("✅ Browser caches cleared");
      }

      // 5. نمایش پیام به کاربر
      showCacheClearMessage();

      // 6. بارگذاری مجدد صفحه بعد از 3 ثانیه
      setTimeout(() => {
        window.location.reload(true);
      }, 3000);
    } catch (error) {
      console.error("❌ Emergency cache clear failed:", error);
      // در صورت شکست، فقط reload کن
      setTimeout(() => {
        window.location.reload(true);
      }, 1000);
    }
  }

  // نمایش پیام به کاربر
  function showCacheClearMessage() {
    // ایجاد overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    // ایجاد پیام
    const message = document.createElement("div");
    message.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 15px;
      text-align: center;
      max-width: 400px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;

    message.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">🔄</div>
      <h2 style="color: #333; margin-bottom: 15px;">به‌روزرسانی برنامه</h2>
      <p style="color: #666; margin-bottom: 20px;">
        برنامه در حال به‌روزرسانی است.<br>
        کش پاک شده و صفحه بارگذاری مجدد می‌شود.
      </p>
      <div style="width: 100%; height: 4px; background: #f0f0f0; border-radius: 2px; overflow: hidden;">
        <div style="width: 0%; height: 100%; background: #4f46e5; border-radius: 2px; animation: progress 3s linear forwards;"></div>
      </div>
      <style>
        @keyframes progress {
          to { width: 100%; }
        }
      </style>
    `;

    overlay.appendChild(message);
    document.body.appendChild(overlay);
  }

  // اضافه کردن دکمه manual cache clear (فقط در development)
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    const clearButton = document.createElement("button");
    clearButton.textContent = "🧹 Clear Cache";
    clearButton.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 9999;
      background: #ef4444;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 12px;
    `;
    clearButton.onclick = emergencyCacheClear;
    document.body.appendChild(clearButton);
  }

  console.log("🛡️ Emergency cache clear script loaded");
})();
