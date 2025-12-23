# 🚨 راهنمای کامل Alert System

سیستم Alert مدرن و حرفه‌ای با معماری تمیز برای مدیریت تمام پیام‌های کاربر

## 🏗️ معماری سیستم

```
AlertService (Singleton)
    ↓
ApiResponseHandler (مدیریت خودکار)
    ↓
ApiClient (Wrapper برای axios)
    ↓
AlertContainer (UI Component)
    ↓
useAlert Hook (استفاده راحت)
```

## 🚀 نصب و راه‌اندازی

### 1. AlertContainer را به App.jsx اضافه کنید:

```jsx
import AlertContainer from "./components/AlertContainer";

function App() {
  return (
    <div>
      <AlertContainer />
      {/* سایر کامپوننت‌ها */}
    </div>
  );
}
```

### 2. CSS Animation ها را اضافه کنید:

```css
/* در index.css */
@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.animate-progress {
  animation: progress linear forwards;
}
```

## 📖 نحوه استفاده

### 🎯 استفاده با Hook (پیشنهادی)

```jsx
import { useAlert } from "../hooks/useAlert";

const MyComponent = () => {
  const alert = useAlert();

  const handleSave = () => {
    alert.showSuccess("اطلاعات ذخیره شد");
  };

  const handleError = () => {
    alert.showError("خطایی رخ داد");
  };

  const handleDelete = () => {
    alert.showConfirmDelete("این آیتم", () => {
      // عملیات حذف
      console.log("Deleted!");
    });
  };

  return (
    <div>
      <button onClick={handleSave}>ذخیره</button>
      <button onClick={handleError}>خطا</button>
      <button onClick={handleDelete}>حذف</button>
    </div>
  );
};
```

### 🔧 استفاده مستقیم با Service

```jsx
import AlertService from "../services/AlertService";

// Alert ساده
AlertService.success("عملیات موفق بود");
AlertService.error("خطایی رخ داد");
AlertService.warning("هشدار!");
AlertService.info("اطلاعات مفید");

// Alert با تنظیمات پیشرفته
AlertService.success("فایل آپلود شد", {
  duration: 5000,
  actions: [
    {
      label: "مشاهده فایل",
      action: () => openFile(),
    },
  ],
  title: "آپلود موفق",
});

// Alert دائمی
AlertService.info("در حال پردازش...", {
  persistent: true,
});
```

### 🌐 استفاده با API Client (خودکار)

```jsx
import { apiClient } from "../services/api";

const MyComponent = () => {
  const handleCreateCourse = async () => {
    // Alert ها خودکار نمایش داده می‌شوند
    const result = await apiClient.post("/courses", courseData, {
      successMessage: "دوره ایجاد شد",
      errorMessage: "خطا در ایجاد دوره",
    });

    if (result.success) {
      console.log("Course created:", result.data);
    }
  };

  const handleGetCourses = async () => {
    // GET درخواست‌ها Alert موفقیت ندارند
    const result = await apiClient.get("/courses");

    if (result.success) {
      console.log("Courses:", result.data);
    }
    // فقط در صورت خطا Alert نمایش داده می‌شود
  };

  return (
    <div>
      <button onClick={handleCreateCourse}>ایجاد دوره</button>
      <button onClick={handleGetCourses}>دریافت دوره‌ها</button>
    </div>
  );
};
```

## 🎨 انواع Alert ها

### ✅ Success Alert

```jsx
alert.showSuccess("عملیات موفق بود");
alert.showCreateSuccess("دوره");
alert.showUpdateSuccess("کاربر");
alert.showDeleteSuccess("فایل");
```

### ❌ Error Alert

```jsx
alert.showError("خطایی رخ داد");
alert.showNetworkError();
alert.showValidationError();
alert.showUnauthorizedError();
alert.showNotFoundError("دوره");
```

### ⚠️ Warning Alert

```jsx
alert.showWarning("هشدار مهم");
alert.showConfirmDelete("دوره React", () => {
  // عملیات حذف
});
```

### ℹ️ Info Alert

