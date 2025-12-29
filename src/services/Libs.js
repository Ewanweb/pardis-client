import { SERVER_URL } from "./api";

export const getImageUrl = (path) => {
  if (!path) return null;
  // اگر لینک کامل (http/blob) بود، دست نزن
  if (path.startsWith("http") || path.startsWith("blob:")) return path;

  // اگر SERVER_URL ایمپورت نشد، به صورت پیش‌فرض production API را میگیرد
  const base = SERVER_URL || "https://api.pardistous.ir";

  // اطمینان از وجود اسلش در ابتدا
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${base}${cleanPath}`;
};

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

export const formatPrice = (price) => {
  if (price === null || price === undefined) return "0";
  return Number(price).toLocaleString("fa-IR");
};

export const formatDate = (date) => {
  if (!date) return "نامشخص";
  return new Date(date).toLocaleDateString("fa-IR");
};
export const ROLE_TRANSLATIONS = {
  Manager: "مدیر سیستم",
  Admin: "ادمین",
  User: "کاربر عادی",
  FinancialManager: "مدیر مالی",
  Instructor: "مدرس",
  Student: "دانشجو",
  ITManager: "مدیر IT",
  MarketingManager: "مدیر مارکتینگ",
  EducationManager: "مدیر آموزش",
  Accountant: "حسابدار",
  GeneralManager: "مدیر کل",
  DepartmentManager: "مدیر دپارتمان",
  CourseSupport: "پشتیبان دوره",
  Marketer: "بازاریاب",
  InternalManager: "مدیر داخلی",
  EducationExpert: "کارشناس آموزش",
};

export const translateRole = (role) => {
  return ROLE_TRANSLATIONS[role] || role;
};

export const translateRoles = (roles) => {
  if (!roles || !Array.isArray(roles)) return "دانشجو";
  return roles.map((role) => translateRole(role)).join("، ");
};
export const STATUS_LABELS = {
  Draft: "پیش‌نویس",
  draft: "پیش‌نویس",
  Published: "منتشر شده",
  published: "منتشر شده",
  Archived: "آرشیو شده",
  archived: "آرشیو شده",
};

export const STATUS_COLORS = {
  Draft: "amber",
  draft: "amber",
  Published: "emerald",
  published: "emerald",
  Archived: "slate",
  archived: "slate",
};

export const translateStatus = (status) => {
  return STATUS_LABELS[status] || status;
};

export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || "slate";
};
// === Course Schedule Utilities ===

export const DAY_NAMES = {
  0: "یکشنبه",
  1: "دوشنبه",
  2: "سه‌شنبه",
  3: "چهارشنبه",
  4: "پنج‌شنبه",
  5: "جمعه",
  6: "شنبه",
};

export const COURSE_TYPES = {
  Online: "آنلاین",
  InPerson: "حضوری",
  Hybrid: "ترکیبی",
};

export const SCHEDULE_STATUS = {
  Active: "فعال",
  Transferred: "انتقال یافته",
  Withdrawn: "انصراف",
  Expelled: "اخراج",
};

export const getDayName = (dayOfWeek) => {
  return DAY_NAMES[dayOfWeek] || "نامشخص";
};

export const getCourseTypeName = (type) => {
  return COURSE_TYPES[type] || type;
};

export const getScheduleStatusName = (status) => {
  return SCHEDULE_STATUS[status] || status;
};

export const formatTimeRange = (startTime, endTime) => {
  return `${startTime}-${endTime}`;
};

export const formatFullSchedule = (dayOfWeek, startTime, endTime) => {
  return `${getDayName(dayOfWeek)} ${formatTimeRange(startTime, endTime)}`;
};
