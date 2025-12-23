// راه‌حل سریع برای تنظیم API URL

console.log("🔧 تنظیم اجباری API URL...");

// این کد را در console مرورگر اجرا کنید:
const fixApiCode = `
// کپی کنید و در console مرورگر paste کنید:
import('/src/services/api.js').then(({ ApiManager }) => {
  console.log('📊 تنظیمات فعلی:');
  ApiManager.showInfo();
  
  console.log('🔧 تنظیم اجباری به production...');
  ApiManager.forceProduction();
  
  console.log('✅ تنظیمات جدید:');
  ApiManager.showInfo();
  
  console.log('🎯 API URL اکنون به https://api.pardistous.ir/api تنظیم شده است');
});
`;

console.log("📋 کد زیر را کپی کنید و در console مرورگر (F12) paste کنید:");
console.log(fixApiCode);

// یا این دستورات را در terminal اجرا کنید:
console.log("\n🔄 یا این دستورات را در terminal اجرا کنید:");
console.log("1. npm run dev را متوقف کنید (Ctrl+C)");
console.log("2. rm -rf node_modules/.vite (یا پوشه .vite را حذف کنید)");
console.log("3. npm run dev را دوباره اجرا کنید");
console.log("4. در مرورگر Ctrl+Shift+R بزنید (hard refresh)");

export { fixApiCode };
