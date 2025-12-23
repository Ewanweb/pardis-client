/**
 * Alert Types و Constants
 */

export const ALERT_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

export const ALERT_POSITIONS = {
  TOP_RIGHT: "top-right",
  TOP_LEFT: "top-left",
  TOP_CENTER: "top-center",
  BOTTOM_RIGHT: "bottom-right",
  BOTTOM_LEFT: "bottom-left",
  BOTTOM_CENTER: "bottom-center",
};

export const ALERT_ICONS = {
  [ALERT_TYPES.SUCCESS]: "✅",
  [ALERT_TYPES.ERROR]: "❌",
  [ALERT_TYPES.WARNING]: "⚠️",
  [ALERT_TYPES.INFO]: "ℹ️",
};

export const ALERT_MESSAGES = {
  // Success Messages
  SUCCESS: {
    CREATED: "با موفقیت ایجاد شد",
    UPDATED: "با موفقیت بروزرسانی شد",
    DELETED: "با موفقیت حذف شد",
    SAVED: "با موفقیت ذخیره شد",
    SENT: "با موفقیت ارسال شد",
    ENROLLED: "ثبت‌نام با موفقیت انجام شد",
    PAYMENT_SUCCESS: "پرداخت با موفقیت انجام شد",
    LOGIN_SUCCESS: "ورود با موفقیت انجام شد",
    LOGOUT_SUCCESS: "خروج با موفقیت انجام شد",
    REGISTER_SUCCESS: "ثبت‌نام با موفقیت انجام شد",
  },

  // Error Messages
  ERROR: {
    GENERAL: "خطایی رخ داده است",
    NETWORK: "خطا در ارتباط با سرور",
    VALIDATION: "اطلاعات وارد شده نامعتبر است",
    UNAUTHORIZED: "شما مجاز به انجام این عملیات نیستید",
    FORBIDDEN: "دسترسی مجاز نیست",
    NOT_FOUND: "اطلاعات مورد نظر یافت نشد",
    SERVER_ERROR: "خطای داخلی سرور",
    TIMEOUT: "زمان انتظار تمام شد",
    DUPLICATE: "این اطلاعات قبلاً ثبت شده است",
    PAYMENT_FAILED: "پرداخت ناموفق بود",
    LOGIN_FAILED: "ورود ناموفق بود",
    REGISTER_FAILED: "ثبت‌نام ناموفق بود",
  },

  // Warning Messages
  WARNING: {
    UNSAVED_CHANGES: "تغییرات ذخیره نشده دارید",
    SESSION_EXPIRING: "جلسه شما در حال انقضا است",
    INCOMPLETE_DATA: "برخی اطلاعات ناقص است",
    CONFIRM_DELETE: "آیا از حذف اطمینان دارید؟",
    CONFIRM_LOGOUT: "آیا می‌خواهید خارج شوید؟",
  },

  // Info Messages
  INFO: {
    LOADING: "در حال بارگذاری...",
    PROCESSING: "در حال پردازش...",
    SAVING: "در حال ذخیره...",
    SENDING: "در حال ارسال...",
    REDIRECTING: "در حال انتقال...",
    NO_DATA: "اطلاعاتی یافت نشد",
    EMPTY_LIST: "لیست خالی است",
  },
};

export const HTTP_STATUS_MESSAGES = {
  400: ALERT_MESSAGES.ERROR.VALIDATION,
  401: ALERT_MESSAGES.ERROR.UNAUTHORIZED,
  403: ALERT_MESSAGES.ERROR.FORBIDDEN,
  404: ALERT_MESSAGES.ERROR.NOT_FOUND,
  409: ALERT_MESSAGES.ERROR.DUPLICATE,
  422: ALERT_MESSAGES.ERROR.VALIDATION,
  500: ALERT_MESSAGES.ERROR.SERVER_ERROR,
  502: ALERT_MESSAGES.ERROR.NETWORK,
  503: ALERT_MESSAGES.ERROR.NETWORK,
  504: ALERT_MESSAGES.ERROR.TIMEOUT,
};
