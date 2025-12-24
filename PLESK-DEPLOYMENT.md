# 🚀 راهنمای Deployment به سرور ویندوزی پلسک

این راهنما نحوه استفاده از سیستم CI/CD برای deployment به سرور ویندوزی پلسک اشتراکی را توضیح می‌دهد.

## 📋 پیش‌نیازها

### محیط Local:

- Node.js 18+
- npm
- Git
- PowerShell (برای Windows)

### سرور Plesk:

- دسترسی FTP
- پنل کنترل Plesk
- دامنه یا subdomain تنظیم شده

## 🎯 روش‌های Deployment

### ۱. GitHub Actions (خودکار)

#### تنظیم Secrets در GitHub:

```
FTP_HOST=your-domain.com
FTP_USERNAME=your-ftp-username
FTP_PASSWORD=your-ftp-password
```

#### استفاده:

```bash
# Push به main branch برای deployment خودکار
git push origin main

# یا استفاده از Manual Trigger
# در GitHub Actions -> Deploy to Windows Plesk Hosting -> Run workflow
```

### ۲. PowerShell Script (Local)

#### استفاده پایه:

```powershell
# Deployment با patch version
npm run deploy:plesk

# Deployment با minor version
npm run deploy:plesk-minor

# Deployment با major version
npm run deploy:plesk-major
```

#### استفاده پیشرفته:

```powershell
# با پارامترهای سفارشی
.\scripts\deploy-to-plesk.ps1 -VersionType minor -FtpHost "your-domain.com" -FtpUsername "username" -FtpPassword "password"

# فقط build بدون deployment
.\scripts\deploy-to-plesk.ps1 -VersionType patch -DryRun

# Skip build process
.\scripts\deploy-to-plesk.ps1 -SkipBuild
```

### ۳. Batch Script (Windows ساده)

```cmd
# اجرای ساده
scripts\deploy-plesk.bat

# با تنظیم version type
scripts\deploy-plesk.bat --version-type minor

# Skip build
scripts\deploy-plesk.bat --skip-build
```

### ۴. FTP Upload جداگانه

```powershell
# آپلود فایل‌های build شده
.\scripts\ftp-upload.ps1 -FtpHost "your-domain.com" -FtpUsername "username" -FtpPassword "password"

# با backup
.\scripts\ftp-upload.ps1 -FtpHost "your-domain.com" -FtpUsername "username" -FtpPassword "password" -CreateBackup

# Test mode
.\scripts\ftp-upload.ps1 -FtpHost "your-domain.com" -FtpUsername "username" -FtpPassword "password" -DryRun
```

## 🔧 تنظیمات سرور

### IIS (Internet Information Services):

فایل `web.config` خودکار ایجاد می‌شود و شامل:

- URL Rewriting برای React Router
- MIME Types برای فونت‌ها
- HTTP Compression

### Apache:

فایل `.htaccess` خودکار ایجاد می‌شود و شامل:

- URL Rewriting
- Compression
- Cache Headers

## 📁 ساختار فایل‌های Deployment

بعد از build، فایل‌های زیر در پوشه `dist` ایجاد می‌شوند:

```
dist/
├── assets/           # فایل‌های CSS, JS, Images
├── index.html        # فایل اصلی
├── web.config        # تنظیمات IIS
├── .htaccess         # تنظیمات Apache
├── version.txt       # شماره نسخه
├── build-date.txt    # تاریخ build
└── deployment-info.json  # اطلاعات کامل deployment
```

## 🎨 Version Management

### انواع Version:

- **patch**: `1.0.1 → 1.0.2` (برای bug fixes)
- **minor**: `1.0.1 → 1.1.0` (برای features جدید)
- **major**: `1.0.1 → 2.0.0` (برای breaking changes)

### دستورات Version:

```bash
# نمایش version فعلی
npm run version:show

# پیش‌نمایش version بعدی
npm run version:preview

# تاریخچه تغییرات
npm run version:history

# راهنمای کامل
npm run version:help
```

## 🔄 Workflow توصیه شده

### برای Development:

1. تغییرات را انجام دهید
2. Commit با پیام مناسب:
   ```bash
   git commit -m "feat: add new feature"  # minor version
   git commit -m "fix: resolve bug"       # patch version
   git commit -m "feat!: breaking change" # major version
   ```
3. Push به main branch:
   ```bash
   git push origin main
   ```
4. GitHub Actions خودکار deployment را انجام می‌دهد

### برای Production:

1. Test در محیط local:
   ```bash
   npm run build
   npm run preview
   ```
2. Manual deployment:
   ```bash
   npm run deploy:plesk
   ```

## 🛠️ عیب‌یابی

### مشکلات رایج:

#### ۱. خطای FTP Connection:

```
❌ FTP connection failed
```

**راه‌حل:**

- بررسی اطلاعات FTP
- بررسی فایروال
- تست اتصال با FileZilla

#### ۲. خطای Permission:

```
❌ Access denied
```

**راه‌حل:**

- بررسی مجوزهای FTP user
- بررسی مسیر remote directory

#### ۳. خطای Build:

```
❌ Build failed
```

**راه‌حل:**

- بررسی dependencies: `npm ci`
- بررسی environment variables
- بررسی syntax errors

### لاگ‌های مفید:

#### GitHub Actions:

- در تب Actions repository خود
- جزئیات هر step قابل مشاهده است

#### Local Scripts:

- خروجی رنگی در PowerShell/CMD
- فایل‌های log در پوشه dist

## 📞 پشتیبانی

### منابع مفید:

- [Plesk Documentation](https://docs.plesk.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router Deployment](https://reactrouter.com/en/main/guides/deploying)

### تماس:

- GitHub Issues برای مشکلات فنی
- Documentation برای راهنمای بیشتر

---

## 🎉 خلاصه

با این سیستم می‌توانید:

- ✅ Version را خودکار مدیریت کنید
- ✅ Build و Deploy را خودکار انجام دهید
- ✅ از GitHub Actions یا Local Scripts استفاده کنید
- ✅ برای سرور ویندوزی پلسک بهینه‌سازی شده است
- ✅ Cache Management هوشمند دارید
- ✅ Backup و Recovery امکان‌پذیر است

**موفق باشید! 🚀**
