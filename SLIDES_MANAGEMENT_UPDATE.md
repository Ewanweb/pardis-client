# به‌روزرسانی مدیریت اسلایدها

## تغییرات انجام شده

### 🔄 تطبیق با Backend API

فایل `SlidesManagement.jsx` برای تطبیق با ساختار ساده‌شده Backend API به‌روزرسانی شد.

### 📝 فیلدهای جدید API

- **Title** (string) - عنوان اسلاید
- **Description** (string) - توضیحات اسلاید
- **ImageFile** (binary) - فایل تصویر
- **ActionLabel** (string) - متن دکمه عمل
- **ActionLink** (string) - لینک دکمه عمل
- **Order** (integer) - ترتیب نمایش

### ❌ فیلدهای حذف شده

- Badge, PrimaryActionLabel, PrimaryActionLink
- SecondaryActionLabel, SecondaryActionLink
- ButtonText, LinkUrl
- Stats array (آمار)
- IsPermanent, ExpiresAt (نوع اسلاید)
- ImageUrl (فقط آپلود فایل)

### 🎨 تغییرات رابط کاربری

#### فرم ایجاد/ویرایش:

- ساده‌سازی فیلدها
- حذف بخش آمار
- حذف انتخاب نوع اسلاید (دائمی/موقت)
- حذف آپلود از URL (فقط فایل)

#### کارت اسلاید:

- نمایش ساده‌تر اطلاعات
- حذف نمایش برچسب و آمار
- نمایش ActionLabel به جای PrimaryActionLabel

### 🔧 تغییرات تکنیکی

#### API Calls:

```javascript
// ایجاد اسلاید
formData.append("Title", formData.title);
formData.append("Description", formData.description);
formData.append("ActionLabel", formData.actionLabel);
formData.append("ActionLink", formData.actionLink);
formData.append("Order", formData.order);
formData.append("ImageFile", formData.imageFile);
```

#### State Management:

```javascript
const initialFormData = {
  title: "",
  description: "",
  order: 0,
  actionLabel: "",
  actionLink: "",
};
```

### ✅ قابلیت‌های حفظ شده

- ایجاد، ویرایش، حذف اسلاید
- فعال/غیرفعال کردن
- آپلود تصویر
- مرتب‌سازی
- جستجو و فیلتر
- نمایش responsive

### 🎯 نتیجه

رابط کاربری ساده‌تر و منطبق با Backend API جدید که فقط فیلدهای ضروری را شامل می‌شود.
