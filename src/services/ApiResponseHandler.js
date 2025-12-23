/**
 * API Response Handler - مدیریت مرکزی پاسخ های API
 */

import AlertService from "./AlertService";
import { ALERT_MESSAGES, HTTP_STATUS_MESSAGES } from "./AlertTypes";

class ApiResponseHandler {
  constructor() {
    this.defaultOptions = {
      showSuccessAlert: true,
      showErrorAlert: true,
      successMessage: null,
      errorMessage: null,
      redirectOnUnauthorized: true,
      redirectOnForbidden: false,
    };
  }

  /**
   * مدیریت پاسخ موفق API
   */
  handleSuccess(response, options = {}) {
    const opts = { ...this.defaultOptions, ...options };

    if (opts.showSuccessAlert) {
      const message =
        opts.successMessage ||
        response.message ||
        this._getDefaultSuccessMessage(response);

      AlertService.success(message, {
        duration: 4000,
      });
    }

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  }

  /**
   * مدیریت خطای API
   */
  handleError(error, options = {}) {
    const opts = { ...this.defaultOptions, ...options };

    console.error("API Error:", error);

    // استخراج اطلاعات خطا
    const errorInfo = this._extractErrorInfo(error);

    // مدیریت خطاهای خاص
    this._handleSpecificErrors(errorInfo, opts);

    if (opts.showErrorAlert) {
      const message =
        opts.errorMessage ||
        errorInfo.message ||
        this._getDefaultErrorMessage(errorInfo);

      AlertService.error(message, {
        duration: 6000,
        actions: this._getErrorActions(errorInfo),
        // اضافه کردن error object برای کپی کردن
        errorObject: error,
      });
    }

    return {
      success: false,
      error: errorInfo,
      message: errorInfo.message,
    };
  }

  /**
   * مدیریت خطاهای Validation
   */
  handleValidationError(validationErrors, options = {}) {
    const opts = { showErrorAlert: true, ...options };

    if (opts.showErrorAlert) {
      const errorMessages = Object.values(validationErrors).flat();
      const message =
        errorMessages.length > 1
          ? `${errorMessages.length} خطای اعتبارسنجی وجود دارد`
          : errorMessages[0];

      AlertService.error(message, {
        duration: 6000,
        title: "خطای اعتبارسنجی",
      });
    }

    return {
      success: false,
      validationErrors,
      message: "خطای اعتبارسنجی",
    };
  }

  /**
   * مدیریت خطای شبکه
   */
  handleNetworkError(options = {}) {
    const opts = { showErrorAlert: true, ...options };

    if (opts.showErrorAlert) {
      AlertService.error(ALERT_MESSAGES.ERROR.NETWORK, {
        duration: 6000,
        actions: [
          {
            label: "تلاش مجدد",
            action: () => window.location.reload(),
          },
        ],
        // اضافه کردن error object برای کپی کردن
        errorObject: {
          type: "NETWORK_ERROR",
          message: ALERT_MESSAGES.ERROR.NETWORK,
        },
      });
    }

    return {
      success: false,
      error: { type: "NETWORK_ERROR" },
      message: ALERT_MESSAGES.ERROR.NETWORK,
    };
  }

  // Private Methods
  _extractErrorInfo(error) {
    if (error.response) {
      // خطای HTTP
      const { status, data } = error.response;
      return {
        type: "HTTP_ERROR",
        status,
        message:
          data?.message ||
          HTTP_STATUS_MESSAGES[status] ||
          ALERT_MESSAGES.ERROR.GENERAL,
        errorCode: data?.errorCode,
        errorDetails: data?.errorDetails,
        validationErrors: data?.errors,
      };
    } else if (error.request) {
      // خطای شبکه
      return {
        type: "NETWORK_ERROR",
        message: ALERT_MESSAGES.ERROR.NETWORK,
      };
    } else {
      // خطای عمومی
      return {
        type: "GENERAL_ERROR",
        message: error.message || ALERT_MESSAGES.ERROR.GENERAL,
      };
    }
  }

  _handleSpecificErrors(errorInfo, options) {
    switch (errorInfo.status) {
      case 401:
        if (options.redirectOnUnauthorized) {
          this._handleUnauthorized();
        }
        break;

      case 403:
        if (options.redirectOnForbidden) {
          this._handleForbidden();
        }
        break;

      case 422:
        if (errorInfo.validationErrors) {
          return this.handleValidationError(
            errorInfo.validationErrors,
            options
          );
        }
        break;
    }
  }

  _handleUnauthorized() {
    // پاک کردن token و هدایت به صفحه ورود
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  }

  _handleForbidden() {
    // هدایت به صفحه عدم دسترسی
    setTimeout(() => {
      window.location.href = "/403";
    }, 2000);
  }

  _getDefaultSuccessMessage(response) {
    // تشخیص نوع عملیات بر اساس method یا محتوا
    if (response.message) return response.message;
    return ALERT_MESSAGES.SUCCESS.SAVED;
  }

  _getDefaultErrorMessage(errorInfo) {
    return errorInfo.message || ALERT_MESSAGES.ERROR.GENERAL;
  }

  _getErrorActions(errorInfo) {
    const actions = [];

    if (errorInfo.type === "NETWORK_ERROR") {
      actions.push({
        label: "تلاش مجدد",
        action: () => window.location.reload(),
      });
    }

    return actions;
  }
}

// Singleton Instance
const apiResponseHandler = new ApiResponseHandler();

export default apiResponseHandler;
