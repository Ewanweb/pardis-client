# 🔧 CI/CD API Configuration Fix - UPDATED

## مشکل:

Production builds همچنان از `localhost:44367` به جای `https://api.pardistous.ir` استفاده می‌کردند.

## علت اصلی:

1. `import.meta.env.MODE` به درستی به 'production' set نمی‌شد
2. منطق تشخیص production کافی نبود
3. هیچ fallback mechanism برای production URL وجود نداشت

## راه‌حل‌های پیاده‌سازی شده:

### 1. ✅ API Configuration بهبود یافته (`src/services/api.js`)

**تشخیص BULLETPROOF Production**:

- تشخیص Build Mode: `import.meta.env.MODE === "production"`
- تشخیص Domain: بررسی domain های production
- تشخیص Environment Variable: `VITE_API_BASE_URL === PRODUCTION_API_URL`
- Fallback Safety: `!isLocalhost`

**منطق Fail-Safe**: اگر هر یک از شرایط بالا برقرار باشد، از production API استفاده می‌شود.

### 2. ✅ GitHub Actions Workflow بهبود یافته (`.github/workflows/deploy.yml`)

- اضافه شدن `MODE=production` به environment variables
- **POST-BUILD SAFETY NET**: جایگزینی مستقیم URL ها در فایل‌های build شده:
  ```bash
  find dist -name "*.js" -exec sed -i 's/localhost:44367/api.pardistous.ir/g' {} \;
  ```
- تضمین استفاده از HTTPS برای production API

### 3. ✅ Build Verification بهبود یافته (`scripts/verify-build.js`)

- تشخیص جامع localhost URLs (چندین port و IP)
- **Debug خط به خط**: نمایش محتوای مشکل‌دار
- گزارش خطای بهتر

### 4. ✅ ابزارهای Debug

- **صفحه Debug Production**: در `/debug-api.html`
- Console logging فقط در development
- Script بررسی environment

## لایه‌های محافظتی:

### لایه 1: تشخیص هوشمند در کد

```javascript
const shouldUseProductionAPI =
  isProductionDomain ||
  isProductionBuild ||
  import.meta.env.VITE_API_BASE_URL === PRODUCTION_API_URL ||
  !isLocalhost;
```

### لایه 2: Build Verification

اگر localhost URL پیدا شود، build fail می‌شود.

### لایه 3: Post-Build Replacement

جایگزینی مستقیم هر localhost URL باقی‌مانده با production URL.

### لایه 4: Runtime Detection

تشخیص domain در runtime و استفاده از production API.

## نحوه تست:

### تست محلی:

```bash
npm run build:check
node scripts/verify-build.js
```

### تست Production:

1. Push به master branch
2. بررسی GitHub Actions logs
3. بررسی `/debug-api.html` در production
4. تست API calls در browser console

## فایل‌های تغییر یافته:

- ✅ `src/services/api.js` - منطق تشخیص bulletproof production
- ✅ `.github/workflows/deploy.yml` - safety measures و post-build replacement
- ✅ `scripts/verify-build.js` - debugging و detection جامع
- ✅ `public/debug-api.html` - ابزار debugging production

## نتیجه مورد انتظار:

با این چند لایه محافظتی، production builds **همیشه** باید از `https://api.pardistous.ir` استفاده کنند، صرف‌نظر از مشکلات environment variable.

## Troubleshooting:

اگر هنوز مشکل وجود دارد:

1. بررسی `/debug-api.html` در production
2. بررسی GitHub Actions logs
3. بررسی Network tab در browser DevTools
4. Clear کردن cache browser
