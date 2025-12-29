/**
 * Simplified Slider API Service
 *
 * This service handles all API operations for HeroSlides and SuccessStories
 * with simplified data structure and proper multipart/form-data handling.
 */

import { api } from "./api";

/**
 * Simplified data transformation utilities
 */

/**
 * Transform slide form data to API format for creation
 * @param {Object} formData - Frontend form data
 * @returns {FormData} - API-formatted FormData object
 */
function transformSlideFormToApi(formData) {
  const apiData = new FormData();

  // Required fields
  if (formData.title) {
    apiData.append("Title", formData.title);
  }

  // Optional fields - include empty strings but not null/undefined
  if (formData.description !== null && formData.description !== undefined) {
    apiData.append("Description", formData.description);
  }

  // Handle image - prioritize file over URL
  if (formData.imageFile) {
    apiData.append("ImageFile", formData.imageFile);
  } else if (formData.imageUrl) {
    apiData.append("ImageUrl", formData.imageUrl);
  }

  // Single action button (simplified from primary/secondary actions)
  if (formData.actionLabel) {
    apiData.append("ActionLabel", formData.actionLabel);
  }

  if (formData.actionLink) {
    apiData.append("ActionLink", formData.actionLink);
  }

  // Order and active status
  if (formData.order !== undefined && formData.order !== null) {
    apiData.append("Order", formData.order.toString());
  }

  return apiData;
}

/**
 * Transform slide form data to API format for updates
 * @param {Object} formData - Frontend form data
 * @returns {FormData} - API-formatted FormData object
 */
function transformSlideFormToApiForUpdate(formData) {
  const apiData = transformSlideFormToApi(formData);

  // Add update-specific fields
  if (formData.isActive !== undefined) {
    apiData.append("IsActive", formData.isActive.toString());
  }

  return apiData;
}

/**
 * Validate slide form data before API submission
 * @param {Object} data - Frontend form data
 * @param {boolean} isUpdate - Whether this is an update operation (partial validation)
 * @returns {Object} - Validation result with isValid boolean and errors object
 */
function validateSlideForm(data, isUpdate = false) {
  const errors = {};

  // Required field validation (only for creation, not updates)
  if (!isUpdate) {
    if (!data.title?.trim()) {
      errors.title = "عنوان الزامی است";
    }

    // Image validation - either URL or file required for creation
    if (!data.imageUrl?.trim() && !data.imageFile) {
      errors.image = "تصویر الزامی است";
    }
  } else {
    // For updates, only validate title if it's provided
    if (data.title !== undefined && !data.title?.trim()) {
      errors.title = "عنوان نمی‌تواند خالی باشد";
    }
  }

  // Field length validation
  if (data.title && data.title.length > 200) {
    errors.title = "عنوان نباید بیش از 200 کاراکتر باشد";
  }

  if (data.description && data.description.length > 500) {
    errors.description = "توضیحات نباید بیش از 500 کاراکتر باشد";
  }

  if (data.actionLabel && data.actionLabel.length > 100) {
    errors.actionLabel = "متن دکمه نباید بیش از 100 کاراکتر باشد";
  }

  if (data.actionLink && data.actionLink.length > 500) {
    errors.actionLink = "لینک دکمه نباید بیش از 500 کاراکتر باشد";
  }

  if (data.imageUrl && data.imageUrl.length > 500) {
    errors.imageUrl = "آدرس تصویر نباید بیش از 500 کاراکتر باشد";
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
function handleApiError(error) {
  // Handle network errors (no response received)
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "درخواست منقضی شد. لطفاً دوباره تلاش کنید";
    } else if (error.code === "ECONNREFUSED") {
      return "خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید";
    } else if (error.code === "ENOTFOUND") {
      return "خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید";
    } else if (error.code === "ERR_CANCELED") {
      return "درخواست لغو شد";
    } else {
      return "خطا در ارتباط با سرور. اتصال اینترنت خود را بررسی کنید";
    }
  }

  // Handle HTTP response errors
  const status = error.response.status;
  const responseData = error.response.data;

  if (status === 400) {
    if (responseData?.errors && typeof responseData.errors === "object") {
      const errorMessages = [];
      Object.keys(responseData.errors).forEach((field) => {
        const messages = responseData.errors[field];
        if (Array.isArray(messages)) {
          errorMessages.push(messages.join(", "));
        } else if (typeof messages === "string") {
          errorMessages.push(messages);
        }
      });
      if (errorMessages.length > 0) {
        return errorMessages.join("; ");
      }
    }
    if (responseData?.message) {
      return responseData.message;
    }
    return "اطلاعات وارد شده نامعتبر است";
  } else if (status === 401) {
    return "شما مجاز به انجام این عملیات نیستید. لطفاً وارد حساب کاربری خود شوید";
  } else if (status === 403) {
    return "دسترسی غیرمجاز. شما اجازه انجام این عملیات را ندارید";
  } else if (status === 404) {
    return "آیتم مورد نظر یافت نشد";
  } else if (status === 413) {
    return "حجم فایل بیش از حد مجاز است";
  } else if (status === 415) {
    return "نوع فایل پشتیبانی نمی‌شود";
  } else if (status >= 500) {
    return "خطا در سرور. لطفاً دوباره تلاش کنید";
  } else {
    if (responseData?.message) {
      return responseData.message;
    }
    return "خطای غیرمنتظره رخ داده است";
  }
}
/**
 * Simplified Slider API Service Class
 */
