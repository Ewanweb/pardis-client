/**
 * Custom Hook برای استفاده راحت از Alert System
 */

import AlertService from "../services/AlertService";
import { ALERT_MESSAGES } from "../services/AlertTypes";

/**
 * Custom Hook برای استفاده راحت از Alert System
 */

import AlertService from "../services/AlertService";
import { ALERT_MESSAGES } from "../services/AlertTypes";

export const useAlert = () => {
  const showSuccess = (message, options = {}) => {
    return AlertService.success(message, options);
  };

  const showError = (message, options = {}) => {
    return AlertService.error(message, options);
  };

  const showWarning = (message, options = {}) => {
    return AlertService.warning(message, options);
  };

  const showInfo = (message, options = {}) => {
    return AlertService.info(message, options);
  };

  const dismiss = (alertId) => {
    AlertService.dismiss(alertId);
  };

  const dismissAll = () => {
    AlertService.dismissAll();
  };

  // پیام‌های از پیش تعریف شده
  const showCreateSuccess = (itemName = "آیتم") => {
    return showSuccess(`${itemName} با موفقیت ایجاد شد`);
  };

  const showUpdateSuccess = (itemName = "آیتم") => {
    return showSuccess(`${itemName} با موفقیت بروزرسانی شد`);
  };

  const showDeleteSuccess = (itemName = "آیتم") => {
    return showSuccess(`${itemName} با موفقیت حذف شد`);
  };

  const showSaveSuccess = () => {
    return showSuccess(ALERT_MESSAGES.SUCCESS.SAVED);
  };

  const showNetworkError = () => {
    return showError(ALERT_MESSAGES.ERROR.NETWORK, {
      actions: [
        {
          label: "تلاش مجدد",
          action: () => window.location.reload(),
        },
      ],
    });
  };

  const showErrorWithDetails = (message, errorObject, options = {}) => {
    return showError(message, {
      ...options,
      errorObject,
    });
  };

  const showValidationError = (message = ALERT_MESSAGES.ERROR.VALIDATION) => {
    return showError(message);
  };

  const showUnauthorizedError = () => {
    return showError(ALERT_MESSAGES.ERROR.UNAUTHORIZED);
  };

  const showNotFoundError = (itemName = "آیتم") => {
    return showError(`${itemName} یافت نشد`);
  };

  const showConfirmDelete = (itemName = "آیتم", onConfirm) => {
    return showWarning(`آیا از حذف ${itemName} اطمینان دارید؟`, {
      persistent: true,
      actions: [
        {
          label: "حذف",
          action: onConfirm,
        },
        {
          label: "انصراف",
          action: () => {}, // فقط Alert رو می‌بنده
        },
      ],
    });
  };

  const showLoading = (message = ALERT_MESSAGES.INFO.LOADING) => {
    return showInfo(message, { persistent: true });
  };

  return {
    // متدهای اصلی
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismiss,
    dismissAll,

    // متدهای کاربردی
    showCreateSuccess,
    showUpdateSuccess,
    showDeleteSuccess,
    showSaveSuccess,
    showNetworkError,
    showValidationError,
    showUnauthorizedError,
    showNotFoundError,
    showConfirmDelete,
    showLoading,
    showErrorWithDetails,
  };
};

export default useAlert;
