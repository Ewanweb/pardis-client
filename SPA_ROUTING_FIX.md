# رفع مشکل 404 در Direct URL Access

## مشکل

وقتی کاربر مستقیماً URL مثل https://pardistous.ir/admin/slides را تایپ می‌کند، خطای 404 دریافت می‌کند.

## علت مشکل

در Single Page Applications، تمام routing در سمت client انجام می‌شود. Server باید همه route ها را به index.html redirect کند.

## راه‌حل‌های پیاده‌سازی شده

### 1. Vite Development Server

```javascript
// vite.config.js
server: {
  historyApiFallback: true,
}
```

### 2. Netlify Hosting

```
# public/_redirects
/*    /index.html   200
```

### 3. Apache Server

```apache
# public/.htaccess
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

### 4. Nginx Server

```nginx
# nginx.conf
location / {
    try_files $uri $uri/ /index.html;
}
```

### 5. Vercel Hosting

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## نحوه عملکرد

1. کاربر URL را تایپ می‌کند
2. Server فایل را پیدا نمی‌کند
3. به جای 404، index.html را serve می‌کند
4. React Router URL را می‌خواند و صفحه مناسب را نمایش می‌دهد

## تست

1. سرور development را restart کنید
2. مستقیماً به http://localhost:3000/admin/slides بروید
3. صفحه باید بدون خطا لود شود
