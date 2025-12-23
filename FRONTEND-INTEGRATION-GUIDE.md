# راهنمای کامل یکپارچه‌سازی فرانت‌اند

## 🎯 هدف

راهنمای دقیق برای تیم فرانت‌اند جهت یکپارچه‌سازی با API های بهبود یافته

## 📋 ساختار استاندارد Response

### ✅ Response موفق

```json
{
  "success": true,
  "message": "عملیات با موفقیت انجام شد",
  "data": {
    /* داده‌های بازگشتی */
  },
  "timestamp": "2024-12-19T12:00:00.000Z"
}
```

### ❌ Response خطا

```json
{
  "success": false,
  "message": "پیام خطا به فارسی",
  "errorCode": "VALIDATION_ERROR",
  "errorDetails": {
    "field": "توضیحات خطا"
  },
  "timestamp": "2024-12-19T12:00:00.000Z"
}
```

## 🔑 کدهای خطای استاندارد

| کد خطا             | معنی             | نحوه مدیریت                 |
| ------------------ | ---------------- | --------------------------- |
| `VALIDATION_ERROR` | خطای اعتبارسنجی  | نمایش خطاهای فیلدها         |
| `NOT_FOUND`        | یافت نشد         | نمایش پیام + بروزرسانی لیست |
| `UNAUTHORIZED`     | عدم دسترسی       | هدایت به صفحه ورود          |
| `CREATE_FAILED`    | خطا در ایجاد     | نمایش پیام خطا              |
| `UPDATE_FAILED`    | خطا در بروزرسانی | نمایش پیام خطا              |
| `DELETE_FAILED`    | خطا در حذف       | نمایش پیام خطا              |

---

## 🎨 کلاس کمکی JavaScript

```javascript
class ApiClient {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const result = await response.json();

      return this.handleResponse(result, response.status);
    } catch (error) {
      return this.handleError(error);
    }
  }

  handleResponse(result, status) {
    if (result.success) {
      this.showSuccessMessage(result.message);
      return { success: true, data: result.data };
    } else {
      this.handleApiError(result, status);
      return { success: false, error: result };
    }
  }

  handleApiError(result, status) {
    switch (result.errorCode) {
      case "VALIDATION_ERROR":
        this.showValidationErrors(result.errorDetails);
        break;
      case "NOT_FOUND":
        this.showErrorMessage(result.message);
        this.refreshCurrentList();
        break;
      case "UNAUTHORIZED":
        this.redirectToLogin();
        break;
      default:
        this.showErrorMessage(result.message);
    }
  }

  handleError(error) {
    this.showErrorMessage("خطا در ارتباط با سرور");
    console.error("API Error:", error);
    return { success: false, error: error.message };
  }

  showSuccessMessage(message) {
    // پیاده‌سازی toast موفقیت
    toast.success(message);
  }

  showErrorMessage(message) {
    // پیاده‌سازی toast خطا
    toast.error(message);
  }

  showValidationErrors(errors) {
    // نمایش خطاهای اعتبارسنجی در فرم
    Object.keys(errors).forEach((field) => {
      const input = document.querySelector(`[name="${field}"]`);
      if (input) {
        input.classList.add("error");
        this.showFieldError(input, errors[field]);
      }
    });
  }

  redirectToLogin() {
    window.location.href = "/login";
  }

  refreshCurrentList() {
    // بروزرسانی لیست فعلی
    if (typeof refreshData === "function") {
      refreshData();
    }
  }
}
```

---

## 📚 راهنمای هر کنترلر

### 1. 🔐 AuthController

#### ثبت‌نام کاربر

```javascript
async function registerUser(userData) {
  const api = new ApiClient("/api", null);

  // اعتبارسنجی سمت کلاینت
  const errors = validateRegistration(userData);
  if (errors) {
    showValidationErrors(errors);
    return null;
  }

  const result = await api.request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: userData.email.trim(),
      password: userData.password,
      fullName: userData.fullName.trim(),
      mobile: userData.mobile?.trim(),
    }),
  });

  if (result.success) {
    // هدایت به صفحه ورود
    window.location.href = "/login";
  }

  return result;
}

function validateRegistration(data) {
  const errors = {};

  if (!data.email?.trim()) {
    errors.email = "ایمیل الزامی است";
  } else if (!isValidEmail(data.email)) {
    errors.email = "فرمت ایمیل نامعتبر است";
  }

  if (!data.password) {
    errors.password = "رمز عبور الزامی است";
  } else if (data.password.length < 6) {
    errors.password = "رمز عبور باید حداقل 6 کاراکتر باشد";
  }

  if (!data.fullName?.trim()) {
    errors.fullName = "نام کامل الزامی است";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
```