```jsx
alert.showInfo("اطلاعات مفید");
alert.showLoading("در حال بارگذاری...");
```

## ⚙️ تنظیمات پیشرفته

### 🎛️ تنظیم کانفیگ عمومی

```jsx
import AlertService from "../services/AlertService";

AlertService.configure({
  duration: {
    success: 3000,
    error: 5000,
    warning: 4000,
    info: 3000,
  },
  position: "top-right",
  maxAlerts: 3,
});
```

### 🎯 Alert با Action ها

```jsx
alert.showError("خطا در اتصال", {
  actions: [
    {
      label: "تلاش مجدد",
      action: () => retryConnection(),
    },
    {
      label: "تنظیمات",
      action: () => openSettings(),
    },
  ],
});
```

### 📌 Alert دائمی

```jsx
const loadingId = alert.showLoading("در حال آپلود...", {
  persistent: true,
});

// بعد از اتمام کار
alert.dismiss(loadingId);
```

## 🔄 مدیریت خودکار خطاهای API

سیستم خودکار خطاهای مختلف را مدیریت می‌کند:

### HTTP Status Codes

- **400**: خطای اعتبارسنجی
- **401**: عدم احراز هویت (هدایت به login)
- **403**: عدم دسترسی
- **404**: یافت نشد
- **409**: تکراری
- **500**: خطای سرور
- **502/503**: خطای شبکه

### Validation Errors

```jsx
// خطاهای validation خودکار نمایش داده می‌شوند
const result = await apiClient.post("/users", userData);

// اگر خطای validation باشد:
// Alert: "3 خطای اعتبارسنجی وجود دارد"
```

## 🎨 سفارشی‌سازی UI

### تغییر موقعیت Alert ها

```jsx
AlertService.configure({
  position: "top-left", // top-right, top-left, top-center
  // bottom-right, bottom-left, bottom-center
});
```

### تغییر Theme

Alert ها خودکار از Dark/Light theme پشتیبانی می‌کنند.

## 📱 مثال‌های کاربردی

### 1. فرم ثبت‌نام

```jsx
const RegisterForm = () => {
  const alert = useAlert();

  const handleSubmit = async (formData) => {
    // Validation
    if (!formData.email) {
      alert.showValidationError("ایمیل الزامی است");
      return;
    }

    // API Call
    const result = await apiClient.post("/auth/register", formData, {
      successMessage: "ثبت‌نام موفق بود",
    });

    if (result.success) {
      // هدایت به صفحه بعد
      navigate("/login");
    }
  };

  return <form onSubmit={handleSubmit}>{/* فرم فیلدها */}</form>;
};
```

### 2. لیست دوره‌ها

```jsx
const CoursesList = () => {
  const alert = useAlert();
  const [courses, setCourses] = useState([]);

  const loadCourses = async () => {
    const result = await apiClient.get("/courses");
    if (result.success) {
      setCourses(result.data);
    }
  };

  const deleteCourse = (course) => {
    alert.showConfirmDelete(`دوره "${course.title}"`, async () => {
      const result = await apiClient.delete(`/courses/${course.id}`);
      if (result.success) {
        loadCourses(); // بارگذاری مجدد
      }
    });
  };

  return (
    <div>
      {courses.map((course) => (
        <div key={course.id}>
          <h3>{course.title}</h3>
          <button onClick={() => deleteCourse(course)}>حذف</button>
        </div>
      ))}
    </div>
  );
};
```

### 3. آپلود فایل

```jsx
const FileUpload = () => {
  const alert = useAlert();

  const handleUpload = async (file) => {
    const loadingId = alert.showLoading("در حال آپلود...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await apiClient.post("/upload", formData, {
        successMessage: "فایل آپلود شد",
      });

      if (result.success) {
        alert.showSuccess("فایل آپلود شد", {
          actions: [
            {
              label: "مشاهده فایل",
              action: () => openFile(result.data.url),
            },
          ],
        });
      }
    } finally {
      alert.dismiss(loadingId);
    }
  };

  return (
    <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
  );
};
```

## 🔧 عیب‌یابی

### مشکلات رایج

