// بهینه‌سازی بارگذاری فونت
(function () {
  "use strict";

  // تشخیص پشتیبانی از font-display
  const supportsFontDisplay = CSS.supports("font-display", "swap");

  // بارگذاری فونت با استفاده از Font Loading API
  if ("fonts" in document) {
    // تعریف فونت
    const vazirFont = new FontFace(
      "Vazirmatn",
      'url(https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Regular.woff2) format("woff2")',
      {
        display: "swap",
        weight: "400",
        style: "normal",
      }
    );

    // بارگذاری فونت
    vazirFont
      .load()
      .then(function (font) {
        document.fonts.add(font);
        document.documentElement.classList.add("fonts-loaded");
      })
      .catch(function (error) {
        console.warn("Font loading failed:", error);
        // در صورت خطا، از فونت‌های سیستم استفاده کن
        document.documentElement.classList.add("fonts-failed");
      });
  } else {
    // Fallback برای مرورگرهای قدیمی
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css";
    link.onload = function () {
      document.documentElement.classList.add("fonts-loaded");
    };
    link.onerror = function () {
      document.documentElement.classList.add("fonts-failed");
    };
    document.head.appendChild(link);
  }
})();