#### ورود کاربر

```javascript
async function loginUser(credentials) {
  const api = new ApiClient("/api", null);

  const result = await api.request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email.trim(),
      password: credentials.password,
    }),
  });

  if (result.success) {
    // ذخیره token
    localStorage.setItem("token", result.data.token);
    localStorage.setItem("user", JSON.stringify(result.data.user));

    // هدایت به داشبورد
    window.location.href = "/dashboard";
  }

  return result;
}
```

#### دریافت اطلاعات کاربر فعلی

```javascript
async function getCurrentUser() {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const result = await api.request("/user");

  if (result.success) {
    // بروزرسانی اطلاعات کاربر در UI
    updateUserProfile(result.data);
  } else if (result.error?.errorCode === "UNAUTHORIZED") {
    // token منقضی شده - خروج از سیستم
    logout();
  }

  return result;
}
```

---

### 2. 📚 CourseController

#### دریافت لیست دوره‌ها

```javascript
async function getCourses(filters = {}) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const queryParams = new URLSearchParams();
  if (filters.category) queryParams.append("category", filters.category);
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.search) queryParams.append("search", filters.search);

  const endpoint = `/courses${
    queryParams.toString() ? "?" + queryParams.toString() : ""
  }`;
  const result = await api.request(endpoint);

  if (result.success) {
    displayCourses(result.data);
  }

  return result;
}
```

#### دریافت اطلاعات یک دوره

```javascript
async function getCourse(slug) {
  const api = new ApiClient("/api", null);

  if (!slug?.trim()) {
    showErrorMessage("شناسه دوره الزامی است");
    return null;
  }

  const result = await api.request(`/courses/${slug.trim()}`);

  if (result.success) {
    displayCourseDetails(result.data);
  }

  return result;
}
```

#### ایجاد دوره جدید (ادمین)

```javascript
async function createCourse(courseData, imageFile) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  // اعتبارسنجی
  const errors = validateCourse(courseData);
  if (errors) {
    showValidationErrors(errors);
    return null;
  }

  const formData = new FormData();
  formData.append("title", courseData.title.trim());
  formData.append("description", courseData.description?.trim() || "");
  formData.append("price", courseData.price);
  formData.append("categoryId", courseData.categoryId);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const result = await api.request("/courses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // حذف Content-Type برای FormData
    },
    body: formData,
  });

  if (result.success) {
    // بروزرسانی لیست دوره‌ها
    refreshCoursesList();
    // بستن modal
    closeCourseModal();
  }

  return result;
}

function validateCourse(data) {
  const errors = {};

  if (!data.title?.trim()) {
    errors.title = "عنوان دوره الزامی است";
  }

  if (!data.categoryId) {
    errors.categoryId = "دسته‌بندی الزامی است";
  }

  if (!data.price || data.price < 0) {
    errors.price = "قیمت باید عدد مثبت باشد";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
```

#### بروزرسانی دوره

