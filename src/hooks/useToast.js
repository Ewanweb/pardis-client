import { useState, useCallback } from "react";

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = ++toastId;
    const newToast = {
      id,
      type: "info",
      duration: 5000,
      showProgress: true,
      position: "top-right",
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback(
    (title, message, options = {}) => {
      return addToast({
        type: "success",
        title,
        message,
        ...options,
      });
    },
    [addToast]
  );

  const error = useCallback(
    (title, message, options = {}) => {
      return addToast({
        type: "error",
        title,
        message,
        duration: 7000, // Longer duration for errors
        ...options,
      });
    },
    [addToast]
  );

  const warning = useCallback(
    (title, message, options = {}) => {
      return addToast({
        type: "warning",
        title,
        message,
        ...options,
      });
    },
    [addToast]
  );

  const info = useCallback(
    (title, message, options = {}) => {
      return addToast({
        type: "info",
        title,
        message,
        ...options,
      });
    },
    [addToast]
  );

  // Promise-based toasts for async operations
  const promise = useCallback(
    (promise, messages, options = {}) => {
      const loadingToastId = addToast({
        type: "info",
        title: messages.loading || "در حال پردازش...",
        duration: 0, // Don't auto-close loading toast
        showProgress: false,
        ...options,
      });

      return promise
        .then((result) => {
          removeToast(loadingToastId);
          success(
            messages.success || "عملیات موفق",
            typeof messages.success === "string"
              ? undefined
              : messages.success?.message,
            options
          );
          return result;
        })
        .catch((error) => {
          removeToast(loadingToastId);
          error(
            messages.error || "خطا در عملیات",
            typeof messages.error === "string"
              ? undefined
              : error.message || messages.error?.message,
            options
          );
          throw error;
        });
    },
    [addToast, removeToast, success, error]
  );

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    promise,
  };
};

export default useToast;
