/**
 * Clipboard Utilities
 * ابزارهای کپی کردن متن
 */

/**
 * کپی کردن متن به clipboard
 * @param {string} text - متن برای کپی
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const copyToClipboard = async (text) => {
  try {
    // روش مدرن (Clipboard API)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // روش قدیمی (fallback)
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    return successful;
  } catch (error) {
    console.error("Failed to copy text:", error);
    return false;
  }
};

/**
 * فرمت کردن اطلاعات خطا برای کپی
 * @param {Error|Object} error - خطا
 * @returns {string} - متن فرمت شده
 */
export const formatErrorForCopy = (error) => {
  if (!error) return "خطای نامشخص";

  const timestamp = new Date().toLocaleString("fa-IR");
  const url = window.location.href;

  let errorText = `🚨 گزارش خطا - ${timestamp}\n`;
  errorText += `📍 URL: ${url}\n`;
  errorText += `\n--- جزئیات خطا ---\n`;

  // اطلاعات اصلی خطا
  if (error.message) {
    errorText += `پیام: ${error.message}\n`;
  }

  if (error.name) {
    errorText += `نوع خطا: ${error.name}\n`;
  }

  // اطلاعات HTTP Response (برای خطاهای API)
  if (error.response) {
    errorText += `HTTP Status: ${error.response.status}\n`;

    if (error.response.data) {
      if (typeof error.response.data === "string") {
        errorText += `Response: ${error.response.data}\n`;
      } else {
        errorText += `Response: ${JSON.stringify(
          error.response.data,
          null,
          2
        )}\n`;
      }
    }

    if (error.response.headers) {
      errorText += `Headers: ${JSON.stringify(
        error.response.headers,
        null,
        2
      )}\n`;
    }
  }

  // اطلاعات Request (برای خطاهای API)
  if (error.config) {
    errorText += `\n--- جزئیات درخواست ---\n`;
    errorText += `Method: ${error.config.method?.toUpperCase()}\n`;
    errorText += `URL: ${error.config.url}\n`;

    if (error.config.data) {
      errorText += `Request Data: ${JSON.stringify(
        error.config.data,
        null,
        2
      )}\n`;
    }
  }

  // Component Stack (برای خطاهای React)
  if (error.componentStack) {
    errorText += `\n--- React Component Stack ---\n`;
    errorText += `${error.componentStack}\n`;
  }

  // Stack trace (اگر موجود باشد)
  if (error.stack) {
    errorText += `\n--- Stack Trace ---\n`;
    errorText += `${error.stack}\n`;
  }

  // اطلاعات مرورگر
  errorText += `\n--- اطلاعات محیط ---\n`;
  errorText += `User Agent: ${navigator.userAgent}\n`;
  errorText += `Language: ${navigator.language}\n`;
  errorText += `Screen: ${screen.width}x${screen.height}\n`;
  errorText += `Viewport: ${window.innerWidth}x${window.innerHeight}\n`;
  errorText += `Local Time: ${new Date().toString()}\n`;

  return errorText;
};

/**
 * کپی کردن اطلاعات خطا با فرمت کامل
 * @param {Error|Object} error - خطا
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const copyErrorDetails = async (error) => {
  const formattedError = formatErrorForCopy(error);
  return await copyToClipboard(formattedError);
};
