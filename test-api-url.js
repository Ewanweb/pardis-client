// تست کردن API URL فعلی
import { ApiManager } from "./src/services/api.js";

console.log("🔍 بررسی تنظیمات API:");
console.log("Environment Variables:");
console.log("VITE_API_BASE_URL:", process.env.VITE_API_BASE_URL);

// نمایش تنظیمات فعلی
ApiManager.showInfo();

const config = ApiManager.getConfig();
console.log("\n📊 تنظیمات فعلی:");
console.log("Server URL:", config.serverUrl);
console.log("API URL:", config.apiUrl);
