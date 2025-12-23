# راهنمای استفاده از قابلیت کپی خطاها

این راهنما نحوه استفاده از قابلیت کپی کردن خطاها در اپلیکیشن را توضیح می‌دهد.

## کامپوننت‌های موجود

### 1. ErrorBoundary

کامپوننت ErrorBoundary حالا دارای دکمه کپی برای خطاهای React است.

```jsx
import { ErrorBoundary } from "./components";

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>;
```

### 2. ErrorPage

کامپوننت کامل برای نمایش صفحات خطا با قابلیت کپی.

```jsx
import { ErrorPage } from "./components";

<ErrorPage
  error={errorObject}
  title="خطا در بارگذاری"
  message="مشکلی در نمایش صفحه رخ داده است"
  showErrorDetails={true}
/>;
```

### 3. ErrorDisplay

کامپوننت کوچک برای نمایش خطاهای inline.

```jsx
import { ErrorDisplay } from "./components";

<ErrorDisplay
  error={apiError}
  title="خطا در بارگذاری دوره‌ها"
  collapsible={true}
/>;
```

### 4. Alert با قابلیت کپی

کامپوننت Alert حالا برای خطاها دکمه کپی دارد.

```jsx
import { Alert } from "./components";

<Alert
  type="error"
  title="خطا در ارتباط با سرور"
  message="پیام خطا"
  errorObject={errorObject}
/>;
```

## نحوه کار

### 1. در حالت Development

- جزئیات کامل خطا نمایش داده می‌شود
- دکمه کپی در کنار جزئیات خطا قرار دارد
- با کلیک روی دکمه، تمام اطلاعات خطا کپی می‌شود

### 2. در حالت Production

- فقط پیام کاربرپسند نمایش داده می‌شود
- دکمه کپی همچنان کار می‌کند اما اطلاعات کمتری کپی می‌شود

## اطلاعات کپی شده

هنگام کپی کردن خطا، اطلاعات زیر شامل می‌شود:

- 🕐 زمان وقوع خطا (به تاریخ فارسی)
- 📍 URL صفحه فعلی
- 📝 پیام خطا
- 🔍 نوع خطا (Error name)
- 📊 اطلاعات HTTP (در صورت وجود):
  - Status code
  - Response data
  - Request method و URL
- 🧩 Component Stack (برای خطاهای React)
- 📋 Stack trace کامل
- 🌐 اطلاعات مرورگر:
  - User Agent
  - زبان
  - اندازه صفحه
  - زمان محلی

## مثال خروجی کپی شده

```
🚨 گزارش خطا - ۱۴۰۳/۱۰/۲ ۱۴:۳۰:۲۵
📍 URL: http://localhost:3000/courses

--- جزئیات خطا ---
پیام: Network Error: Unable to connect to server
نوع خطا: AxiosError
HTTP Status: 500
Response: {"message":"Internal Server Error","error":"Database connection failed"}

--- جزئیات درخواست ---
Method: POST
URL: /api/courses
Request Data: {"name":"React Course"}

--- Stack Trace ---
Error: Network Error
    at createError (http://localhost:3000/static/js/bundle.js:1234:15)
    at settle (http://localhost:3000/static/js/bundle.js:5678:12)

--- اطلاعات محیط ---
User Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
Language: fa-IR
Screen: 1920x1080
Viewport: 1200x800
Local Time: Mon Dec 23 2024 14:30:25 GMT+0330
```

## تست کردن

برای تست این قابلیت:

1. در حالت development به `/error-test` بروید
2. روی دکمه‌های "خطای API" یا "خطای React Component" کلیک کنید
3. دکمه کپی را امتحان کنید

## نکات مهم

- دکمه کپی فقط برای خطاهای نوع `error` نمایش داده می‌شود
- در صورت موفقیت، آیکون تیک سبز نمایش داده می‌شود
- در صورت عدم موفقیت، دکمه به حالت اولیه برمی‌گردد
- از Clipboard API مدرن استفاده می‌کند با fallback برای مرورگرهای قدیمی

## استفاده در کامپوننت‌های سفارشی

```jsx
import { copyErrorDetails } from "./utils/clipboard";

const handleCopyError = async (error) => {
  const success = await copyErrorDetails(error);
  if (success) {
    console.log("خطا با موفقیت کپی شد");
  }
};
```