1. **Alert نمایش داده نمی‌شود**

   - AlertContainer را به App.jsx اضافه کنید
   - CSS animation ها را اضافه کنید

2. **Alert خودکار کار نمی‌کند**

   - از apiClient استفاده کنید نه api مستقیم
   - تنظیمات showSuccessAlert/showErrorAlert را چک کنید

3. **Animation کار نمی‌کند**
   - CSS keyframes را اضافه کنید
   - Tailwind config را چک کنید

### Debug Mode

```jsx
// برای دیدن تمام Alert های فعال
console.log(AlertService.getActiveAlerts());

// برای پاک کردن همه Alert ها
AlertService.dismissAll();
```

## 📋 چک‌لیست پیاده‌سازی

- [ ] AlertContainer به App.jsx اضافه شده
- [ ] CSS animations اضافه شده
- [ ] از apiClient استفاده می‌کنید
- [ ] Hook ها import شده‌اند
- [ ] تست شده در حالت‌های مختلف

## 🔧 ویژگی جدید: کپی جزئیات خطا

### 📋 دکمه کپی خطا

تمام Alert های خطا حالا دارای دکمه کپی هستند که جزئیات کامل خطا را کپی می‌کنند:

```jsx
// خطا با جزئیات کامل
const alert = useAlert();

const handleError = (error) => {
  alert.showErrorWithDetails(
    "خطا در دریافت اطلاعات",
    error, // error object کامل
    {
      title: "خطای سرور",
      duration: 8000,
    }
  );
};
```

### 📊 اطلاعات کپی شده شامل:

- **زمان وقوع خطا** (timestamp)
- **URL صفحه** جاری
- **پیام خطا** اصلی
- **HTTP Status** و Response
- **Request Details** (method, URL, data)
- **Stack Trace** (اگر موجود باشد)
- **اطلاعات مرورگر** (User Agent, Platform, Screen)

### 🎯 مثال خروجی کپی:

```
🚨 گزارش خطا - ۱۴۰۳/۱۰/۰۲ ۱۴:۳۰:۲۵
📍 URL: https://example.com/admin/courses

--- جزئیات خطا ---
پیام: Network Error: Failed to fetch data
HTTP Status: 500
Response: {"message":"Internal Server Error","errorCode":"SERVER_ERROR_001"}

--- جزئیات درخواست ---
Method: GET
URL: /api/courses
Request Data: null

--- Stack Trace ---
Error: Network Error
    at XMLHttpRequest.handleError (axios.js:123)
    at XMLHttpRequest.dispatchEvent (EventTarget.js:456)

--- اطلاعات محیط ---
User Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
Language: fa-IR
Platform: Win32
Screen: 1920x1080
```

### 🚀 استفاده خودکار

تمام خطاهای API به صورت خودکار دکمه کپی دارند:

```jsx
// خطاهای API خودکار دکمه کپی دارند
const result = await apiClient.get("/courses");
// اگر خطا باشد، Alert با دکمه کپی نمایش داده می‌شود
```

این سیستم Alert:

✅ **خودکار**: خطاها و موفقیت‌ها خودکار نمایش داده می‌شوند  
✅ **مرکزی**: یک جا تغییر دهید، همه جا اعمال شود  
✅ **حرفه‌ای**: Animation ها و UX مدرن  
✅ **قابل تنظیم**: هر جنبه قابل سفارشی‌سازی است  
✅ **تمیز**: معماری Clean Code

**همه چیز آماده برای استفاده!** 🚀

## 🎯 خلاصه

این سیستم Alert:

✅ **خودکار**: خطاها و موفقیت‌ها خودکار نمایش داده می‌شوند  
✅ **مرکزی**: یک جا تغییر دهید، همه جا اعمال شود  
✅ **حرفه‌ای**: Animation ها و UX مدرن  
✅ **قابل تنظیم**: هر جنبه قابل سفارشی‌سازی است  
✅ **تمیز**: معماری Clean Code  
✅ **کپی خطا**: دکمه کپی برای تمام خطاها

**همه چیز آماده برای استفاده!** 🚀