```javascript
async function updateCourse(courseId, courseData, imageFile) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const formData = new FormData();
  formData.append("title", courseData.title.trim());
  formData.append("description", courseData.description?.trim() || "");
  formData.append("price", courseData.price);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const result = await api.request(`/courses/${courseId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (result.success) {
    showSuccessMessage("دوره با موفقیت بروزرسانی شد");
    refreshCoursesList();
  }

  return result;
}
```

#### حذف دوره

```javascript
async function deleteCourse(courseId) {
  if (!confirm("آیا از حذف این دوره اطمینان دارید؟")) {
    return false;
  }

  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const result = await api.request(`/courses/${courseId}`, {
    method: "DELETE",
  });

  if (result.success) {
    // حذف از لیست UI
    removeCourseFromList(courseId);
  }

  return result;
}
```

#### ثبت‌نام در دوره

```javascript
async function enrollInCourse(courseId) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const result = await api.request(`/courses/${courseId}/enroll`, {
    method: "POST",
  });

  if (result.success) {
    // بروزرسانی وضعیت دکمه ثبت‌نام
    updateEnrollmentButton(courseId, "enrolled");
    // نمایش پیام موفقیت
    showSuccessMessage("ثبت‌نام با موفقیت انجام شد");
  }

  return result;
}
```

---

### 3. 📝 AttendanceController (حضور و غیاب)

#### دریافت جلسات دوره

```javascript
async function getCourseSessions(courseId) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const result = await api.request(
    `/admin/attendance/sessions/course/${courseId}`
  );

  if (result.success) {
    displaySessions(result.data);
  }

  return result;
}
```

#### ایجاد جلسه جدید

```javascript
async function createSession(sessionData) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  // اعتبارسنجی
  const errors = validateSession(sessionData);
  if (errors) {
    showValidationErrors(errors);
    return null;
  }

  const result = await api.request("/admin/attendance/sessions", {
    method: "POST",
    body: JSON.stringify({
      courseId: sessionData.courseId,
      title: sessionData.title.trim(),
      sessionDate: sessionData.sessionDate,
      duration: sessionData.duration,
      sessionNumber: sessionData.sessionNumber,
    }),
  });

  if (result.success) {
    refreshSessionsList();
    closeSessionModal();
  }

  return result;
}

function validateSession(data) {
  const errors = {};

  if (!data.courseId) {
    errors.courseId = "دوره الزامی است";
  }

  if (!data.title?.trim()) {
    errors.title = "عنوان جلسه الزامی است";
  }

  if (!data.sessionDate) {
    errors.sessionDate = "تاریخ جلسه الزامی است";
  }

  if (!data.duration || data.duration <= 0) {
    errors.duration = "مدت زمان جلسه باید مثبت باشد";
  }

  if (!data.sessionNumber || data.sessionNumber <= 0) {
    errors.sessionNumber = "شماره جلسه باید مثبت باشد";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
```

#### دریافت حضور و غیاب جلسه

```javascript
async function getSessionAttendance(sessionId) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const result = await api.request(`/admin/attendance/session/${sessionId}`);

  if (result.success) {
    displayAttendanceList(result.data);
  }

  return result;
}
```

#### ثبت حضور و غیاب

```javascript
async function recordAttendance(sessionId, studentId, status, note = "") {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const result = await api.request(`/admin/attendance/session/${sessionId}`, {
    method: "POST",
    body: JSON.stringify({
      studentId: studentId,
      status: status, // 'Present', 'Absent', 'Late'
      checkInTime: status !== "Absent" ? new Date().toISOString() : null,
      note: note.trim(),
    }),
  });

  if (result.success) {
    // بروزرسانی ردیف دانشجو در جدول
    updateStudentAttendanceRow(studentId, result.data);
  }

  return result;
}
```

#### بروزرسانی حضور و غیاب (دکمه ویرایش)

```javascript
async function updateAttendance(attendanceId, status, note = "") {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const result = await api.request(`/admin/attendance/${attendanceId}`, {
    method: "PUT",
    body: JSON.stringify({
      status: status,
      checkInTime: status !== "Absent" ? new Date().toISOString() : null,
      note: note.trim(),
    }),
  });

  if (result.success) {
    // بروزرسانی UI
    updateAttendanceDisplay(attendanceId, result.data);
    closeEditModal();
  }

  return result;
}
```

#### نمایش حضور و غیاب در جدول

```javascript
function displayAttendanceList(data) {
  const tableBody = document.querySelector("#attendance-table tbody");
  tableBody.innerHTML = "";

  data.attendances.forEach((attendance) => {
    const row = createAttendanceRow(attendance);
    tableBody.appendChild(row);
  });

  // نمایش آمار
  updateAttendanceStats(data.session);
}

function createAttendanceRow(attendance) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${attendance.studentName}</td>
    <td>
      <span class="status-badge status-${attendance.status.toLowerCase()}">
        ${attendance.statusDisplay}
      </span>
    </td>
    <td>${
      attendance.checkInTime ? formatTime(attendance.checkInTime) : "-"
    }</td>
    <td>${attendance.note || "-"}</td>
    <td>
      <button onclick="editAttendance('${
        attendance.id
      }')" class="btn btn-sm btn-primary">
        ویرایش
      </button>
    </td>
  `;
  return row;
}

function editAttendance(attendanceId) {
  // باز کردن modal ویرایش
  const modal = document.querySelector("#edit-attendance-modal");
  modal.dataset.attendanceId = attendanceId;
  modal.style.display = "block";
}
```

