# 🔧 راه‌حل مشکل API لوکال

## 🎯 مشکل

API URL هنوز به localhost اشاره می‌کند به جای `https://api.pardistous.ir`

## 🚀 راه‌حل‌های سریع

### روش 1: Console مرورگر (فوری)

1. مرورگر را باز کنید و F12 بزنید
2. به تب Console بروید
3. این کد را paste کنید:

```javascript
import("/src/services/api.js").then(({ ApiManager }) => {
  console.log("📊 تنظیمات فعلی:");
  ApiManager.showInfo();

  console.log("🔧 تنظیم اجباری به production...");
  ApiManager.forceProduction();

  console.log("✅ تنظیمات جدید:");
  ApiManager.showInfo();
});
```

### روش 2: پاک‌سازی Cache

```bash
# متوقف کردن سرور
Ctrl+C

# پاک کردن cache
rm -rf node_modules/.vite
rm -rf dist

# شروع مجدد
npm run dev
```

### روش 3: Hard Refresh مرورگر

- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### روش 4: تست صفحه

بروید به: `http://localhost:3000/test-api.html`

## 🔍 بررسی مشکل

### چک کردن فایل‌های .env

```bash
# بررسی محتوای فایل‌ها
cat .env
cat .env.development
cat .env.local
```

همه باید `VITE_API_BASE_URL=https://api.pardistous.ir` داشته باشند.

### چک کردن در Console

```javascript
// در console مرورگر
console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
```

## 🛠️ راه‌حل‌های پیشرفته

### اگر هیچ‌کدام کار نکرد:

1. **پاک کردن کامل cache:**

```bash
npm run dev # متوقف کنید
rm -rf node_modules
rm -rf .vite
rm -rf dist
npm install
npm run dev
```

2. **بررسی فایل vite.config.js:**
   مطمئن شوید که `envDir: "./"` تنظیم شده است.

3. **تنظیم دستی در کد:**
   در فایل `src/services/api.js` خط زیر را پیدا کنید:

```javascript
this.DEFAULT_API_URL = "https://api.pardistous.ir";
```

## 🎯 تست نهایی

بعد از اعمال راه‌حل، این کدها را در console اجرا کنید:

```javascript
// تست 1: بررسی URL
import("/src/services/api.js").then(({ ApiManager }) => {
  const config = ApiManager.getConfig();
  console.log("API URL:", config.apiUrl);

  if (config.apiUrl.includes("localhost")) {
    console.error("❌ هنوز localhost است!");
  } else {
    console.log("✅ API URL درست تنظیم شده");
  }
});

// تست 2: تست اتصال
import("/src/services/api.js").then(({ ApiManager }) => {
  ApiManager.testConnection().then((result) => {
    console.log("نتیجه تست:", result);
  });
});
```

## 📞 اگر مشکل ادامه داشت

1. فایل `public/test-api.html` را باز کنید
2. نتایج را بررسی کنید
3. اگر هنوز localhost است، مراحل بالا را دوباره انجام دهید

## 🔄 پیشگیری از مشکل

برای جلوگیری از این مشکل در آینده:

1. همیشه بعد از تغییر .env فایل، سرور را restart کنید
2. از hard refresh استفاده کنید
3. cache مرورگر را به طور منظم پاک کنید

---

**نکته مهم:** اگر هیچ‌کدام از راه‌حل‌ها کار نکرد، احتمالاً مشکل از تنظیمات خاص سیستم شماست. در این صورت لطفاً اطلاع دهید.
