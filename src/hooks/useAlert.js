import { useCallback, useMemo } from "react";
import AlertService from "../services/AlertService";
import { ALERT_MESSAGES } from "../services/AlertTypes";

export const useAlert = () => {
  const showSuccess = useCallback((message, options = {}) => {
    return AlertService.success(message, options);
  }, []);

  const showError = useCallback((message, options = {}) => {
    return AlertService.error(message, options);
  }, []);

  const showWarning = useCallback((message, options = {}) => {
    return AlertService.warning(message, options);
  }, []);

  const showInfo = useCallback((message, options = {}) => {
    return AlertService.info(message, options);
  }, []);

  const dismiss = useCallback((alertId) => {
    AlertService.dismiss(alertId);
  }, []);

  const dismissAll = useCallback(() => {
    AlertService.dismissAll();
  }, []);

  // پیام‌های از پیش تعریف شده
  const showCreateSuccess = useCallback((itemName = "آیتم") => {
    return showSuccess(`${itemName} با موفقیت ایجاد شد`);
  }, [showSuccess]);

  const showUpdateSuccess = useCallback((itemName = "آیتم") => {
    return showSuccess(`${itemName} با موفقیت بروزرسانی شد`);
  }, [showSuccess]);

  const showDeleteSuccess = useCallback((itemName = "آیتم") => {
    return showSuccess(`${itemName} با موفقیت حذف شد`);
  }, [showSuccess]);

  const showSaveSuccess = useCallback(() => {
    return showSuccess(ALERT_MESSAGES.SUCCESS.SAVED);
  }, [showSuccess]);

  const showNetworkError = useCallback(() => {
    return showError(ALERT_MESSAGES.ERROR.NETWORK, {
      actions: [
        {
          label: "تلاش مجدد",
          action: () => window.location.reload(),
        },
      ],
    });
  }, [showError]);

  const showErrorWithDetails = useCallback((message, errorObject, options = {}) => {
    return showError(message, {
      ...options,
      errorObject,
    });
  }, [showError]);

  const showValidationError = useCallback((message = ALERT_MESSAGES.ERROR.VALIDATION) => {
    return showError(message);
  }, [showError]);

  const showUnauthorizedError = useCallback(() => {
    return showError(ALERT_MESSAGES.ERROR.UNAUTHORIZED);
  }, [showError]);

  const showNotFoundError = useCallback((itemName = "آیتم") => {
    return showError(`${itemName} یافت نشد`);
  }, [showError]);

  const showConfirmDelete = useCallback((itemName = "آیتم", onConfirm) => {
    return showWarning(`آیا از حذف ${itemName} اطمینان دارید؟`, {
      persistent: true,
      actions: [
        {
          label: "حذف",
          action: onConfirm,
        },
        {
          label: "انصراف",
          action: () => { }, // فقط Alert رو می‌بنده
        },
      ],
    });
  }, [showWarning]);

  const showLoading = useCallback((message = ALERT_MESSAGES.INFO.LOADING) => {
    return showInfo(message, { persistent: true });
  }, [showInfo]);

  return useMemo(() => ({
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
  }), [
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismiss,
    dismissAll,
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
    showErrorWithDetails
  ]);
};

export default useAlert;
