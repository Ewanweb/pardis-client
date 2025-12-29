# راهنمای تنظیم React SPA در Plesk

## مشکل

وقتی کاربر مستقیماً URL را تایپ می‌کند، خطای 404 دریافت می‌کند.

## راه‌حل‌های مختلف برای Plesk

### 1. Apache (پیش‌فرض Plesk)

#### گام 1: آپلود فایل .htaccess

فایل `.htaccess` را در root directory سایت قرار دهید:

```apache
Options -MultiViews
RewriteEngine On

# Handle Angular and React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### گام 2: فعال‌سازی mod_rewrite

در Plesk Panel:

1. Websites & Domains → Domain → Apache & nginx Settings
2. Additional Apache directives را فعال کنید
3. اگر نیاز بود، mod_rewrite را فعال کنید

### 2. IIS (Windows Server)

#### آپلود فایل web.config

فایل `web.config` را در root directory قرار دهید.

### 3. Nginx (اگر فعال است)

#### گام 1: تنظیمات Nginx

در Plesk Panel:

1. Websites & Domains → Domain → Apache & nginx Settings
2. Additional nginx directives را باز کنید
3. محتویات فایل `plesk-nginx.conf` را کپی کنید

```nginx
location / {
    try_files $uri $uri/ @fallback;
}

location @fallback {
    rewrite ^.*$ /index.html last;
}
```

## تست کردن

### گام 1: Clear Cache

در Plesk Panel:

1. Websites & Domains → Domain
2. File Manager → Clear cache

### گام 2: تست URL

مستقیماً به این آدرس‌ها بروید:

- `https://pardistous.ir/admin/slides`
- `https://pardistous.ir/admin/users`
- `https://pardistous.ir/profile`

## عیب‌یابی

### اگر هنوز 404 می‌دهد:

#### 1. بررسی فایل‌ها

- `.htaccess` در root directory باشد
- دسترسی‌های فایل درست باشد (644)

#### 2. بررسی Apache modules

در Plesk:

- Tools & Settings → Apache Modules
- mod_rewrite فعال باشد

#### 3. بررسی Error Logs

در Plesk Panel:

- Logs → Error Logs
- خطاهای Apache/Nginx را بررسی کنید

#### 4. تست دستی

```bash
# تست .htaccess
curl -I https://pardistous.ir/admin/slides

# باید 200 برگرداند، نه 404
```

## نکات مهم

### 1. File Permissions

```bash
chmod 644 .htaccess
chmod 644 web.config
```

### 2. Directory Structure

```
public/
├── index.html
├── .htaccess      # برای Apache
├── web.config     # برای IIS
└── assets/
```

### 3. API Routes

اگر API routes دارید، مطمئن شوید که در rewrite rules استثنا شوند:

```apache
RewriteCond %{REQUEST_URI} !^/api/
```

## پشتیبانی

اگر مشکل ادامه داشت:

1. نوع web server را بررسی کنید (Apache/Nginx/IIS)
2. Version PHP و Apache را چک کنید
3. با پشتیبانی Plesk تماس بگیرید
