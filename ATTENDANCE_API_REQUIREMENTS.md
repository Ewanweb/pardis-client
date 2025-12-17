# 📋 API Requirements برای سیستم حضور و غیاب بر اساس زمان‌بندی

## 🎯 خلاصه تغییرات

سیستم حضور و غیاب حالا بر اساس **زمان‌بندی‌های (Schedules)** دوره کار می‌کند، نه فقط دوره کلی.

## 📡 API Endpoints مورد نیاز

### 1. دریافت زمان‌بندی‌های دوره

```http
GET /courses/{courseId}/schedules
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "schedule-uuid",
      "courseId": "course-uuid",
      "title": "گروه صبح",
      "dayOfWeek": 1,
      "startTime": "08:00",
      "endTime": "10:00",
      "maxCapacity": 20,
      "enrolledCount": 15,
      "description": "کلاس صبحگاهی"
    }
  ]
}
```

### 2. دریافت دانشجویان یک زمان‌بندی خاص

```http
GET /courses/{courseId}/schedules/{scheduleId}/students
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "userId": "user-uuid",
      "fullName": "علی احمدی",
      "email": "ali@example.com",
      "enrollmentDate": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 3. دریافت جلسات یک زمان‌بندی خاص

```http
GET /admin/Attendance/sessions/schedule/{scheduleId}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "session-uuid",
      "courseId": "course-uuid",
      "scheduleId": "schedule-uuid",
      "title": "جلسه اول - مقدمات",
      "sessionNumber": 1,
      "sessionDate": "2024-01-20T08:00:00Z",
      "duration": "01:30:00",
      "totalStudents": 15,
      "presentStudents": 12,
      "absentStudents": 3
    }
  ]
}
```

### 4. ایجاد جلسه جدید (به‌روزرسانی شده)

```http
POST /admin/Attendance/sessions
```

**Request Body:**

```json
{
  "courseId": "course-uuid",
  "scheduleId": "schedule-uuid", // ← جدید اضافه شده
  "title": "جلسه دوم - پیشرفته",
  "sessionNumber": 2,
  "sessionDate": "2024-01-27T08:00:00Z",
  "duration": "01:30:00"
}
```

### 5. دریافت حضور و غیاب یک جلسه (بدون تغییر)

```http
GET /admin/Attendance/session/{sessionId}
```

### 6. ثبت حضور و غیاب (بدون تغییر)

```http
POST /admin/attendance/session/{sessionId}
PUT /admin/attendance/{attendanceId}
```

## 🔄 تغییرات در Backend

### 1. جدول Sessions

```sql
ALTER TABLE Sessions
ADD COLUMN ScheduleId UNIQUEIDENTIFIER NULL,
ADD CONSTRAINT FK_Sessions_Schedules
    FOREIGN KEY (ScheduleId) REFERENCES Schedules(Id);
```

### 2. Controller جدید یا به‌روزرسانی

```csharp
[HttpGet("sessions/schedule/{scheduleId}")]
public async Task<IActionResult> GetSessionsBySchedule(Guid scheduleId)
{
    var sessions = await _attendanceService.GetSessionsByScheduleAsync(scheduleId);
    return Ok(new { success = true, data = sessions });
}
```

### 3. Service Methods

```csharp
public async Task<List<SessionDto>> GetSessionsByScheduleAsync(Guid scheduleId)
{
    return await _context.Sessions
        .Where(s => s.ScheduleId == scheduleId)
        .OrderBy(s => s.SessionNumber)
        .Select(s => new SessionDto { ... })
        .ToListAsync();
}
```

## 🎨 UI Flow جدید

1. **مرحله 1:** کاربر وارد صفحه حضور و غیاب می‌شود
2. **مرحله 2:** لیست زمان‌بندی‌های دوره نمایش داده می‌شود
3. **مرحله 3:** کاربر یک زمان‌بندی انتخاب می‌کند
4. **مرحله 4:** دانشجویان آن زمان‌بندی و جلسات آن بارگذاری می‌شوند
5. **مرحله 5:** کاربر می‌تواند جلسه جدید ایجاد کند یا جلسه موجود انتخاب کند
6. **مرحله 6:** حضور و غیاب دانشجویان آن زمان‌بندی ثبت می‌شود

## ✅ مزایای این روش

- ✅ هر زمان‌بندی جلسات جداگانه دارد
- ✅ دانشجویان هر زمان‌بندی جدا مدیریت می‌شوند
- ✅ حضور و غیاب دقیق‌تر و منظم‌تر
- ✅ امکان مدیریت چندین گروه در یک دوره
- ✅ گزارش‌گیری بهتر بر اساس زمان‌بندی

## 🚀 مراحل پیاده‌سازی

### Backend:

1. اضافه کردن `ScheduleId` به جدول `Sessions`
2. پیاده‌سازی endpoint `GET /admin/Attendance/sessions/schedule/{scheduleId}`
3. به‌روزرسانی endpoint `POST /admin/Attendance/sessions` برای دریافت `scheduleId`

### Frontend:

✅ **تکمیل شده!** - کامپوننت `AttendanceManagement` کاملاً به‌روزرسانی شده

## 📞 تست API ها

بعد از پیاده‌سازی backend، می‌توانید با این URL ها تست کنید:

```bash
# تست زمان‌بندی‌ها
GET https://api.pardistous.ir/api/courses/{courseId}/schedules

# تست دانشجویان زمان‌بندی
GET https://api.pardistous.ir/api/courses/{courseId}/schedules/{scheduleId}/students

# تست جلسات زمان‌بندی
GET https://api.pardistous.ir/api/admin/Attendance/sessions/schedule/{scheduleId}
```