---

### 4. 👥 UserController (مدیریت کاربران)

#### دریافت لیست کاربران

```javascript
async function getUsers(role = "", showAll = false) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const queryParams = new URLSearchParams();
  if (role) queryParams.append("role", role);
  queryParams.append("all", showAll);

  const endpoint = `/users${
    queryParams.toString() ? "?" + queryParams.toString() : ""
  }`;
  const result = await api.request(endpoint);

  if (result.success) {
    displayUsersList(result.data);
  }

  return result;
}
```

#### ایجاد کاربر جدید

```javascript
async function createUser(userData) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const errors = validateUser(userData);
  if (errors) {
    showValidationErrors(errors);
    return null;
  }

  const result = await api.request("/users", {
    method: "POST",
    body: JSON.stringify({
      email: userData.email.trim(),
      password: userData.password,
      fullName: userData.fullName.trim(),
      mobile: userData.mobile?.trim(),
      roles: userData.roles || ["Student"],
    }),
  });

  if (result.success) {
    refreshUsersList();
    closeUserModal();
  }

  return result;
}

function validateUser(data) {
  const errors = {};

  if (!data.email?.trim()) {
    errors.email = "ایمیل الزامی است";
  }

  if (!data.password) {
    errors.password = "رمز عبور الزامی است";
  }

  if (!data.fullName?.trim()) {
    errors.fullName = "نام کامل الزامی است";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
```

#### بروزرسانی کاربر

```javascript
async function updateUser(userId, userData) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const result = await api.request(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify({
      fullName: userData.fullName.trim(),
      email: userData.email?.trim(),
      mobile: userData.mobile?.trim(),
    }),
  });

  if (result.success) {
    updateUserInList(userId, result.data);
  }

  return result;
}
```

#### حذف کاربر

```javascript
async function deleteUser(userId, userName) {
  if (!confirm(`آیا از حذف کاربر "${userName}" اطمینان دارید؟`)) {
    return false;
  }

  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const result = await api.request(`/users/${userId}`, {
    method: "DELETE",
  });

  if (result.success) {
    removeUserFromList(userId);
  }

  return result;
}
```

#### تغییر نقش‌های کاربر

```javascript
async function updateUserRoles(userId, roles) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const result = await api.request(`/users/${userId}/roles`, {
    method: "PUT",
    body: JSON.stringify(roles),
  });

  if (result.success) {
    updateUserRolesInList(userId, result.data);
  }

  return result;
}
```

#### دریافت کاربران بر اساس نقش

```javascript
async function getUsersByRole(role) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const result = await api.request(`/users/role/${role}`);

  if (result.success) {
    displayFilteredUsers(result.data, role);
  }

  return result;
}
```

---

### 5. 💰 PaymentsController (مدیریت پرداخت‌ها)

#### دریافت اقساط دانشجو

```javascript
async function getStudentPayments(studentId) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const result = await api.request(
    `/admin/payments/enrollments/student/${studentId}`
  );

  if (result.success) {
    displayStudentPayments(result.data);
  }

  return result;
}
```

#### ثبت پرداخت جدید

```javascript
async function recordPayment(enrollmentId, paymentData) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const errors = validatePayment(paymentData);
  if (errors) {
    showValidationErrors(errors);
    return null;
  }

  const result = await api.request(
    `/admin/payments/enrollment/${enrollmentId}`,
    {
      method: "POST",
      body: JSON.stringify({
        amount: parseInt(paymentData.amount),
        paymentMethod: paymentData.paymentMethod.trim(),
        description: paymentData.description?.trim(),
        paymentDate: paymentData.paymentDate || new Date().toISOString(),
      }),
    }
  );

  if (result.success) {
    refreshPaymentsList();
    closePaymentModal();
  }

  return result;
}

function validatePayment(data) {
  const errors = {};

  if (!data.amount || data.amount <= 0) {
    errors.amount = "مبلغ پرداخت باید بیشتر از صفر باشد";
  }

  if (!data.paymentMethod?.trim()) {
    errors.paymentMethod = "روش پرداخت الزامی است";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
```