export class SliderApiService {
  constructor(alertService = null) {
    this.alert = alertService;
  }

  /**
   * Create a new hero slide
   * @param {Object} slideData - Frontend form data
   * @returns {Promise<Object>} - API response
   */
  async createSlide(slideData) {
    try {
      // Validate form data
      const validation = validateSlideForm(slideData);
      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors).join("; ");
        throw new Error(errorMessage);
      }

      // Transform form data to API format
      const formData = transformSlideFormToApi(slideData);

      // Make API request with proper headers for multipart/form-data
      const response = await api.post("/HeroSlides", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout for file uploads
      });

      if (this.alert) {
        this.alert.showSuccess("اسلاید با موفقیت ایجاد شد");
      }

      return response.data;
    } catch (error) {
      console.error("Error creating slide:", error);

      const errorMessage = handleApiError(error);
      if (this.alert) {
        this.alert.showError(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Update an existing hero slide
   * @param {string} id - Slide ID
   * @param {Object} slideData - Frontend form data
   * @returns {Promise<Object>} - API response
   */
  async updateSlide(id, slideData) {
    try {
      // Validate form data for update (partial validation)
      const validation = validateSlideForm(slideData, true);
      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors).join("; ");
        throw new Error(errorMessage);
      }

      // Transform form data to API format for update
      const formData = transformSlideFormToApiForUpdate(slideData);

      // Make API request with proper headers for multipart/form-data
      const response = await api.put(`/HeroSlides/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout for file uploads
      });

      if (this.alert) {
        this.alert.showSuccess("اسلاید با موفقیت به‌روزرسانی شد");
      }

      return response.data;
    } catch (error) {
      console.error("Error updating slide:", error);

      const errorMessage = handleApiError(error);
      if (this.alert) {
        this.alert.showError(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Delete a hero slide
   * @param {string} id - Slide ID
   * @returns {Promise<Object>} - API response
   */
  async deleteSlide(id) {
    try {
      const response = await api.delete(`/HeroSlides/${id}`, {
        timeout: 10000, // 10 second timeout for delete operations
      });

      if (this.alert) {
        this.alert.showSuccess("اسلاید با موفقیت حذف شد");
      }

      return response.data;
    } catch (error) {
      console.error("Error deleting slide:", error);

      const errorMessage = handleApiError(error);
      if (this.alert) {
        this.alert.showError(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Get all hero slides (simplified - no complex query parameters)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - API response
   */
  async getSlides(params = {}) {
    try {
      const response = await api.get("/HeroSlides", {
        params,
        timeout: 15000, // 15 second timeout for data fetching
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching slides:", error);

      const errorMessage = handleApiError(error);
      if (this.alert) {
        this.alert.showError(`خطا در بارگذاری اسلایدها: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Get a single hero slide by ID
   * @param {string} id - Slide ID
   * @returns {Promise<Object>} - API response
   */
  async getSlideById(id) {
    try {
      const response = await api.get(`/HeroSlides/${id}`, {
        timeout: 10000, // 10 second timeout for single item fetch
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching slide by ID:", error);

      const errorMessage = handleApiError(error);
      if (this.alert) {
        this.alert.showError(`خطا در بارگذاری اسلاید: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Create a new success story
   * @param {Object} storyData - Frontend form data
   * @returns {Promise<Object>} - API response
   */
  async createStory(storyData) {
    try {
      // Validate form data (using same validation as slides for consistency)
      const validation = validateSlideForm(storyData);
      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors).join("; ");
        throw new Error(errorMessage);
      }

      // Transform form data to API format (same structure as slides)
      const formData = transformSlideFormToApi(storyData);

      // Make API request with proper headers for multipart/form-data
      const response = await api.post("/SuccessStories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout for file uploads
      });

      if (this.alert) {
        this.alert.showSuccess("استوری با موفقیت ایجاد شد");
      }

      return response.data;
    } catch (error) {
      console.error("Error creating story:", error);

      const errorMessage = handleApiError(error);
      if (this.alert) {
        this.alert.showError(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Update an existing success story
   * @param {string} id - Story ID
   * @param {Object} storyData - Frontend form data
   * @returns {Promise<Object>} - API response
   */
  async updateStory(id, storyData) {
    try {
      // Validate form data for update (partial validation)
      const validation = validateSlideForm(storyData, true);
      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors).join("; ");
        throw new Error(errorMessage);
      }

      // Transform form data to API format for update (same structure as slides)
      const formData = transformSlideFormToApiForUpdate(storyData);

      // Make API request with proper headers for multipart/form-data
      const response = await api.put(`/SuccessStories/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout for file uploads
      });

      if (this.alert) {
        this.alert.showSuccess("استوری با موفقیت به‌روزرسانی شد");
      }

      return response.data;
    } catch (error) {
      console.error("Error updating story:", error);

      const errorMessage = handleApiError(error);
      if (this.alert) {
        this.alert.showError(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Delete a success story
   * @param {string} id - Story ID
   * @returns {Promise<Object>} - API response
   */
  async deleteStory(id) {
    try {
      const response = await api.delete(`/SuccessStories/${id}`, {
        timeout: 10000, // 10 second timeout for delete operations
      });

      if (this.alert) {
        this.alert.showSuccess("استوری با موفقیت حذف شد");
      }

      return response.data;
    } catch (error) {
      console.error("Error deleting story:", error);

      const errorMessage = handleApiError(error);
      if (this.alert) {
        this.alert.showError(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Get all success stories (simplified - no complex query parameters)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - API response
   */
  async getStories(params = {}) {
    try {
      const response = await api.get("/SuccessStories", {
        params,
        timeout: 15000, // 15 second timeout for data fetching
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching stories:", error);

      const errorMessage = handleApiError(error);
      if (this.alert) {
        this.alert.showError(`خطا در بارگذاری استوری‌ها: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Get a single success story by ID
   * @param {string} id - Story ID
   * @returns {Promise<Object>} - API response
   */
  async getStoryById(id) {
    try {
      const response = await api.get(`/SuccessStories/${id}`, {
        timeout: 10000, // 10 second timeout for single item fetch
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching story by ID:", error);

      const errorMessage = handleApiError(error);
      if (this.alert) {
        this.alert.showError(`خطا در بارگذاری استوری: ${errorMessage}`);
      }
      throw error;
    }
  }
}

// Create default instance
export const sliderApiService = new SliderApiService();

// Export individual functions for backward compatibility
export const createSlide = (slideData) =>
  sliderApiService.createSlide(slideData);
export const updateSlide = (id, slideData) =>
  sliderApiService.updateSlide(id, slideData);
export const deleteSlide = (id) => sliderApiService.deleteSlide(id);
export const getSlides = (params) => sliderApiService.getSlides(params);
export const getSlideById = (id) => sliderApiService.getSlideById(id);

export const createStory = (storyData) =>
  sliderApiService.createStory(storyData);
export const updateStory = (id, storyData) =>
  sliderApiService.updateStory(id, storyData);
export const deleteStory = (id) => sliderApiService.deleteStory(id);
export const getStories = (params) => sliderApiService.getStories(params);
export const getStoryById = (id) => sliderApiService.getStoryById(id);

export default SliderApiService;
