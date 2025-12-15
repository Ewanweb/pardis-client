# 🚨 راهنمای مدیریت خطا در سیستم

## خلاصه پیاده‌سازی

سیستم مدیریت خطای جامع برای نمایش خطاهای بکند به صورت زیبا و کاربرپسند پیاده‌سازی شده است.

## 🔧 کامپوننت‌های پیاده‌سازی شده

### 1. Alert Components (`src/components/Alert.jsx`)

- **Alert**: کامپوننت اصلی برای نمایش انواع پیام‌ها
- **APIErrorAlert**: نمایش خطاهای API با دکمه تلاش مجدد
- **DuplicateEnrollmentAlert**: نمایش پیام ثبت‌نام تکراری

### 2. Error Handler Hook (`src/hooks/useErrorHandler.js`)

- مدیریت state خطاها
- نمایش toast notifications
- اجرای توابع با مدیریت خطا

### 3. Global Error Handler (`src/services/errorHandler.js`)

- مدیریت مرکزی خطاهای API
- تشخیص انواع خطا (احراز هویت، شبکه، تکراری)
- Wrapper برای API calls

### 4. Error Boundary (`src/components/ErrorBoundary.jsx`)

- Catch کردن خطاهای React
- نمایش صفحه خطای زیبا
- نمایش جزئیات خطا در حالت development

### 5. API Interceptors (`src/services/api.js`)

- اضافه کردن token به درخواست‌ها
- مدیریت خطای 401 و redirect به login

## 🎯 صفحات پیاده‌سازی شده

### ✅ CourseDetail.jsx

- بررسی ثبت‌نام تکراری
- نمایش APIErrorAlert برای خطاهای دریافت دوره
- نمایش DuplicateEnrollmentAlert برای کاربران ثبت‌نام شده

### ✅ Checkout.jsx

- بررسی ثبت‌نام قبل از پرداخت
- مدیریت خطاهای پرداخت
- هدایت کاربران ثبت‌نام شده به پروفایل

### ✅ CourseSchedules.jsx (Admin)

- مدیریت خطاهای دریافت زمان‌بندی
- نمایش APIErrorAlert با دکمه retry

### ✅ GuestOnly Layout

- جلوگیری از دسترسی کاربران لاگین شده به صفحات auth

## 🔄 نحوه استفاده

### استفاده از useErrorHandler Hook

```jsx
import { useErrorHandler } from "../hooks/useErrorHandler";

const MyComponent = () => {
  const { error, handleError, clearError, executeWithErrorHandling } =
    useErrorHandler();

  const fetchData = async () => {
    try {
      const result = await executeWithErrorHandling(
        () => api.get("/data"),
        false // showToast = false to use Alert instead
      );
      // Handle success
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  return (
    <div>
      {error && (
        <APIErrorAlert error={error} onRetry={fetchData} onClose={clearError} />
      )}
      {/* Rest of component */}
    </div>
  );
};
```

### استفاده از Global Error Handler

```jsx
import {
  withErrorHandling,
  isDuplicateEnrollmentError,
} from "../services/errorHandler";

const enrollInCourse = async (courseId) => {
  const result = await withErrorHandling(
    () => api.post(`/courses/${courseId}/enroll`),
    {
      showToast: false,
      onError: (error, info) => {
        if (isDuplicateEnrollmentError(error)) {
          setShowDuplicateAlert(true);
        } else {
          setApiError(error);
        }
      },
    }
  );

  if (result.success) {
    // Handle success
  }
};
```

## 🎨 انواع Alert

### Success Alert

```jsx
<Alert type="success" title="موفق" message="عملیات با موفقیت انجام شد" />
```

### Error Alert

```jsx
<Alert type="error" title="خطا" message="مشکلی پیش آمده است" />
```

### Warning Alert

```jsx
<Alert type="warning" title="هشدار" message="توجه داشته باشید" />
```

### Info Alert

```jsx
<Alert type="info" title="اطلاعات" message="اطلاعات مفید" />
```

## 🔧 تنظیمات API

### Status Code Handling

- **400**: درخواست نامعتبر
- **401**: عدم احراز هویت (redirect به login)
- **403**: عدم دسترسی
- **404**: یافت نشد
- **409**: تداخل اطلاعات (ثبت‌نام تکراری)
- **422**: اطلاعات نامعتبر
- **500**: خطای سرور

### Automatic Token Management

- اضافه کردن Bearer token به همه درخواست‌ها
- حذف token و redirect در صورت انقضا

## 🚀 ویژگی‌های پیشرفته

### Error Boundary

- Catch کردن خطاهای React که handle نشده‌اند
- نمایش صفحه خطای زیبا به جای صفحه سفید
- نمایش جزئیات خطا در development mode

### Duplicate Enrollment Prevention

- بررسی وضعیت ثبت‌نام قبل از نمایش دکمه
- نمایش پیام مناسب برای کاربران ثبت‌نام شده
- هدایت به پنل کاربری

### Network Error Handling

- تشخیص خطاهای شبکه
- نمایش پیام مناسب برای مشکلات اتصال
- دکمه تلاش مجدد

## 📱 Responsive Design

- Alert ها در موبایل responsive هستند
- موقعیت fixed برای نمایش در بالای صفحه
- انیمیشن‌های نرم برای ورود و خروج

## 🎯 نتیجه

سیستم مدیریت خطای کامل پیاده‌سازی شده که شامل:

- ✅ نمایش زیبای خطاهای API
- ✅ جلوگیری از ثبت‌نام تکراری
- ✅ مدیریت خطاهای احراز هویت
- ✅ Error Boundary برای خطاهای React
- ✅ Toast notifications
- ✅ دکمه‌های retry و navigation
- ✅ پشتیبانی از حالت تاریک/روشن
- ✅ طراحی responsive

کاربران حالا به جای خطاهای خام، پیام‌های زیبا و قابل فهم دریافت می‌کنند.
