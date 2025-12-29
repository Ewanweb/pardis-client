# رفع خطای useAlert Hook

## مشکل اولیه

خطای TypeError در useCallback که باعث crash شدن AdminUsers می‌شد.

## علت مشکل

مشکل در import کردن useCallback از React بود.

## راه‌حل

حذف useCallback و استفاده از توابع معمولی:

### قبل:

```javascript
import { useCallback } from "react";
const showSuccess = useCallback((message, options = {}) => {
  return AlertService.success(message, options);
}, []);
```

### بعد:

```javascript
const showSuccess = (message, options = {}) => {
  return AlertService.success(message, options);
};
```

## نتیجه

- خطای useCallback برطرف شد
- کد ساده‌تر شد
- AdminUsers صفحه بدون خطا لود می‌شود
