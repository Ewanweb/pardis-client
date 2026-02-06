import toast from "react-hot-toast";

/**
 * Global error handler for API calls
 * @param {Error} error - The error object
 * @param {Object} options - Configuration options
 * @param {boolean} options.showToast - Whether to show toast notification
 * @param {string} options.customMessage - Custom error message
 * @param {Function} options.onError - Custom error callback
 */
export const handleApiError = (error, options = {}) => {
  const { showToast = true, customMessage = null, onError = null } = options;

  console.error("API Error:", error);

  // Extract error information
  const status = error.response?.status;
  const message = error.response?.data?.message || error.message;
  const data = error.response?.data;

  // Determine error message based on status code
  let errorMessage = customMessage;

  if (!errorMessage) {
    switch (status) {
      case 400:
        errorMessage = message || "درخواست نامعتبر است";
        break;
      case 401:
        errorMessage = "لطفاً وارد حساب کاربری خود شوید";
        // فقط redirect کن اگر کاربر توکن داشت (یعنی لاگین بود اما توکنش منقضی شده)
        // برای کاربران مهمان که اصلاً لاگین نیستند، redirect نکن
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login") &&
          localStorage.getItem("token") // فقط اگر توکن داشت
        ) {
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        }
        break;
      case 403:
        errorMessage = "شما اجازه دسترسی به این بخش را ندارید";
        break;
      case 404:
        errorMessage = message || "اطلاعات مورد نظر یافت نشد";
        break;
      case 409:
        errorMessage = message || "شما قبلاً این عمل را انجام داده‌اید";
        break;
      case 422:
        errorMessage = message || "اطلاعات وارد شده نامعتبر است";
        break;
      case 500:
        errorMessage = "مشکلی در سرور رخ داده است. لطفاً بعداً تلاش کنید";
        break;
      default:
        errorMessage = message || "خطایی رخ داده است";
    }
  }

  // Show toast notification
  if (showToast) {
    if (status === 409) {
      toast.success(errorMessage, { icon: "⚠️" });
    } else {
      toast.error(errorMessage);
    }
  }

  // Call custom error handler
  if (onError && typeof onError === "function") {
    onError(error, { status, message, data, errorMessage });
  }

  return {
    status,
    message: errorMessage,
    originalMessage: message,
    data,
    error,
  };
};

/**
 * Wrapper for API calls with automatic error handling
 * @param {Function} apiCall - The API call function
 * @param {Object} options - Error handling options
 */
export const withErrorHandling = async (apiCall, options = {}) => {
  try {
    const result = await apiCall();
    return { success: true, data: result };
  } catch (error) {
    const errorInfo = handleApiError(error, options);
    return { success: false, error: errorInfo };
  }
};

/**
 * Check if error is a duplicate enrollment error
 * @param {Error} error - The error object
 */
export const isDuplicateEnrollmentError = (error) => {
  const status = error.response?.status;
  const message = error.response?.data?.message || error.message || "";

  return (
    status === 409 ||
    (status === 400 &&
      (message.includes("already enrolled") ||
        message.includes("قبلاً ثبت‌نام") ||
        message.includes("duplicate")))
  );
};

/**
 * Check if error is an authentication error
 * @param {Error} error - The error object
 */
export const isAuthError = (error) => {
  const status = error.response?.status;
  return status === 401 || status === 403;
};

/**
 * Check if error is a network error
 * @param {Error} error - The error object
 */
export const isNetworkError = (error) => {
  return !error.response && error.request;
};

export default {
  handleApiError,
  withErrorHandling,
  isDuplicateEnrollmentError,
  isAuthError,
  isNetworkError,
};
