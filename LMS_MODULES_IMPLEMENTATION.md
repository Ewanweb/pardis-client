# 🎓 پیاده‌سازی ماژول‌های LMS - مستندات کامل

## 📋 خلاصه پیاده‌سازی

### ✅ ماژول‌های پیاده‌سازی شده:

1. **💬 سیستم کامنت دوره‌ها**
2. **📊 سیستم حضور و غیاب**
3. **💰 سیستم شهریه و پرداخت قسطی**
4. **👤 پروفایل مالی دانشجو**

---

## 1️⃣ سیستم کامنت دوره‌ها

### 🏗️ Entities

#### `CourseComment`

```csharp
- CourseId: Guid
- UserId: string
- Content: string
- Rating: int (1-5)
- Status: CommentStatus (Pending/Approved/Rejected)
- AdminNote: string?
- ReviewedByUserId: string?
- ReviewedAt: DateTime?
```

### 🔄 Business Logic

- فقط دانشجویان ثبت‌نام‌شده می‌توانند کامنت ثبت کنند
- هر دانشجو فقط یک کامنت برای هر دوره
- کامنت‌ها بدون تأیید ادمین نمایش داده نمی‌شوند
- امکان ویرایش کامنت‌های در انتظار تأیید

### 📡 API Endpoints

#### دانشجو:

```http
POST /api/comments - ثبت کامنت جدید
PUT /api/comments/{id} - ویرایش کامنت (فقط Pending)
GET /api/comments/course/{courseId} - مشاهده کامنت‌های تأیید شده
```

#### ادمین:

```http
GET /api/admin/comments/course/{courseId} - تمام کامنت‌های دوره
PUT /api/admin/comments/{id}/review - تأیید/رد کامنت
GET /api/admin/comments/pending - کامنت‌های در انتظار
GET /api/admin/comments/course/{courseId}/stats - آمار کامنت‌ها
```

---

## 2️⃣ سیستم حضور و غیاب

### 🏗️ Entities

#### `CourseSession`

```csharp
- CourseId: Guid
- Title: string
- SessionDate: DateTime
- Duration: TimeSpan
- SessionNumber: int
- Status: SessionStatus
```

#### `StudentAttendance`

```csharp
- SessionId: Guid
- StudentId: string
- Status: AttendanceStatus (Present/Absent/Late)
- CheckInTime: DateTime?
- CheckOutTime: DateTime?
- Note: string?
```

### 🔄 Business Logic

- هر جلسه شماره یکتا در دوره دارد
- حضور و غیاب فقط توسط ادمین/مدرس ثبت می‌شود
- امکان محاسبه درصد حضور هر دانشجو
- ثبت زمان ورود و خروج

### 📡 API Endpoints

```http
# مدیریت جلسات
POST /api/admin/sessions - ایجاد جلسه جدید
PUT /api/admin/sessions/{id} - ویرایش جلسه
GET /api/admin/sessions/course/{courseId} - جلسات دوره

# مدیریت حضور و غیاب
POST /api/admin/attendance/session/{sessionId} - ثبت حضور
PUT /api/admin/attendance/{id} - ویرایش حضور
GET /api/admin/attendance/session/{sessionId} - حضور جلسه
GET /api/admin/attendance/student/{studentId}/course/{courseId} - گزارش حضور دانشجو
```

---

## 3️⃣ سیستم شهریه و پرداخت

### 🏗️ Entities

#### `CourseEnrollment`

```csharp
- CourseId: Guid
- StudentId: string
- TotalAmount: long
- PaidAmount: long
- PaymentStatus: PaymentStatus
- EnrollmentStatus: EnrollmentStatus
- IsInstallmentAllowed: bool
- InstallmentCount: int?
```

#### `InstallmentPayment`

```csharp
- EnrollmentId: Guid
- InstallmentNumber: int
- Amount: long
- PaidAmount: long
- DueDate: DateTime
- Status: InstallmentStatus
```

### 🔄 Business Logic

- امکان پرداخت یکجا یا قسطی
- محاسبه خودکار اقساط
- پیگیری وضعیت پرداخت هر قسط
- مدیریت تاریخ سررسید و معوقات

### 📡 API Endpoints

```http
# مدیریت ثبت‌نام
POST /api/admin/enrollments - ثبت‌نام جدید
GET /api/admin/enrollments/student/{studentId} - ثبت‌نام‌های دانشجو
PUT /api/admin/enrollments/{id}/status - تغییر وضعیت ثبت‌نام

# مدیریت پرداخت
POST /api/admin/payments/enrollment/{id} - ثبت پرداخت
GET /api/admin/payments/overdue - اقساط معوق
GET /api/admin/payments/installment/{id} - جزئیات قسط
```