---

### 6. 🎓 StudentsController (مدیریت دانشجویان)

#### دریافت پروفایل دانشجو

```javascript
async function getStudentProfile(studentId) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const result = await api.request(`/admin/students/${studentId}/profile`);

  if (result.success) {
    displayStudentProfile(result.data);
  }

  return result;
}
```

#### دریافت خلاصه مالی دانشجو

```javascript
async function getStudentFinancialSummary(studentId) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const result = await api.request(
    `/admin/students/${studentId}/financial-summary`
  );

  if (result.success) {
    displayFinancialSummary(result.data);
  }

  return result;
}
```

#### دریافت خلاصه حضور دانشجو

```javascript
async function getStudentAttendanceSummary(studentId) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const result = await api.request(
    `/admin/students/${studentId}/attendance-summary`
  );

  if (result.success) {
    displayAttendanceSummary(result.data);
  }

  return result;
}
```

---

### 7. 💬 CommentsController (مدیریت نظرات)

#### دریافت نظرات دوره

```javascript
async function getCourseComments(courseId, filters = {}) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append("status", filters.status);
  queryParams.append("page", filters.page || 1);
  queryParams.append("pageSize", filters.pageSize || 20);

  const endpoint = `/admin/comments/course/${courseId}${
    queryParams.toString() ? "?" + queryParams.toString() : ""
  }`;
  const result = await api.request(endpoint);

  if (result.success) {
    displayComments(result.data);
  }

  return result;
}
```

#### تأیید یا رد نظر

```javascript
async function reviewComment(commentId, status, note = "") {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const result = await api.request(`/admin/comments/${commentId}/review`, {
    method: "PUT",
    body: JSON.stringify({
      status: status, // 'Approved' یا 'Rejected'
      note: note.trim(),
    }),
  });

  if (result.success) {
    updateCommentStatus(commentId, result.data);
  }

  return result;
}
```

#### دریافت نظرات در انتظار تأیید

```javascript
async function getPendingComments(page = 1) {
  const token = localStorage.getItem("token");
  const api = new ApiClient("/api", token);

  const result = await api.request(`/admin/comments/pending?page=${page}`);

  if (result.success) {
    displayPendingComments(result.data);
  }

  return result;
}
```

---

## 🎨 نمونه UI Components

### کامپوننت نمایش خطاها

```javascript
class ErrorHandler {
  static showValidationErrors(errors) {
    // پاک کردن خطاهای قبلی
    document.querySelectorAll(".field-error").forEach((el) => el.remove());
    document
      .querySelectorAll(".error")
      .forEach((el) => el.classList.remove("error"));

    // نمایش خطاهای جدید
    Object.keys(errors).forEach((fieldName) => {
      const field = document.querySelector(`[name="${fieldName}"]`);
      if (field) {
        field.classList.add("error");

        const errorDiv = document.createElement("div");
        errorDiv.className = "field-error text-danger";
        errorDiv.textContent = errors[fieldName];

        field.parentNode.appendChild(errorDiv);
      }
    });
  }

  static clearErrors() {
    document.querySelectorAll(".field-error").forEach((el) => el.remove());
    document
      .querySelectorAll(".error")
      .forEach((el) => el.classList.remove("error"));
  }
}
```

### کامپوننت Toast

```javascript
class Toast {
  static success(message) {
    this.show(message, "success");
  }

  static error(message) {
    this.show(message, "error");
  }

  static show(message, type) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    document.body.appendChild(toast);

    // حذف خودکار بعد از 5 ثانیه
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 5000);
  }
}
```

### کامپوننت Loading

```javascript
class Loading {
  static show(message = "در حال بارگذاری...") {
    const loading = document.createElement("div");
    loading.id = "loading-overlay";
    loading.innerHTML = `
      <div class="loading-content">
        <div class="spinner"></div>
        <p>${message}</p>
      </div>
    `;
    document.body.appendChild(loading);
  }

  static hide() {
    const loading = document.getElementById("loading-overlay");
    if (loading) {
      loading.remove();
    }
  }
}
```

---

