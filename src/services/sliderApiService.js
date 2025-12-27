/**
 * Slider API Service
 *
 * This service handles all API operations for HeroSlides and SuccessStories
 * with proper data transformation and error handling.
 */

import { api } from "./api";
import {
  transformSlideFormToApi,
  transformSlideFormToApiForUpdate,
  transformStoryFormToApi,
  transformStoryFormToApiForUpdate,
  validateSlideForm,
  validateStoryForm,
  handleApiError,
} from "../utils/sliderDataTransform";

/**
 * Slider API Service Class
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

      // Make API request with timeout and proper headers
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

      // Add context to the error
      const contextualError = {
        ...error,
        context: "creating slide",
        slideData: { title: slideData.title, slideType: slideData.slideType },
      };

      const errorMessage = handleApiError(contextualError);
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
      // Validate form data
      const validation = validateSlideForm(slideData);
      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors).join("; ");
        throw new Error(errorMessage);
      }

      // Transform form data to API format for update
      const formData = transformSlideFormToApiForUpdate(slideData);

      // Make API request with timeout and proper headers
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

      // Add context to the error
      const contextualError = {
        ...error,
        context: "updating slide",
        slideId: id,
        slideData: { title: slideData.title, slideType: slideData.slideType },
      };

      const errorMessage = handleApiError(contextualError);
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

      // Add context to the error
      const contextualError = {
        ...error,
        context: "deleting slide",
        slideId: id,
      };

      const errorMessage = handleApiError(contextualError);
      if (this.alert) {
        this.alert.showError(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Get all hero slides
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - API response
   */
  async getSlides(params = {}) {
    try {
      const defaultParams = {
        adminView: true,
        includeInactive: true,
        includeExpired: true,
        ...params,
      };

      const response = await api.get("/HeroSlides", {
        params: defaultParams,
        timeout: 15000, // 15 second timeout for data fetching
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching slides:", error);

      // Add context to the error
      const contextualError = {
        ...error,
        context: "fetching slides",
        params,
      };

      const errorMessage = handleApiError(contextualError);
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

      // Add context to the error
      const contextualError = {
        ...error,
        context: "fetching slide by ID",
        slideId: id,
      };

      const errorMessage = handleApiError(contextualError);
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
      // Validate form data
      const validation = validateStoryForm(storyData);
      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors).join("; ");
        throw new Error(errorMessage);
      }

      // Transform form data to API format
      const formData = transformStoryFormToApi(storyData);

      // Make API request with timeout and proper headers
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

      // Add context to the error
      const contextualError = {
        ...error,
        context: "creating success story",
        storyData: { title: storyData.title, storyType: storyData.storyType },
      };

      const errorMessage = handleApiError(contextualError);
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
      // Validate form data
      const validation = validateStoryForm(storyData);
      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors).join("; ");
        throw new Error(errorMessage);
      }

      // Transform form data to API format for update
      const formData = transformStoryFormToApiForUpdate(storyData);

      // Make API request with timeout and proper headers
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

      // Add context to the error
      const contextualError = {
        ...error,
        context: "updating success story",
        storyId: id,
        storyData: { title: storyData.title, storyType: storyData.storyType },
      };

      const errorMessage = handleApiError(contextualError);
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
      const response = await api.delete(`/SuccessStories/${id}`);

      if (this.alert) {
        this.alert.showSuccess("استوری با موفقیت حذف شد");
      }

      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      if (this.alert) {
        this.alert.showError(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Get all success stories
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - API response
   */
  async getStories(params = {}) {
    try {
      const defaultParams = {
        adminView: true,
        includeInactive: true,
        includeExpired: true,
        ...params,
      };

      const response = await api.get("/SuccessStories", {
        params: defaultParams,
      });
      return response.data;
    } catch (error) {
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
      const response = await api.get(`/SuccessStories/${id}`);
      return response.data;
    } catch (error) {
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
