# 📊 داده‌های نمونه و API های مورد نیاز برای Backend

## 🎯 خلاصه وضعیت فعلی

### ✅ API های پیاده‌سازی شده:

- `/admin/comments/course/{courseId}` - دریافت کامنت‌های دوره
- `/admin/comments/{commentId}/review` - تأیید/رد کامنت
- `/admin/Attendance/sessions/course/{courseId}` - دریافت جلسات دوره
- `/admin/Attendance/sessions` - ایجاد جلسه جدید

### ❌ API های مورد نیاز:

- `/admin/courses/{courseId}/students` - لیست دانشجویان دوره
- `/admin/Students/{studentId}/profile` - پروفایل مالی دانشجو
- `/admin/Payments/enrollments/student/{studentId}` - اقساط دانشجو
- `/admin/Attendance/session/{sessionId}` - حضور و غیاب جلسه
- `/admin/Attendance/student/{studentId}/course/{courseId}` - گزارش حضور دانشجو

---

## 📋 داده‌های نمونه مورد نیاز

### 1️⃣ **لیست دانشجویان دوره**

**Endpoint:** `GET /admin/courses/{courseId}/students`

**Response Structure:**

```json
{
  "success": true,
  "message": "لیست دانشجویان با موفقیت دریافت شد",
  "data": [
    {
      "id": "student-1-guid",
      "fullName": "علی احمدی",
      "email": "ali.ahmadi@example.com",
      "phoneNumber": "09123456789",
      "profileImage": null,
      "enrollmentDate": "2025-01-01T10:00:00Z",
      "enrollmentStatus": "Active", // Active, Suspended, Cancelled
      "paymentStatus": "Partial", // Paid, Partial, Pending, Overdue
      "totalAmount": 5000000,
      "paidAmount": 2000000,
      "attendanceRate": 85.5
    },
    {
      "id": "student-2-guid",
      "fullName": "فاطمه محمدی",
      "email": "fateme.mohammadi@example.com",
      "phoneNumber": "09987654321",
      "profileImage": null,
      "enrollmentDate": "2025-01-02T14:30:00Z",
      "enrollmentStatus": "Active",
      "paymentStatus": "Paid",
      "totalAmount": 5000000,
      "paidAmount": 5000000,
      "attendanceRate": 92.3
    },
    {
      "id": "student-3-guid",
      "fullName": "محمد رضایی",
      "email": "mohammad.rezaei@example.com",
      "phoneNumber": "09111222333",
      "profileImage": null,
      "enrollmentDate": "2025-01-03T09:15:00Z",
      "enrollmentStatus": "Suspended",
      "paymentStatus": "Overdue",
      "totalAmount": 5000000,
      "paidAmount": 1000000,
      "attendanceRate": 45.2
    }
  ]
}
```

### 2️⃣ **پروفایل مالی دانشجو**

**Endpoint:** `GET /admin/Students/{studentId}/profile`

**Response Structure:**

```json
{
  "success": true,
  "message": "پروفایل دانشجو با موفقیت دریافت شد",
  "data": {
    "student": {
      "id": "student-1-guid",
      "fullName": "علی احمدی",
      "email": "ali.ahmadi@example.com",
      "phoneNumber": "09123456789",
      "profileImage": null,
      "registrationDate": "2024-12-01T10:00:00Z"
    },
    "enrollments": [
      {
        "id": "enrollment-1-guid",
        "courseId": "course-1-guid",
        "course": {
          "id": "course-1-guid",
          "title": "دوره برنامه‌نویسی React",
          "price": 5000000
        },
        "enrollmentDate": "2025-01-01T10:00:00Z",
        "enrollmentStatus": "Active",
        "paymentStatus": "Partial",
        "totalAmount": 5000000,
        "paidAmount": 2000000,
        "installments": [
          {
            "id": "installment-1-guid",
            "installmentNumber": 1,
            "amount": 2500000,
            "paidAmount": 2000000,
            "dueDate": "2025-01-15T00:00:00Z",
            "status": "Partial"
          },
          {
            "id": "installment-2-guid",
            "installmentNumber": 2,
            "amount": 2500000,
            "paidAmount": 0,
            "dueDate": "2025-02-15T00:00:00Z",
            "status": "Pending"
          }
        ]
      }
    ]
  }
}
```

### 3️⃣ **اقساط دانشجو**

**Endpoint:** `GET /admin/Payments/enrollments/student/{studentId}`

**Response Structure:**

