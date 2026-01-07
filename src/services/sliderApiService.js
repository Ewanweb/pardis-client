/**
 * Simplified Slider API Service
 *
 * This service handles all API operations for HeroSlides and SuccessStories
 * with simplified data structure and proper multipart/form-data handling.
 * 
 * Uses apiClient from api.js for centralized API management and error handling.
 */

import { apiClient } from "./api";

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

// Error handling is now managed centrally by apiClient from api.js
// No need for duplicate handleApiError function
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

      // Make API request using apiClient (centralized error handling)
      const result = await apiClient.post("/HeroSlides", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout for file uploads
        showSuccessAlert: !!this.alert,
        showErrorAlert: !!this.alert,
        successMessage: "اسلاید با موفقیت ایجاد شد",
      });

      return result.data;
    } catch (error) {
      console.error("Error creating slide:", error);
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

      // Make API request using apiClient (centralized error handling)
      const result = await apiClient.put(`/HeroSlides/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout for file uploads
        showSuccessAlert: !!this.alert,
        showErrorAlert: !!this.alert,
        successMessage: "اسلاید با موفقیت به‌روزرسانی شد",
      });

      return result.data;
    } catch (error) {
      console.error("Error updating slide:", error);
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
      // Make API request using apiClient (centralized error handling)
      const result = await apiClient.delete(`/HeroSlides/${id}`, {
        showSuccessAlert: !!this.alert,
        showErrorAlert: !!this.alert,
        successMessage: "اسلاید با موفقیت حذف شد",
      });

      return result.data;
    } catch (error) {
      console.error("Error deleting slide:", error);
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
      // Make API request using apiClient (centralized error handling)
      const result = await apiClient.get("/HeroSlides", {
        params,
        showErrorAlert: !!this.alert,
      });
      return result.data;
    } catch (error) {
      console.error("Error fetching slides:", error);
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
      // Make API request using apiClient (centralized error handling)
      const result = await apiClient.get(`/HeroSlides/${id}`, {
        showErrorAlert: !!this.alert,
      });
      return result.data;
    } catch (error) {
      console.error("Error fetching slide by ID:", error);
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

      // Make API request using apiClient (centralized error handling)
      const result = await apiClient.post("/SuccessStories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout for file uploads
        showSuccessAlert: !!this.alert,
        showErrorAlert: !!this.alert,
        successMessage: "استوری با موفقیت ایجاد شد",
      });

      return result.data;
    } catch (error) {
      console.error("Error creating story:", error);
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

      // Make API request using apiClient (centralized error handling)
      const result = await apiClient.put(`/SuccessStories/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout for file uploads
        showSuccessAlert: !!this.alert,
        showErrorAlert: !!this.alert,
        successMessage: "استوری با موفقیت به‌روزرسانی شد",
      });

      return result.data;
    } catch (error) {
      console.error("Error updating story:", error);
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
      // Make API request using apiClient (centralized error handling)
      const result = await apiClient.delete(`/SuccessStories/${id}`, {
        showSuccessAlert: !!this.alert,
        showErrorAlert: !!this.alert,
        successMessage: "استوری با موفقیت حذف شد",
      });

      return result.data;
    } catch (error) {
      console.error("Error deleting story:", error);
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
      // Make API request using apiClient (centralized error handling)
      const result = await apiClient.get("/SuccessStories", {
        params,
        showErrorAlert: !!this.alert,
      });
      return result.data;
    } catch (error) {
      console.error("Error fetching stories:", error);
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
      // Make API request using apiClient (centralized error handling)
      const result = await apiClient.get(`/SuccessStories/${id}`, {
        showErrorAlert: !!this.alert,
      });
      return result.data;
    } catch (error) {
      console.error("Error fetching story by ID:", error);
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
