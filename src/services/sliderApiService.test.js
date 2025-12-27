/**
 * Unit tests for SliderApiService error handling scenarios
 * Feature: slider-api-integration-fix
 * Requirements: 5.2, 5.3
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { SliderApiService } from "./sliderApiService";
import { api } from "./api";

// Mock the API module
vi.mock("./api", () => ({
  api: {
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock the transform utilities - provide default return values
vi.mock("../utils/sliderDataTransform", () => ({
  transformSlideFormToApi: vi.fn(() => new FormData()),
  transformSlideFormToApiForUpdate: vi.fn(() => new FormData()),
  transformStoryFormToApi: vi.fn(() => new FormData()),
  transformStoryFormToApiForUpdate: vi.fn(() => new FormData()),
  validateSlideForm: vi.fn(() => ({ isValid: true, errors: {} })),
  validateStoryForm: vi.fn(() => ({ isValid: true, errors: {} })),
  handleApiError: vi.fn((error) => {
    if (error.response?.status === 400) {
      return "اطلاعات وارد شده نامعتبر است";
    } else if (error.response?.status === 401) {
      return "شما مجاز به انجام این عملیات نیستید";
    } else if (error.response?.status === 403) {
      return "دسترسی غیرمجاز";
    } else if (error.response?.status === 404) {
      return "آیتم مورد نظر یافت نشد";
    } else if (error.response?.status >= 500) {
      return "خطا در سرور. لطفاً دوباره تلاش کنید";
    } else if (!error.response) {
      return "خطا در ارتباط با سرور. اتصال اینترنت خود را بررسی کنید";
    } else {
      return "خطای غیرمنتظره رخ داده است";
    }
  }),
}));

describe("SliderApiService Error Handling", () => {
  let service;
  let mockAlert;

  beforeEach(() => {
    mockAlert = {
      showSuccess: vi.fn(),
      showError: vi.fn(),
    };
    service = new SliderApiService(mockAlert);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("API Validation Error Parsing (400 responses)", () => {
    test("should handle 400 Bad Request with validation errors", async () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            errors: {
              Title: [
                "Title is required",
                "Title must be less than 200 characters",
              ],
              Description: ["Description is too long"],
            },
          },
        },
      };

      api.post.mockRejectedValue(validationError);

      const slideData = {
        title: "Test Slide",
        image: "https://example.com/image.jpg",
        slideType: "permanent",
      };

      await expect(service.createSlide(slideData)).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalledWith(
        "اطلاعات وارد شده نامعتبر است"
      );
    });

    test("should handle 400 Bad Request without specific validation errors", async () => {
      const genericError = {
        response: {
          status: 400,
          data: {
            message: "Bad Request",
          },
        },
      };

      api.post.mockRejectedValue(genericError);

      const slideData = {
        title: "Test Slide",
        image: "https://example.com/image.jpg",
        slideType: "permanent",
      };

      await expect(service.createSlide(slideData)).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalledWith(
        "اطلاعات وارد شده نامعتبر است"
      );
    });

    test("should handle 401 Unauthorized error", async () => {
      const unauthorizedError = {
        response: {
          status: 401,
          data: {
            message: "Unauthorized",
          },
        },
      };

      api.post.mockRejectedValue(unauthorizedError);

      const slideData = {
        title: "Test Slide",
        image: "https://example.com/image.jpg",
        slideType: "permanent",
      };

      await expect(service.createSlide(slideData)).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalledWith(
        "شما مجاز به انجام این عملیات نیستید"
      );
    });

    test("should handle 403 Forbidden error", async () => {
      const forbiddenError = {
        response: {
          status: 403,
          data: {
            message: "Forbidden",
          },
        },
      };

      api.put.mockRejectedValue(forbiddenError);

      const slideData = {
        title: "Test Slide",
        image: "https://example.com/image.jpg",
        slideType: "permanent",
        isActive: true,
      };

      await expect(service.updateSlide("123", slideData)).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalledWith("دسترسی غیرمجاز");
    });

    test("should handle 404 Not Found error", async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: {
            message: "Not Found",
          },
        },
      };

      api.delete.mockRejectedValue(notFoundError);

      await expect(service.deleteSlide("123")).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalledWith(
        "آیتم مورد نظر یافت نشد"
      );
    });

    test("should handle 500 Internal Server Error", async () => {
      const serverError = {
        response: {
          status: 500,
          data: {
            message: "Internal Server Error",
          },
        },
      };

      api.get.mockRejectedValue(serverError);

      await expect(service.getSlides()).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalledWith(
        "خطا در بارگذاری اسلایدها: خطا در سرور. لطفاً دوباره تلاش کنید"
      );
    });

    test("should handle 502 Bad Gateway error", async () => {
      const badGatewayError = {
        response: {
          status: 502,
          data: {
            message: "Bad Gateway",
          },
        },
      };

      api.get.mockRejectedValue(badGatewayError);

      await expect(service.getSlideById("123")).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalledWith(
        "خطا در بارگذاری اسلاید: خطا در سرور. لطفاً دوباره تلاش کنید"
      );
    });
  });

  describe("Network Error Handling", () => {
    test("should handle network connection timeout", async () => {
      const timeoutError = {
        code: "ECONNABORTED",
        message: "timeout of 5000ms exceeded",
      };

      api.post.mockRejectedValue(timeoutError);

      const slideData = {
        title: "Test Slide",
        image: "https://example.com/image.jpg",
        slideType: "permanent",
      };

      await expect(service.createSlide(slideData)).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalledWith(
        "خطا در ارتباط با سرور. اتصال اینترنت خود را بررسی کنید"
      );
    });

    test("should handle network connection refused", async () => {
      const connectionError = {
        code: "ECONNREFUSED",
        message: "connect ECONNREFUSED 127.0.0.1:3000",
      };

      api.post.mockRejectedValue(connectionError);

      const storyData = {
        title: "Test Story",
        image: "https://example.com/image.jpg",
        storyType: "permanent",
      };

      await expect(service.createStory(storyData)).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalledWith(
        "خطا در ارتباط با سرور. اتصال اینترنت خود را بررسی کنید"
      );
    });

    test("should handle DNS resolution failure", async () => {
      const dnsError = {
        code: "ENOTFOUND",
        message: "getaddrinfo ENOTFOUND api.example.com",
      };

      api.put.mockRejectedValue(dnsError);

      const storyData = {
        title: "Test Story",
        image: "https://example.com/image.jpg",
        storyType: "permanent",
        isActive: true,
      };

      await expect(service.updateStory("123", storyData)).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalledWith(
        "خطا در ارتباط با سرور. اتصال اینترنت خود را بررسی کنید"
      );
    });

    test("should handle generic network error without response", async () => {
      const networkError = new Error("Network Error");

      api.delete.mockRejectedValue(networkError);

      await expect(service.deleteStory("123")).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalledWith(
        "خطا در ارتباط با سرور. اتصال اینترنت خود را بررسی کنید"
      );
    });

    test("should handle request cancellation", async () => {
      const cancelError = {
        code: "ERR_CANCELED",
        message: "Request canceled",
      };

      api.get.mockRejectedValue(cancelError);

      await expect(service.getStories()).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalledWith(
        "خطا در بارگذاری استوری‌ها: خطا در ارتباط با سرور. اتصال اینترنت خود را بررسی کنید"
      );
    });
  });

  describe("Validation Error Handling", () => {
    test("should handle validation errors and prevent API calls", async () => {
      // Test that validation errors are properly handled
      // This test verifies the error handling flow without complex mocking

      // Create a mock validation function that returns errors
      const mockValidation = {
        isValid: false,
        errors: {
          title: "عنوان الزامی است",
          image: "تصویر الزامی است",
        },
      };

      // Mock the validation function to return errors
      const { validateSlideForm } = await import(
        "../utils/sliderDataTransform"
      );
      validateSlideForm.mockReturnValueOnce(mockValidation);

      const invalidSlideData = {
        title: "",
        image: "",
        slideType: "permanent",
      };

      // Verify that the service throws an error and doesn't call the API
      await expect(service.createSlide(invalidSlideData)).rejects.toThrow();
      expect(api.post).not.toHaveBeenCalled();
    });

    test("should handle story validation errors", async () => {
      // Test story validation error handling
      const mockValidation = {
        isValid: false,
        errors: {
          title: "عنوان الزامی است",
          image: "تصویر الزامی است",
        },
      };

      const { validateStoryForm } = await import(
        "../utils/sliderDataTransform"
      );
      validateStoryForm.mockReturnValueOnce(mockValidation);

      const invalidStoryData = {
        title: "",
        image: "",
        storyType: "permanent",
      };

      await expect(service.createStory(invalidStoryData)).rejects.toThrow();
      expect(api.post).not.toHaveBeenCalled();
    });

    test("should pass validation and proceed to API call", async () => {
      // Test that valid data passes validation and proceeds to API call
      const mockValidation = {
        isValid: true,
        errors: {},
      };

      const { validateSlideForm } = await import(
        "../utils/sliderDataTransform"
      );
      validateSlideForm.mockReturnValueOnce(mockValidation);

      // Mock successful API response
      api.post.mockResolvedValueOnce({
        data: { id: "123", title: "Test Slide" },
      });

      const validSlideData = {
        title: "Valid Title",
        image: "https://example.com/image.jpg",
        slideType: "permanent",
      };

      const result = await service.createSlide(validSlideData);

      expect(validateSlideForm).toHaveBeenCalledWith(validSlideData);
      expect(api.post).toHaveBeenCalled();
      expect(result).toEqual({ id: "123", title: "Test Slide" });
    });
  });

  describe("Success Message Handling", () => {
    test("should show success message after successful slide creation", async () => {
      api.post.mockResolvedValue({ data: { id: "123", title: "Test Slide" } });

      const slideData = {
        title: "Test Slide",
        image: "https://example.com/image.jpg",
        slideType: "permanent",
      };

      const result = await service.createSlide(slideData);

      expect(result).toEqual({ id: "123", title: "Test Slide" });
      expect(mockAlert.showSuccess).toHaveBeenCalledWith(
        "اسلاید با موفقیت ایجاد شد"
      );
    });

    test("should show success message after successful slide update", async () => {
      api.put.mockResolvedValue({
        data: { id: "123", title: "Updated Slide" },
      });

      const slideData = {
        title: "Updated Slide",
        image: "https://example.com/image.jpg",
        slideType: "permanent",
        isActive: true,
      };

      const result = await service.updateSlide("123", slideData);

      expect(result).toEqual({ id: "123", title: "Updated Slide" });
      expect(mockAlert.showSuccess).toHaveBeenCalledWith(
        "اسلاید با موفقیت به‌روزرسانی شد"
      );
    });

    test("should show success message after successful slide deletion", async () => {
      api.delete.mockResolvedValue({ data: { success: true } });

      const result = await service.deleteSlide("123");

      expect(result).toEqual({ success: true });
      expect(mockAlert.showSuccess).toHaveBeenCalledWith(
        "اسلاید با موفقیت حذف شد"
      );
    });

    test("should show success message after successful story operations", async () => {
      api.post.mockResolvedValue({ data: { id: "456", title: "Test Story" } });

      const storyData = {
        title: "Test Story",
        image: "https://example.com/image.jpg",
        storyType: "permanent",
      };

      const result = await service.createStory(storyData);

      expect(result).toEqual({ id: "456", title: "Test Story" });
      expect(mockAlert.showSuccess).toHaveBeenCalledWith(
        "استوری با موفقیت ایجاد شد"
      );
    });
  });

  describe("Error Handling Without Alert Service", () => {
    test("should handle errors gracefully when no alert service is provided", async () => {
      const serviceWithoutAlert = new SliderApiService();

      const validationError = {
        response: {
          status: 400,
          data: {
            errors: {
              Title: ["Title is required"],
            },
          },
        },
      };

      api.post.mockRejectedValue(validationError);

      const slideData = {
        title: "Test Slide",
        image: "https://example.com/image.jpg",
        slideType: "permanent",
      };

      await expect(
        serviceWithoutAlert.createSlide(slideData)
      ).rejects.toThrow();
      // Should not throw error when trying to call alert methods
    });
  });

  describe("Unexpected Error Handling", () => {
    test("should handle unexpected error responses", async () => {
      const unexpectedError = {
        response: {
          status: 418, // I'm a teapot
          data: {
            message: "I'm a teapot",
          },
        },
      };

      api.post.mockRejectedValue(unexpectedError);

      const slideData = {
        title: "Test Slide",
        image: "https://example.com/image.jpg",
        slideType: "permanent",
      };

      await expect(service.createSlide(slideData)).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalledWith(
        "خطای غیرمنتظره رخ داده است"
      );
    });

    test("should handle errors with malformed response data", async () => {
      const malformedError = {
        response: {
          status: 400,
          data: null,
        },
      };

      api.post.mockRejectedValue(malformedError);

      const slideData = {
        title: "Test Slide",
        image: "https://example.com/image.jpg",
        slideType: "permanent",
      };

      await expect(service.createSlide(slideData)).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalledWith(
        "اطلاعات وارد شده نامعتبر است"
      );
    });
  });
});