```json
{
  "success": true,
  "message": "اقساط دانشجو با موفقیت دریافت شد",
  "data": {
    "id": "enrollment-1-guid",
    "courseId": "course-1-guid",
    "studentId": "student-1-guid",
    "totalAmount": 5000000,
    "paidAmount": 2000000,
    "paymentStatus": "Partial",
    "enrollmentStatus": "Active",
    "enrollmentDate": "2025-01-01T10:00:00Z",
    "installments": [
      {
        "id": "installment-1-guid",
        "installmentNumber": 1,
        "amount": 2500000,
        "paidAmount": 2000000,
        "dueDate": "2025-01-15T00:00:00Z",
        "status": "Partial"
      },
      {
        "id": "installment-2-guid",
        "installmentNumber": 2,
        "amount": 2500000,
        "paidAmount": 0,
        "dueDate": "2025-02-15T00:00:00Z",
        "status": "Pending"
      }
    ]
  }
}
```

### 4️⃣ **حضور و غیاب جلسه**

**Endpoint:** `GET /admin/Attendance/session/{sessionId}`

**Response Structure:**

```json
{
  "success": true,
  "message": "حضور و غیاب جلسه با موفقیت دریافت شد",
  "data": {
    "session": {
      "id": "session-1-guid",
      "courseId": "course-1-guid",
      "title": "جلسه اول - مقدمات",
      "sessionDate": "2025-01-10T14:00:00Z",
      "duration": "01:30:00",
      "sessionNumber": 1,
      "status": "Completed"
    },
    "attendances": [
      {
        "id": "attendance-1-guid",
        "sessionId": "session-1-guid",
        "studentId": "student-1-guid",
        "student": {
          "id": "student-1-guid",
          "fullName": "علی احمدی",
          "email": "ali.ahmadi@example.com"
        },
        "status": "Present", // Present, Absent, Late
        "checkInTime": "2025-01-10T14:05:00Z",
        "checkOutTime": "2025-01-10T15:30:00Z",
        "note": null
      },
      {
        "id": "attendance-2-guid",
        "sessionId": "session-1-guid",
        "studentId": "student-2-guid",
        "student": {
          "id": "student-2-guid",
          "fullName": "فاطمه محمدی",
          "email": "fateme.mohammadi@example.com"
        },
        "status": "Late",
        "checkInTime": "2025-01-10T14:15:00Z",
        "checkOutTime": "2025-01-10T15:30:00Z",
        "note": "10 دقیقه تأخیر"
      },
      {
        "id": "attendance-3-guid",
        "sessionId": "session-1-guid",
        "studentId": "student-3-guid",
        "student": {
          "id": "student-3-guid",
          "fullName": "محمد رضایی",
          "email": "mohammad.rezaei@example.com"
        },
        "status": "Absent",
        "checkInTime": null,
        "checkOutTime": null,
        "note": "غیبت بدون عذر"
      }
    ]
  }
}
```

### 5️⃣ **ثبت حضور و غیاب**

**Endpoint:** `POST /admin/Attendance/session/{sessionId}`

**Request Body:**

```json
{
  "attendances": [
    {
      "studentId": "student-1-guid",
      "status": "Present", // Present, Absent, Late
      "checkInTime": "2025-01-10T14:05:00Z",
      "checkOutTime": "2025-01-10T15:30:00Z",
      "note": ""
    },
    {
      "studentId": "student-2-guid",
      "status": "Late",
      "checkInTime": "2025-01-10T14:15:00Z",
      "checkOutTime": "2025-01-10T15:30:00Z",
      "note": "10 دقیقه تأخیر"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "حضور و غیاب با موفقیت ثبت شد",
  "data": {
    "sessionId": "session-1-guid",
    "totalStudents": 3,
    "presentStudents": 1,
    "lateStudents": 1,
    "absentStudents": 1
  }
}
```

### 6️⃣ **گزارش حضور دانشجو**

**Endpoint:** `GET /admin/Attendance/student/{studentId}/course/{courseId}`

**Response Structure:**

