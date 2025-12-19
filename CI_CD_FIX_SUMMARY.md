# 🔧 CI/CD API Configuration Fix

## مشکل قبلی:

- در production build، API URL به درستی جایگزین نمی‌شد
- Environment variables در build time به درستی load نمی‌شدند
- هیچ verification برای build output وجود نداشت

## تغییرات اعمال شده:

### 1. بهبود `src/services/api.js`:

- اضافه کردن `isProductionBuild` check
- اولویت دادن به production URL در build mode
- بهبود debug logging

### 2. بهبود `.github/workflows/deploy.yml`:

- ایجاد فایل `.env` اصلی برای production
- اضافه کردن verification steps
- بهبود environment variable handling
- اضافه کردن build verification

### 3. ایجاد فایل‌های جدید:

- `public/debug-api.html` - برای debug در production
- `scripts/verify-build.js` - برای verify کردن build output

### 4. بهبود debug و monitoring:

- Debug page در `/debug-api.html`
- Automatic build verification
- Better error reporting

## نحوه تست:

### Local Test:

```bash
# تست محلی
npm run build:check

# تست production build
NODE_ENV=production VITE_API_BASE_URL=https://api.pardistous.ir npm run build
node scripts/verify-build.js
```

### Production Test:

1. Push کردن کد به master branch
2. بررسی GitHub Actions logs
3. بررسی `/debug-api.html` در production
4. تست API calls در browser console

## انتظارات:

### ✅ موفقیت‌آمیز:

- Build verification PASSED
- Production API URL found in build
- No localhost URLs in production build
- Debug page accessible

### ❌ در صورت مشکل:

- Build verification FAILED
- Check GitHub Actions logs
- Check environment variables
- Verify API configuration

## URLs برای تست:

- **Production Site**: https://yourdomain.com
- **Debug Page**: https://yourdomain.com/debug-api.html
- **API Endpoint**: https://api.pardistous.ir/api

## نکات مهم:

1. **Environment Priority**:

   - Production build → همیشه production URL
   - Localhost → environment variable یا localhost fallback
   - Deployed elsewhere → production URL

2. **Debug Tools**:

   - Console logs در browser
   - Debug page برای production testing
   - Build verification script

3. **Troubleshooting**:
   - اگر هنوز localhost استفاده می‌شود، cache browser را clear کنید
   - GitHub Actions logs را بررسی کنید
   - Debug page را برای API configuration check کنید

## مراحل بعدی:

1. ✅ Push کردن تغییرات
2. ✅ Monitor کردن GitHub Actions
3. ✅ تست production deployment
4. ✅ Verify API calls در production
