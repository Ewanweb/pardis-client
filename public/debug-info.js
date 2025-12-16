// Debug information for production
window.DEBUG_INFO = {
  buildTime: new Date().toISOString(),
  environment: "production",
  expectedAPI: "https://api.pardistous.ir/api",

  // تابع برای نمایش اطلاعات debug
  show: function () {
    console.group("🔧 Production Debug Info");
    console.log("Build Time:", this.buildTime);
    console.log("Environment:", this.environment);
    console.log("Expected API:", this.expectedAPI);
    console.log("Current URL:", window.location.href);
    console.log("User Agent:", navigator.userAgent);
    console.groupEnd();
  },

  // تست اتصال API
  testAPI: async function () {
    console.log("🔄 Testing API connection...");
    try {
      const response = await fetch(this.expectedAPI + "/home/categories");
      const data = await response.json();

      if (response.ok) {
        console.log("✅ API connection successful!");
        console.log(
          "Categories count:",
          data.data ? data.data.length : "Unknown"
        );
        return true;
      } else {
        console.error("❌ API error:", response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error("❌ API connection failed:", error.message);
      return false;
    }
  },
};

// نمایش خودکار اطلاعات debug
if (window.location.search.includes("debug=true")) {
  window.DEBUG_INFO.show();
  window.DEBUG_INFO.testAPI();
}

// اضافه کردن به window برای دسترسی از console
window.debugInfo = window.DEBUG_INFO;
