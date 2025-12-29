# تصحیح آدرس تصاویر اسلایدها

## مشکل اولیه

تصاویر اسلایدها باید از مسیر خاص `https://api.pardistous.ir/uploads/sliders/{imageName}` نمایش داده شوند.

## راه‌حل پیاده‌سازی شده

### 1. ایجاد تابع جدید در Libs.js

```javascript
export const getSliderImageUrl = (imageName) => {
  if (!imageName) return null;
  // اگر لینک کامل (http/blob) بود، دست نزن
  if (imageName.startsWith("http") || imageName.startsWith("blob:"))
    return imageName;

  // اگر SERVER_URL ایمپورت نشد، به صورت پیش‌فرض production API را میگیرد
  const base = SERVER_URL || "https://api.pardistous.ir";

  // برای اسلایدها مسیر خاص uploads/sliders
  return `${base}/uploads/sliders/${imageName}`;
};
```

### 2. به‌روزرسانی HeroSlider.jsx

```javascript
import { getSliderImageUrl } from "../services/Libs";

// استفاده در کامپوننت:
<img
  src={
    getSliderImageUrl(currentSlideData.imageUrl || currentSlideData.image) ||
    "https://via.placeholder.com/1920x700?text=Slide"
  }
  alt={(currentSlideData.title || "Slide").trim()}
  className="w-full h-full object-cover transition-transform duration-700 ease-out"
  loading="lazy"
/>;
```

### 3. به‌روزرسانی SlidesManagement.jsx

```javascript
import { getSliderImageUrl } from "../../services/Libs";

// استفاده در کامپوننت:
<img
  src={
    getSliderImageUrl(slide.imageUrl) ||
    "https://via.placeholder.com/400x200?text=No+Image"
  }
  alt={slide.title}
  className="w-full h-full object-cover"
/>;
```

## فایل‌های تغییر یافته

- ✅ `src/services/Libs.js` - اضافه شدن تابع `getSliderImageUrl`
- ✅ `src/components/HeroSlider.jsx` - استفاده از تابع جدید
- ✅ `src/pages/admin/SlidesManagement.jsx` - استفاده از تابع جدید

## مزایای راه‌حل

- ✅ مسیر صحیح برای تصاویر اسلایدها
- ✅ پشتیبانی از لینک‌های کامل (http/https)
- ✅ پشتیبانی از blob URLs (برای preview)
- ✅ Fallback به SERVER_URL در صورت عدم دسترسی
- ✅ سازگاری با تصاویر موجود

## نحوه استفاده

```javascript
// برای نام فایل ساده
getSliderImageUrl("slide1.jpg");
// نتیجه: https://api.pardistous.ir/uploads/sliders/slide1.jpg

// برای لینک کامل
getSliderImageUrl("https://example.com/image.jpg");
// نتیجه: https://example.com/image.jpg (بدون تغییر)

// برای مقدار خالی
getSliderImageUrl(null);
// نتیجه: null
```

## تست

برای تست کردن:

1. اسلایدی با تصویر ایجاد کنید
2. تصویر باید از مسیر `/uploads/sliders/` نمایش داده شود
3. در صفحه اصلی اسلایدر باید تصاویر درست نمایش داده شوند
