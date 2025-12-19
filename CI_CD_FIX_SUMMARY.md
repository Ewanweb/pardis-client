# خلاصه اصلاحات CI/CD

## مشکلات حل شده:

### 1. تغییر از rolldown-vite به Vite اصلی

- **مشکل**: `npm ci` با rolldown-vite کار نمی‌کرد
- **راه‌حل**: تغییر به Vite اصلی نسخه 6.0.7
- **فایل‌های تغییر یافته**: `package.json`, `vite.config.js`

### 2. اصلاح نسخه‌های React

- **مشکل**: تضاد نسخه‌ای بین React 18 و 19
- **راه‌حل**: استفاده از React 18.3.1 برای سازگاری بهتر
- **کتابخانه‌های متأثر**: `react`, `react-dom`, `@types/react`, `@types/react-dom`

### 3. اصلاح React Router

- **مشکل**: نسخه 7.9.6 ناپایدار بود
- **راه‌حل**: بازگشت به نسخه 6.28.0 پایدار

### 4. بهبود Scripts

- **قبل**: `npx --no-install vite`
- **بعد**: `vite` (استفاده مستقیم)
- **مزیت**: سرعت بیشتر و سازگاری بهتر با CI/CD

## فایل‌های جدید:

- `.github/workflows/ci.yml`: پایپ‌لاین CI/CD برای GitHub Actions

## تست‌های انجام شده:

✅ `npm install` - موفق
✅ `npm run build` - موفق
✅ `npm run lint` - موفق
❌ `npm ci` - مشکل فایل قفل شده (نیاز به ریستارت سیستم)

## نکات مهم:

1. برای CI/CD از `npm ci` استفاده کنید
2. فایل `package-lock.json` باید در git commit شود
3. متغیرهای محیطی در GitHub Actions تنظیم شده‌اند

## دستورات مفید:

```bash
# نصب dependencies
npm install

# اجرای development server
npm run dev

# ساخت برای production
npm run build

# بررسی کد با ESLint
npm run lint

# نصب clean برای CI/CD
npm ci
```
