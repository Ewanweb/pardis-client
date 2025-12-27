/**
 * Data transformation utilities for Slider API integration
 *
 * This module provides functions to transform frontend form data to API-expected format
 * for both HeroSlides and SuccessStories endpoints.
 */

/**
 * Transform slide form data to API format for creation
 * @param {Object} formData - Frontend form data
 * @returns {FormData} - API-formatted FormData object
 */
export function transformSlideFormToApi(formData) {
  const apiData = new FormData();

  // Required fields
  if (formData.title) {
    apiData.append("Title", formData.title);
  }

  // Optional fields with proper mapping
  if (formData.description) {
    apiData.append("Description", formData.description);
  }

  if (formData.badge) {
    apiData.append("Badge", formData.badge);
  }

  // Handle image - prioritize file over URL
  if (formData.imageFile) {
    apiData.append("ImageFile", formData.imageFile);
  } else if (formData.image && formData.image.startsWith("http")) {
    apiData.append("ImageUrl", formData.image);
  }

  // Button actions - send both formats for compatibility
  if (formData.primaryAction?.label) {
    apiData.append("ButtonText", formData.primaryAction.label);
    apiData.append("PrimaryActionLabel", formData.primaryAction.label);
  }

  if (formData.primaryAction?.link) {
    apiData.append("ButtonLink", formData.primaryAction.link);
    apiData.append("PrimaryActionLink", formData.primaryAction.link);
  }

  // Secondary actions
  if (formData.secondaryAction?.label) {
    apiData.append("SecondaryActionLabel", formData.secondaryAction.label);
  }

  if (formData.secondaryAction?.link) {
    apiData.append("SecondaryActionLink", formData.secondaryAction.link);
  }

  // Slide type and expiration
  const isPermanent = formData.slideType === "permanent";
  apiData.append("IsPermanent", isPermanent.toString());

  if (!isPermanent && formData.expiresAt) {
    apiData.append("ExpiresAt", formData.expiresAt);
  }

  // Other fields
  if (formData.order !== undefined && formData.order !== null) {
    apiData.append("Order", formData.order.toString());
  }

  // Link URL (if different from button link)
  if (formData.linkUrl) {
    apiData.append("LinkUrl", formData.linkUrl);
  }

  return apiData;
}

/**
 * Transform slide form data to API format for updates
 * @param {Object} formData - Frontend form data
 * @returns {FormData} - API-formatted FormData object with update-specific fields
 */
export function transformSlideFormToApiForUpdate(formData) {
  const apiData = transformSlideFormToApi(formData);

  // Add update-specific fields
  if (formData.isActive !== undefined) {
    apiData.append("IsActive", formData.isActive.toString());
  }

  return apiData;
}

/**
 * Transform story form data to API format for creation
 * @param {Object} formData - Frontend form data
 * @returns {FormData} - API-formatted FormData object
 */
export function transformStoryFormToApi(formData) {
  const apiData = new FormData();

  // Required fields
  if (formData.title) {
    apiData.append("Title", formData.title);
  }

  // Optional fields with proper mapping
  if (formData.subtitle) {
    apiData.append("Subtitle", formData.subtitle);
  }

  if (formData.description) {
    apiData.append("Description", formData.description);
  }

  if (formData.badge) {
    apiData.append("Badge", formData.badge);
  }

  // Handle image - prioritize file over URL
  if (formData.imageFile) {
    apiData.append("ImageFile", formData.imageFile);
  } else if (formData.image && formData.image.startsWith("http")) {
    apiData.append("ImageUrl", formData.image);
  }

  // Story type
  if (formData.type) {
    apiData.append("Type", formData.type);
  }

  // Student and course information
  if (formData.studentName) {
    apiData.append("StudentName", formData.studentName);
  }

  if (formData.courseName) {
    apiData.append("CourseName", formData.courseName);
  }

  if (formData.courseId) {
    apiData.append("CourseId", formData.courseId);
  }

  // Action button
  if (formData.action?.label) {
    apiData.append("ActionLabel", formData.action.label);
  }

  if (formData.action?.link) {
    apiData.append("ActionLink", formData.action.link);
  }

  // Duration
  if (formData.duration !== undefined && formData.duration !== null) {
    apiData.append("Duration", formData.duration.toString());
  }

  // Story type and expiration
  const isPermanent = formData.storyType === "permanent";
  apiData.append("IsPermanent", isPermanent.toString());

  if (!isPermanent && formData.expiresAt) {
    apiData.append("ExpiresAt", formData.expiresAt);
  }

  // Other fields
  if (formData.order !== undefined && formData.order !== null) {
    apiData.append("Order", formData.order.toString());
  }

  // Link URL (if different from action link)
  if (formData.linkUrl) {
    apiData.append("LinkUrl", formData.linkUrl);
  }

  return apiData;
}

