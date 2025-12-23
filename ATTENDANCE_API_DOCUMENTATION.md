# مستندات API حضور و غیاب

## Endpoints

### 1. دریافت حضور و غیاب جلسه

**GET** `/api/admin/Attendance/session/{sessionId}`

#### پاسخ:

```json
{
  "success": true,
  "message": "حضور و غیاب جلسه با موفقیت دریافت شد",
  "data": {
    "session": {
      "id": "uuid",
      "courseId": "uuid",
      "scheduleId": "uuid",
      "courseName": "string",
      "scheduleTitle": "string",
      "title": "string",
      "sessionDate": "datetime",
      "duration": "timespan",
      "sessionNumber": 0,
      "status": 0,
      "totalStudents": 0,
      "presentStudents": 0,
      "absentStudents": 0,
      "lateStudents": 0
    },
    "attendances": [
      {
        "id": "uuid",
        "sessionId": "uuid",
        "studentId": "uuid",
        "studentName": "string",
        "status": 0,
        "statusDisplay": "string",
        "checkInTime": "datetime",
        "checkOutTime": "datetime",
        "note": "string"
      }
    ]
  }
}
```

### 2. ثبت حضور و غیاب جدید

**POST** `/api/admin/Attendance/session/{sessionId}`

#### درخواست:

```json
{
  "studentId": "uuid",
  "status": 0,
  "checkInTime": "datetime",
  "note": "string"
}
```

#### پاسخ:

```json
{
  "success": true,
  "message": "حضور و غیاب با موفقیت ثبت شد",
  "data": {
    "id": "uuid",
    "sessionId": "uuid",
    "studentId": "uuid",
    "studentName": "string",
    "status": 0,
    "statusDisplay": "string",
    "checkInTime": "datetime",
    "checkOutTime": "datetime",
    "note": "string"
  }
}
```

### 3. بروزرسانی حضور و غیاب

**PUT** `/api/admin/Attendance/{attendanceId}`

#### درخواست:

```json
{
  "status": 0,
  "checkInTime": "datetime",
  "note": "string"
}
```

#### پاسخ:

```json
{
  "success": true,
  "message": "حضور و غیاب با موفقیت بروزرسانی شد",
  "data": {
    "id": "uuid",
    "sessionId": "uuid",
    "studentId": "uuid",
    "studentName": "string",
    "status": 0,
    "statusDisplay": "string",
    "checkInTime": "datetime",
    "checkOutTime": "datetime",
    "note": "string"
  }
}
```

## Status Codes

### Status Numbers:

- `0` = Present (حاضر)
- `1` = Absent (غایب)
- `2` = Late (تأخیر)

### Status Strings (Frontend):

- `"Present"` = حاضر
- `"Absent"` = غایب
- `"Late"` = تأخیر
- `"NotRecorded"` = ثبت نشده

## تبدیل Status

### از Number به String:

```javascript
function statusNumberToString(statusNumber) {
  switch (statusNumber) {
    case 0:
      return "Present";
    case 1:
      return "Absent";
    case 2:
      return "Late";
    default:
      return "NotRecorded";
  }
}
```

### از String به Number:

```javascript
function statusStringToNumber(statusString) {
  switch (statusString) {
    case "Present":
      return 0;
    case "Absent":
      return 1;
    case "Late":
      return 2;
    default:
      return 0;
  }
}
```

## نحوه استفاده در Frontend

### 1. دریافت حضور و غیاب:

```javascript
const fetchAttendance = async (sessionId) => {
  const response = await api.get(`/admin/Attendance/session/${sessionId}`);
  const { session, attendances } = response.data.data;

  // Process attendances
  const normalized = attendances.map((record) => ({
    ...record,
    status: statusNumberToString(record.status),
    isRecorded: true,
  }));

  setAttendances(normalized);
};
```

### 2. ثبت حضور و غیاب جدید:

```javascript
const createAttendance = async (sessionId, studentId, status) => {
  const response = await api.post(`/admin/Attendance/session/${sessionId}`, {
    studentId,
    status: statusStringToNumber(status),
    checkInTime: new Date().toISOString(),
    note: "",
  });

  return response.data.data;
};
```

### 3. بروزرسانی حضور و غیاب:

```javascript
const updateAttendance = async (attendanceId, status) => {
  const response = await api.put(`/admin/Attendance/${attendanceId}`, {
    status: statusStringToNumber(status),
    checkInTime: new Date().toISOString(),
    note: "",
  });

  return response.data.data;
};
```

## Flow کامل

### ثبت حضور و غیاب:

1. کاربر جلسه را انتخاب می‌کند
2. `fetchAttendance(sessionId)` فراخوانی می‌شود
3. حضور و غیاب موجود نمایش داده می‌شود
4. کاربر روی دکمه حاضر/غایب/تأخیر کلیک می‌کند
5. اگر رکورد وجود ندارد: `POST /api/admin/Attendance/session/{sessionId}`
6. اگر رکورد وجود دارد: `PUT /api/admin/Attendance/{attendanceId}`
7. پاسخ دریافت و state بروزرسانی می‌شود

### ویرایش حضور و غیاب:

1. کاربر روی دکمه "ویرایش" کلیک می‌کند
2. `isRecorded` به `false` تغییر می‌کند
3. دکمه‌های حضور/غیاب فعال می‌شوند
4. کاربر وضعیت جدید را انتخاب می‌کند
5. `PUT /api/admin/Attendance/{attendanceId}` فراخوانی می‌شود
6. پاسخ دریافت و state بروزرسانی می‌شود

## خطاهای رایج

### 404 Not Found:

- جلسه یا حضور و غیاب یافت نشد
- **راه‌حل**: بررسی ID و ایجاد رکورد جدید

### 400 Bad Request:

- داده‌های ورودی نامعتبر
- **راه‌حل**: بررسی فرمت داده‌ها

### 401 Unauthorized:

- کاربر احراز هویت نشده
- **راه‌حل**: login مجدد

### 403 Forbidden:

- کاربر دسترسی ندارد
- **راه‌حل**: بررسی نقش کاربر

## تست API

### با cURL:

```bash
# دریافت حضور و غیاب
curl -X GET "https://localhost:44367/api/admin/Attendance/session/{sessionId}" \
  -H "Authorization: Bearer {token}"

# ثبت حضور و غیاب
curl -X POST "https://localhost:44367/api/admin/Attendance/session/{sessionId}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"studentId":"uuid","status":0,"checkInTime":"2025-12-19T12:00:00","note":""}'

# بروزرسانی حضور و غیاب
curl -X PUT "https://localhost:44367/api/admin/Attendance/{attendanceId}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"status":1,"checkInTime":"2025-12-19T12:00:00","note":""}'
```

### با Postman:

1. Import collection
2. Set environment variables
3. Test endpoints
4. Verify responses