---

## 4️⃣ پروفایل مالی دانشجو

### 📊 اطلاعات نمایش داده شده:

- اطلاعات پایه دانشجو
- لیست دوره‌های ثبت‌نام‌شده
- وضعیت پرداخت هر دوره
- گزارش حضور و غیاب
- آمار کلی مالی

### 📡 API Endpoint

```http
GET /api/admin/students/{studentId}/profile - پروفایل کامل دانشجو
```

---

## 🗄️ طراحی دیتابیس

### جداول اصلی:

1. **CourseComments**

   - PK: Id
   - FK: CourseId → Courses.Id
   - FK: UserId → AspNetUsers.Id
   - FK: ReviewedByUserId → AspNetUsers.Id

2. **CourseSessions**

   - PK: Id
   - FK: CourseId → Courses.Id
   - UK: (CourseId, SessionNumber)

3. **StudentAttendances**

   - PK: Id
   - FK: SessionId → CourseSessions.Id
   - FK: StudentId → AspNetUsers.Id
   - UK: (SessionId, StudentId)

4. **CourseEnrollments**

   - PK: Id
   - FK: CourseId → Courses.Id
   - FK: StudentId → AspNetUsers.Id
   - UK: (CourseId, StudentId)

5. **InstallmentPayments**
   - PK: Id
   - FK: EnrollmentId → CourseEnrollments.Id
   - UK: (EnrollmentId, InstallmentNumber)

---

## 🔧 ویژگی‌های فنی

### ✅ Clean Architecture

- **Domain Layer**: Entities با Rich Domain Model
- **Application Layer**: Commands, Handlers, DTOs
- **Infrastructure Layer**: Repository, DbContext
- **API Layer**: Controllers, Validation

### ✅ Patterns استفاده شده

- Repository Pattern
- CQRS (Command Query Responsibility Segregation)
- Domain-Driven Design
- AutoMapper برای Mapping

### ✅ Validation

- FluentValidation برای اعتبارسنجی
- Business Rules در Domain Layer
- Input Validation در Controllers

### ✅ Security

- JWT Authentication
- Role-based Authorization
- Input Sanitization

---

## 🚀 نحوه استفاده

### 1. Migration

```bash
dotnet ef migrations add AddLMSModules --project Pardis.Infrastructure --startup-project Endpoints/Api
dotnet ef database update --project Pardis.Infrastructure --startup-project Endpoints/Api
```

### 2. DI Registration

```csharp
// در ApplicationBootstrapper.cs
services.AddScoped<IRepository<CourseComment>, Repository<CourseComment>>();
services.AddScoped<IRepository<CourseSession>, Repository<CourseSession>>();
services.AddScoped<IRepository<StudentAttendance>, Repository<StudentAttendance>>();
services.AddScoped<IRepository<CourseEnrollment>, Repository<CourseEnrollment>>();
services.AddScoped<IRepository<InstallmentPayment>, Repository<InstallmentPayment>>();
```

### 3. نمونه استفاده

#### ثبت کامنت:

```csharp
var command = new CreateCommentCommand
{
    CourseId = courseId,
    UserId = userId,
    Content = "دوره عالی بود",
    Rating = 5
};
var result = await mediator.Send(command);
```

#### ثبت حضور:

```csharp
var command = new RecordAttendanceCommand
{
    SessionId = sessionId,
    StudentId = studentId,
    Status = AttendanceStatus.Present,
    RecordedByUserId = adminId
};
```

#### ثبت‌نام با پرداخت قسطی:

```csharp
var enrollment = new CourseEnrollment(
    courseId: courseId,
    studentId: studentId,
    totalAmount: 5000000,
    isInstallmentAllowed: true,
    installmentCount: 4
);
```

---

## 📈 گزارش‌گیری

### آمار کامنت‌ها:

- تعداد کامنت‌های هر دوره
- میانگین امتیاز
- توزیع امتیازات

### گزارش حضور:

- درصد حضور هر دانشجو
- آمار حضور هر جلسه
- دانشجویان پرغیبت

### گزارش مالی:

- وضعیت پرداخت دانشجویان
- اقساط معوق
- درآمد هر دوره

---

## 🎯 نتیجه‌گیری

✅ **سیستم کاملاً حرفه‌ای** بر اساس Clean Architecture

✅ **Rich Domain Models** با Business Logic

✅ **API های RESTful** با مستندات کامل

✅ **Database Schema** بهینه با روابط صحیح

✅ **Security** و **Validation** جامع

✅ **Scalable** و **Maintainable** Architecture

✅ **آماده Production** با تمام ویژگی‌های مورد نیاز LMS