/**
 * Transform story form data to API format for updates
 * @param {Object} formData - Frontend form data
 * @returns {FormData} - API-formatted FormData object with update-specific fields
 */
export function transformStoryFormToApiForUpdate(formData) {
  const apiData = transformStoryFormToApi(formData);

  // Add update-specific fields
  if (formData.isActive !== undefined) {
    apiData.append("IsActive", formData.isActive.toString());
  }

  return apiData;
}

/**
 * Validate slide form data before API submission
 * @param {Object} data - Frontend form data
 * @returns {Object} - Validation result with isValid boolean and errors object
 */
export function validateSlideForm(data) {
  const errors = {};

  // Required field validation
  if (!data.title?.trim()) {
    errors.title = "عنوان الزامی است";
  }

  // Image validation - either URL or file required
  if (!data.image?.trim() && !data.imageFile) {
    errors.image = "تصویر الزامی است";
  }

  // Field length validation based on API constraints
  if (data.title && data.title.length > 200) {
    errors.title = "عنوان نباید بیش از 200 کاراکتر باشد";
  }

  if (data.description && data.description.length > 500) {
    errors.description = "توضیحات نباید بیش از 500 کاراکتر باشد";
  }

  if (data.badge && data.badge.length > 100) {
    errors.badge = "برچسب نباید بیش از 100 کاراکتر باشد";
  }

  if (data.primaryAction?.label && data.primaryAction.label.length > 100) {
    errors.primaryActionLabel = "متن دکمه اصلی نباید بیش از 100 کاراکتر باشد";
  }

  if (data.primaryAction?.link && data.primaryAction.link.length > 500) {
    errors.primaryActionLink = "لینک دکمه اصلی نباید بیش از 500 کاراکتر باشد";
  }

  if (data.secondaryAction?.label && data.secondaryAction.label.length > 100) {
    errors.secondaryActionLabel =
      "متن دکمه ثانویه نباید بیش از 100 کاراکتر باشد";
  }

  if (data.secondaryAction?.link && data.secondaryAction.link.length > 500) {
    errors.secondaryActionLink =
      "لینک دکمه ثانویه نباید بیش از 500 کاراکتر باشد";
  }

  if (data.image && data.image.length > 500) {
    errors.image = "آدرس تصویر نباید بیش از 500 کاراکتر باشد";
  }

  if (data.linkUrl && data.linkUrl.length > 500) {
    errors.linkUrl = "آدرس لینک نباید بیش از 500 کاراکتر باشد";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate story form data before API submission
 * @param {Object} data - Frontend form data
 * @returns {Object} - Validation result with isValid boolean and errors object
 */
export function validateStoryForm(data) {
  const errors = {};

  // Required field validation
  if (!data.title?.trim()) {
    errors.title = "عنوان الزامی است";
  }

  // Image validation - either URL or file required
  if (!data.image?.trim() && !data.imageFile) {
    errors.image = "تصویر الزامی است";
  }

  // Field length validation based on API constraints
  if (data.title && data.title.length > 200) {
    errors.title = "عنوان نباید بیش از 200 کاراکتر باشد";
  }

  if (data.subtitle && data.subtitle.length > 100) {
    errors.subtitle = "زیرعنوان نباید بیش از 100 کاراکتر باشد";
  }

  if (data.description && data.description.length > 1000) {
    errors.description = "توضیحات نباید بیش از 1000 کاراکتر باشد";
  }

  if (data.badge && data.badge.length > 100) {
    errors.badge = "برچسب نباید بیش از 100 کاراکتر باشد";
  }

  if (data.type && data.type.length > 50) {
    errors.type = "نوع استوری نباید بیش از 50 کاراکتر باشد";
  }

  if (data.studentName && data.studentName.length > 100) {
    errors.studentName = "نام دانشجو نباید بیش از 100 کاراکتر باشد";
  }

  if (data.courseName && data.courseName.length > 200) {
    errors.courseName = "نام دوره نباید بیش از 200 کاراکتر باشد";
  }

  if (data.action?.label && data.action.label.length > 100) {
    errors.actionLabel = "متن دکمه عمل نباید بیش از 100 کاراکتر باشد";
  }

  if (data.action?.link && data.action.link.length > 500) {
    errors.actionLink = "لینک دکمه عمل نباید بیش از 500 کاراکتر باشد";
  }

  if (data.image && data.image.length > 500) {
    errors.image = "آدرس تصویر نباید بیش از 500 کاراکتر باشد";
  }

  if (data.linkUrl && data.linkUrl.length > 500) {
    errors.linkUrl = "آدرس لینک نباید بیش از 500 کاراکتر باشد";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Handle API errors and return user-friendly messages
 * @param {Error} error - API error object
 * @returns {string} - User-friendly error message
 */
export function handleApiError(error) {
  // Handle network errors (no response received)
  if (!error.response) {
    // Check for specific network error codes
    if (error.code === "ECONNABORTED") {
      return "درخواست منقضی شد. لطفاً دوباره تلاش کنید";
    } else if (error.code === "ECONNREFUSED") {
      return "خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید";
    } else if (error.code === "ENOTFOUND") {
      return "خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید";
    } else if (error.code === "ERR_CANCELED") {
      return "درخواست لغو شد";
    } else if (
      error.message &&
      error.message.toLowerCase().includes("network")
    ) {
      return "خطا در شبکه. لطفاً اتصال اینترنت خود را بررسی کنید";
    } else {
      return "خطا در ارتباط با سرور. اتصال اینترنت خود را بررسی کنید";
    }
  }

  // Handle HTTP response errors
  const status = error.response.status;
  const responseData = error.response.data;

  if (status === 400) {
    // Handle validation errors with specific field messages
    if (responseData?.errors && typeof responseData.errors === "object") {
      const errorMessages = [];

      // Extract field-specific error messages
      Object.keys(responseData.errors).forEach((field) => {
        const messages = responseData.errors[field];
        if (Array.isArray(messages)) {
          // Join multiple messages for the same field
          const fieldMessage = messages.join(", ");
          errorMessages.push(`${field}: ${fieldMessage}`);
        } else if (typeof messages === "string") {
          errorMessages.push(`${field}: ${messages}`);
        }
      });

      if (errorMessages.length > 0) {
        return errorMessages.join("; ");
      }
    }

    // Handle general validation error message
    if (responseData?.message) {
      return responseData.message;
    }

    // Handle ASP.NET Core validation error format
    if (responseData?.title && responseData.title.includes("validation")) {
      return "اطلاعات وارد شده نامعتبر است. لطفاً فیلدهای مورد نیاز را بررسی کنید";
    }

    return "اطلاعات وارد شده نامعتبر است";
  } else if (status === 401) {
    return "شما مجاز به انجام این عملیات نیستید. لطفاً وارد حساب کاربری خود شوید";
  } else if (status === 403) {
    return "دسترسی غیرمجاز. شما اجازه انجام این عملیات را ندارید";
  } else if (status === 404) {
    return "آیتم مورد نظر یافت نشد";
  } else if (status === 409) {
    return "تداخل در اطلاعات. این عملیات قبلاً انجام شده است";
  } else if (status === 413) {
    return "حجم فایل بیش از حد مجاز است";
  } else if (status === 415) {
    return "نوع فایل پشتیبانی نمی‌شود";
  } else if (status === 422) {
    return "اطلاعات وارد شده قابل پردازش نیست";
  } else if (status >= 500 && status < 600) {
    // Server errors
    if (status === 500) {
      return "خطای داخلی سرور. لطفاً دوباره تلاش کنید";
    } else if (status === 502) {
      return "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید";
    } else if (status === 503) {
      return "سرور در حال حاضر در دسترس نیست. لطفاً بعداً تلاش کنید";
    } else if (status === 504) {
      return "درخواست منقضی شد. لطفاً دوباره تلاش کنید";
    } else {
      return "خطا در سرور. لطفاً دوباره تلاش کنید";
    }
  } else {
    // Handle other HTTP status codes
    if (responseData?.message) {
      return responseData.message;
    }
    return "خطای غیرمنتظره رخ داده است";
  }
}
