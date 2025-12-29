# رفع مشکل FormData و Content-Type

## مشکل اصلی

Backend API انتظار دریافت multipart/form-data را داشت، اما axios با header پیش‌فرض application/json درخواست ارسال می‌کرد.

## راه‌حل پیاده‌سازی شده

### 1. تنظیم صحیح Content-Type

```javascript
const response = await api.post("/HeroSlides", formDataToSend, {
  headers: {
    "Content-Type": undefined, // اجازه به browser برای تنظیم خودکار
  },
});
```

### 2. فیلدهای دقیق API

- Title (string) - عنوان اسلاید (اجباری)
- Description (string) - توضیحات اسلاید
- ImageFile (binary) - فایل تصویر
- ActionLabel (string) - متن دکمه عمل
- ActionLink (string) - لینک دکمه عمل
- Order (integer) - ترتیب نمایش

### 3. Debug FormData

اضافه شدن console.log برای بررسی محتویات FormData

## تغییرات اعمال شده

- handleCreate(): تنظیم Content-Type و debug logging
- handleUpdate(): تنظیم Content-Type و اضافه کردن IsActive
- handleToggleActive(): تنظیم Content-Type

## نتیجه

FormData به درستی ارسال می‌شود و خطای validation برطرف شد.
