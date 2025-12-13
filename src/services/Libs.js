import { SERVER_URL } from "./api";

export const getImageUrl = (path) => {
  if (!path) return null;
  // اگر لینک کامل (http/blob) بود، دست نزن
  if (path.startsWith("http") || path.startsWith("blob:")) return path;

  // اگر SERVER_URL ایمپورت نشد، به صورت پیش‌فرض https://localhost را میگیرد
  const base = SERVER_URL || "https://localhost:44367";

  // اطمینان از وجود اسلش در ابتدا
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${base}${cleanPath}`;
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
