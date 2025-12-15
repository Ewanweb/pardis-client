import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error, showToast = true) => {
    console.error("Error occurred:", error);
    setError(error);

    if (showToast) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      switch (status) {
        case 400:
          toast.error(message || "درخواست نامعتبر است");
          break;
        case 401:
          toast.error("لطفاً وارد حساب کاربری خود شوید");
          break;
        case 403:
          toast.error("شما اجازه دسترسی به این بخش را ندارید");
          break;
        case 404:
          toast.error(message || "اطلاعات مورد نظر یافت نشد");
          break;
        case 409:
          toast.error(message || "شما قبلاً این عمل را انجام داده‌اید");
          break;
        case 422:
          toast.error(message || "اطلاعات وارد شده نامعتبر است");
          break;
        case 500:
          toast.error("مشکلی در سرور رخ داده است");
          break;
        default:
          toast.error(message || "خطایی رخ داده است");
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeWithErrorHandling = useCallback(
    async (asyncFunction, showToast = true) => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await asyncFunction();
        return result;
      } catch (error) {
        handleError(error, showToast);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling,
  };
};

export default useErrorHandler;
