# 🎯 اولویت‌بندی کارهای Backend برای LMS

## 📊 وضعیت فعلی

### ✅ **کامل شده:**

- ✅ سیستم کامنت‌ها (دریافت، تأیید/رد)
- ✅ مدیریت جلسات (دریافت، ایجاد)
- ✅ API Configuration و Environment Variables

### 🔄 **در حال کار:**

- 🔄 سیستم حضور و غیاب (نیاز به تکمیل)
- 🔄 مدیریت دانشجویان (نیاز به شروع)

---

## 🚀 **اولویت 1 - فوری (این هفته)**

### 1️⃣ **لیست دانشجویان دوره**

**Endpoint:** `GET /admin/courses/{courseId}/students`

**چرا فوری؟**

- Frontend آماده است و منتظر این API
- بدون این، تب "دانشجویان" خالی می‌ماند

**کار مورد نیاز:**

```csharp
[HttpGet("courses/{courseId}/students")]
public async Task<IActionResult> GetCourseStudents(Guid courseId)
{
    // Query: Join CourseEnrollments + AspNetUsers + StudentAttendanceStats
    // Return: List of students with enrollment info + attendance rate
}
```

### 2️⃣ **حضور و غیاب جلسه**

**Endpoint:** `GET /admin/Attendance/session/{sessionId}`

**چرا فوری؟**

- جلسات ایجاد می‌شوند اما حضور و غیاب کار نمی‌کند
- مدرس نمی‌تواند حضور ثبت کند

**کار مورد نیاز:**

```csharp
[HttpGet("session/{sessionId}")]
public async Task<IActionResult> GetSessionAttendance(Guid sessionId)
{
    // Query: Session info + All attendances for that session
    // Return: Session details + attendance list
}

[HttpPost("session/{sessionId}")]
public async Task<IActionResult> RecordAttendance(Guid sessionId, RecordAttendanceDto dto)
{
    // Bulk insert/update attendances for multiple students
    // Return: Success message + attendance summary
}
```

---

## ⚡ **اولویت 2 - مهم (هفته آینده)**

### 3️⃣ **پروفایل مالی دانشجو**

**Endpoint:** `GET /admin/Students/{studentId}/profile`

**کار مورد نیاز:**

```csharp
[HttpGet("{studentId}/profile")]
public async Task<IActionResult> GetStudentProfile(string studentId)
{
    // Query: Student info + All enrollments + Installments
    // Return: Complete financial profile
}
```

### 4️⃣ **آمار مالی دوره**

**Endpoint:** `GET /admin/courses/{courseId}/financial-summary`

**کار مورد نیاز:**

```csharp
[HttpGet("courses/{courseId}/financial-summary")]
public async Task<IActionResult> GetCourseFinancialSummary(Guid courseId)
{
    // Query: Aggregate financial data for course
    // Return: Revenue, payments, overdue amounts
}
```

---

## 📈 **اولویت 3 - مفید (ماه آینده)**

### 5️⃣ **اقساط دانشجو**

**Endpoint:** `GET /admin/Payments/enrollments/student/{studentId}`

### 6️⃣ **ثبت پرداخت**

**Endpoint:** `POST /admin/Payments/enrollment/{enrollmentId}`

### 7️⃣ **گزارش حضور دانشجو**

**Endpoint:** `GET /admin/Attendance/student/{studentId}/course/{courseId}`

---

## 🛠️ **راهنمای پیاده‌سازی سریع**

### **مرحله 1: Database Setup**

```sql
-- اجرای اسکریپت SAMPLE_DATA_SCRIPTS.sql
-- ایجاد Views برای آمارگیری
-- تست داده‌های نمونه
```

### **مرحله 2: Controllers**

```csharp
// ایجاد/تکمیل Controllers:
- AdminCoursesController (برای students endpoint)
- AttendanceController (برای session attendance)
- StudentsController (برای profile)
```

### **مرحله 3: DTOs**

```csharp
// ایجاد DTOs مطابق با ساختار JSON در فایل BACKEND_DATA_REQUIREMENTS.md
- CourseStudentDto
- SessionAttendanceDto
- StudentProfileDto
- RecordAttendanceDto
```

### **مرحله 4: Services**

```csharp
// ایجاد Services برای Business Logic:
- IStudentService
- IAttendanceService
- IFinancialService
```

---

## 📋 **Checklist برای هر API**

### ✅ **قبل از شروع:**

- [ ] بررسی ساختار JSON در `BACKEND_DATA_REQUIREMENTS.md`
- [ ] اجرای داده‌های نمونه از `SAMPLE_DATA_SCRIPTS.sql`
- [ ] تست کردن Query های پیشنهادی

### ✅ **حین پیاده‌سازی:**

- [ ] ایجاد DTO مطابق با Response Structure
- [ ] پیاده‌سازی Controller Action
- [ ] اضافه کردن Authorization
- [ ] اضافه کردن Validation
- [ ] تست با Postman/Swagger

### ✅ **بعد از پیاده‌سازی:**

- [ ] تست با Frontend
- [ ] بررسی Performance
- [ ] اضافه کردن Logging
- [ ] مستندسازی در Swagger

---

## 🔧 **نکات فنی مهم**

### **1. Performance:**

```csharp
// استفاده از Projection برای کاهش حجم داده
.Select(e => new CourseStudentDto
{
    Id = e.StudentId,
    FullName = e.Student.FullName,
    // فقط فیلدهای مورد نیاز
})
```

### **2. Error Handling:**

```csharp
try
{
    // Business logic
    return Ok(new ApiResponse<T>
    {
        Success = true,
        Message = "عملیات با موفقیت انجام شد",
        Data = result
    });
}
catch (Exception ex)
{
    return BadRequest(new ApiResponse<object>
    {
        Success = false,
        Message = "خطا در انجام عملیات"
    });
}
```

### **3. Caching:**

```csharp
// برای داده‌هایی که کم تغییر می‌کنند
[ResponseCache(Duration = 300)] // 5 minutes
public async Task<IActionResult> GetCourseStudents(Guid courseId)
```

---

## 📞 **تماس و هماهنگی**

### **سوالات فنی:**

- ساختار دقیق Response ها در `BACKEND_DATA_REQUIREMENTS.md`
- داده‌های نمونه در `SAMPLE_DATA_SCRIPTS.sql`

### **تست و بررسی:**

- Frontend آماده تست فوری پس از پیاده‌سازی
- لطفاً پس از هر API اطلاع دهید تا تست شود

### **اولویت‌بندی:**

1. 🔥 **فوری:** Students List + Session Attendance
2. ⚡ **مهم:** Student Profile + Financial Summary
3. 📈 **مفید:** Payment Management + Reports

**هدف:** تا پایان هفته، بخش‌های اصلی LMS کاملاً کار کند! 🚀