## 🔧 نکات مهم پیاده‌سازی

### 1. مدیریت Token

```javascript
class TokenManager {
  static getToken() {
    return localStorage.getItem("token");
  }

  static setToken(token) {
    localStorage.setItem("token", token);
  }

  static removeToken() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  static isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
```

### 2. Interceptor برای خطاهای عمومی

```javascript
// اضافه کردن به کلاس ApiClient
async request(endpoint, options = {}) {
  // بررسی انقضای token
  if (TokenManager.isTokenExpired()) {
    this.redirectToLogin();
    return { success: false, error: 'Token expired' };
  }

  Loading.show();

  try {
    const response = await fetch(url, config);
    const result = await response.json();

    return this.handleResponse(result, response.status);
  } catch (error) {
    return this.handleError(error);
  } finally {
    Loading.hide();
  }
}
```

### 3. Validation سمت کلاینت

```javascript
class Validator {
  static email(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static required(value) {
    return value && value.toString().trim().length > 0;
  }

  static minLength(value, min) {
    return value && value.length >= min;
  }

  static positiveNumber(value) {
    return !isNaN(value) && parseFloat(value) > 0;
  }

  static guid(value) {
    const regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(value);
  }
}
```

---

## 📱 نمونه صفحات

### صفحه لیست دوره‌ها

```html
<div class="courses-page">
  <div class="page-header">
    <h1>مدیریت دوره‌ها</h1>
    <button onclick="showCreateCourseModal()" class="btn btn-primary">
      دوره جدید
    </button>
  </div>

  <div class="filters">
    <select onchange="filterCourses(this.value)">
      <option value="">همه دوره‌ها</option>
      <option value="Published">منتشر شده</option>
      <option value="Draft">پیش‌نویس</option>
    </select>
  </div>

  <div id="courses-list" class="courses-grid">
    <!-- دوره‌ها اینجا نمایش داده می‌شوند -->
  </div>
</div>

<script>
  document.addEventListener("DOMContentLoaded", function () {
    getCourses();
  });

  function filterCourses(status) {
    getCourses({ status });
  }

  function displayCourses(courses) {
    const container = document.getElementById("courses-list");
    container.innerHTML = courses
      .map(
        (course) => `
    <div class="course-card">
      <img src="${course.imageUrl}" alt="${course.title}">
      <h3>${course.title}</h3>
      <p class="price">${course.price.toLocaleString()} تومان</p>
      <div class="actions">
        <button onclick="editCourse('${
          course.id
        }')" class="btn btn-sm btn-secondary">
          ویرایش
        </button>
        <button onclick="deleteCourse('${
          course.id
        }')" class="btn btn-sm btn-danger">
          حذف
        </button>
      </div>
    </div>
  `
      )
      .join("");
  }
</script>
```

---

## ✅ چک‌لیست پیاده‌سازی

### برای هر API:

- [ ] اعتبارسنجی سمت کلاینت
- [ ] نمایش loading در حین درخواست
- [ ] مدیریت خطاهای مختلف
- [ ] نمایش پیام‌های موفقیت
- [ ] بروزرسانی UI بعد از عملیات
- [ ] پاک کردن فرم‌ها بعد از موفقیت
- [ ] مدیریت حالت‌های خالی

### برای امنیت:

- [ ] بررسی انقضای token
- [ ] مدیریت خطای 401
- [ ] محافظت از route های محرمانه
- [ ] Sanitize کردن ورودی‌ها

### برای UX:

- [ ] پیام‌های واضح و فارسی
- [ ] Loading states
- [ ] Confirmation dialogs برای حذف
- [ ] Keyboard shortcuts
- [ ] Responsive design

---

## 🎯 خلاصه

این راهنمای کامل همه چیزی که تیم فرانت‌اند نیاز داره رو پوشش می‌ده:

✅ **ساختار استاندارد Response**  
✅ **کلاس کمکی ApiClient**  
✅ **راهنمای دقیق هر کنترلر**  
✅ **نمونه کدهای کامل**  
✅ **مدیریت خطاها**  
✅ **UI Components**  
✅ **نکات امنیتی**  
✅ **چک‌لیست پیاده‌سازی**

**همه چیز آماده برای شروع توسعه فرانت‌اند!** 🚀