```json
{
  "success": true,
  "message": "گزارش حضور دانشجو با موفقیت دریافت شد",
  "data": {
    "student": {
      "id": "student-1-guid",
      "fullName": "علی احمدی",
      "email": "ali.ahmadi@example.com"
    },
    "course": {
      "id": "course-1-guid",
      "title": "دوره برنامه‌نویسی React"
    },
    "summary": {
      "totalSessions": 10,
      "presentSessions": 8,
      "lateSessions": 1,
      "absentSessions": 1,
      "attendanceRate": 85.5
    },
    "sessions": [
      {
        "sessionId": "session-1-guid",
        "sessionTitle": "جلسه اول - مقدمات",
        "sessionDate": "2025-01-10T14:00:00Z",
        "status": "Present",
        "checkInTime": "2025-01-10T14:05:00Z",
        "checkOutTime": "2025-01-10T15:30:00Z",
        "note": null
      },
      {
        "sessionId": "session-2-guid",
        "sessionTitle": "جلسه دوم - پیشرفته",
        "sessionDate": "2025-01-17T14:00:00Z",
        "status": "Late",
        "checkInTime": "2025-01-17T14:15:00Z",
        "checkOutTime": "2025-01-17T16:00:00Z",
        "note": "15 دقیقه تأخیر"
      }
    ]
  }
}
```

---

## 🔧 API های اضافی مورد نیاز

### 7️⃣ **ثبت پرداخت**

**Endpoint:** `POST /admin/Payments/enrollment/{enrollmentId}`

**Request Body:**

```json
{
  "amount": 1000000,
  "paymentMethod": "Cash", // Cash, Card, Transfer
  "description": "پرداخت قسط اول",
  "paymentDate": "2025-01-15T10:00:00Z"
}
```

### 8️⃣ **آمار کامنت‌ها**

**Endpoint:** `GET /admin/comments/course/{courseId}/stats`

**Response:**

```json
{
  "success": true,
  "message": "آمار کامنت‌ها با موفقیت دریافت شد",
  "data": {
    "totalComments": 15,
    "pendingComments": 3,
    "approvedComments": 10,
    "rejectedComments": 2,
    "averageRating": 4.2
  }
}
```

### 9️⃣ **آمار مالی دوره**

**Endpoint:** `GET /admin/courses/{courseId}/financial-summary`

**Response:**

```json
{
  "success": true,
  "message": "آمار مالی دوره با موفقیت دریافت شد",
  "data": {
    "totalStudents": 25,
    "totalRevenue": 75000000,
    "paidAmount": 45000000,
    "pendingAmount": 30000000,
    "overdueAmount": 5000000,
    "averagePaymentRate": 60.0
  }
}
```

---

## 📊 Enums و Constants

### وضعیت‌های مختلف:

```csharp
// Enrollment Status
public enum EnrollmentStatus
{
    Active = 0,
    Suspended = 1,
    Cancelled = 2,
    Completed = 3
}

// Payment Status
public enum PaymentStatus
{
    Pending = 0,
    Partial = 1,
    Paid = 2,
    Overdue = 3
}

// Attendance Status
public enum AttendanceStatus
{
    Present = 0,
    Absent = 1,
    Late = 2,
    Excused = 3
}

// Comment Status
public enum CommentStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

// Session Status
public enum SessionStatus
{
    Scheduled = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3
}
```

---

## 🎯 اولویت‌بندی پیاده‌سازی

### اولویت بالا:

1. ✅ `/admin/courses/{courseId}/students` - لیست دانشجویان
2. ✅ `/admin/Attendance/session/{sessionId}` - حضور و غیاب جلسه
3. ✅ `POST /admin/Attendance/session/{sessionId}` - ثبت حضور

### اولویت متوسط:

4. `/admin/Students/{studentId}/profile` - پروفایل مالی
5. `/admin/Payments/enrollments/student/{studentId}` - اقساط
6. `/admin/courses/{courseId}/financial-summary` - آمار مالی

### اولویت پایین:

7. `/admin/Attendance/student/{studentId}/course/{courseId}` - گزارش حضور
8. `POST /admin/Payments/enrollment/{enrollmentId}` - ثبت پرداخت

---

## 📝 نکات مهم برای Backend Developer:

1. **GUID ها**: همه ID ها باید GUID باشند
2. **DateTime Format**: همه تاریخ‌ها در فرمت ISO 8601 UTC
3. **Response Structure**: همه پاسخ‌ها باید ساختار `{success, message, data}` داشته باشند
4. **Error Handling**: خطاها باید کد HTTP مناسب و پیام فارسی داشته باشند
5. **Authorization**: همه endpoint ها نیاز به JWT token دارند
6. **Validation**: ورودی‌ها باید اعتبارسنجی شوند

این فایل شامل تمام داده‌های نمونه و API های مورد نیاز برای تکمیل سیستم LMS است! 🚀
