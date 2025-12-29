/**
 * Property-based tests for SliderApiService
 * Feature: simplified-slider-system
 * Property 5: Frontend-Backend Data Mapping
 * Requirements: 4.1, 4.3
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

describe("SliderApiService Property Tests", () => {
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

  /**
   * Property 5: Frontend-Backend Data Mapping
   * For any slider data sent from frontend to backend, all field names and values
   * should be correctly mapped and preserved during the transformation process
   * **Validates: Requirements 4.1, 4.3**
   */
  describe("Property 5: Frontend-Backend Data Mapping", () => {
    test("should correctly map all essential fields from frontend to backend format", async () => {
      // Mock successful API response
      api.post.mockResolvedValue({
        data: { id: "test-id", title: "Test Slide" },
      });

      // Test data with all essential fields
      const frontendData = {
        title: "Test Hero Slide",
        description: "Test description for the slide",
        imageUrl: "https://example.com/test-image.jpg",
        actionLabel: "Click Me",
        actionLink: "https://example.com/action",
        order: 5,
      };

      await service.createSlide(frontendData);

      // Verify API was called
      expect(api.post).toHaveBeenCalledTimes(1);

      // Get the FormData that was sent to the API
      const [url, formData, config] = api.post.mock.calls[0];

      // Verify URL and headers
      expect(url).toBe("/HeroSlides");
      expect(config.headers["Content-Type"]).toBe("multipart/form-data");

      // Verify FormData contains all mapped fields
      expect(formData).toBeInstanceOf(FormData);

      // Convert FormData to object for easier testing
      const formDataEntries = {};
      for (let [key, value] of formData.entries()) {
        formDataEntries[key] = value;
      }

      // Verify field mapping
      expect(formDataEntries.Title).toBe(frontendData.title);
      expect(formDataEntries.Description).toBe(frontendData.description);
      expect(formDataEntries.ImageUrl).toBe(frontendData.imageUrl);
      expect(formDataEntries.ActionLabel).toBe(frontendData.actionLabel);
      expect(formDataEntries.ActionLink).toBe(frontendData.actionLink);
      expect(formDataEntries.Order).toBe(frontendData.order.toString());
    });

    test("should correctly map file upload data from frontend to backend", async () => {
      // Mock successful API response
      api.post.mockResolvedValue({
        data: { id: "test-id", title: "Test Slide" },
      });

      // Create a mock file
      const mockFile = new File(["test content"], "test-image.jpg", {
        type: "image/jpeg",
      });

      // Test data with file upload
      const frontendData = {
        title: "Test Slide with File",
        description: "Test description",
        imageFile: mockFile,
        actionLabel: "Download",
        actionLink: "/download",
        order: 1,
      };

      await service.createSlide(frontendData);

      // Get the FormData that was sent to the API
      const [, formData] = api.post.mock.calls[0];

      // Convert FormData to object for easier testing
      const formDataEntries = {};
      for (let [key, value] of formData.entries()) {
        formDataEntries[key] = value;
      }

      // Verify file mapping
      expect(formDataEntries.ImageFile).toBe(mockFile);
      expect(formDataEntries.Title).toBe(frontendData.title);
      expect(formDataEntries.Description).toBe(frontendData.description);
      expect(formDataEntries.ActionLabel).toBe(frontendData.actionLabel);
      expect(formDataEntries.ActionLink).toBe(frontendData.actionLink);
      expect(formDataEntries.Order).toBe(frontendData.order.toString());

      // Should not have ImageUrl when file is provided
      expect(formDataEntries.ImageUrl).toBeUndefined();
    });

    test("should correctly map partial update data from frontend to backend", async () => {
      // Mock successful API response
      api.put.mockResolvedValue({
        data: { id: "test-id", title: "Updated Slide" },
      });

      // Test partial update data
      const frontendData = {
        title: "Updated Title",
        isActive: false,
        order: 10,
      };

      await service.updateSlide("test-id", frontendData);

      // Get the FormData that was sent to the API
      const [url, formData] = api.put.mock.calls[0];

      expect(url).toBe("/HeroSlides/test-id");

      // Convert FormData to object for easier testing
      const formDataEntries = {};
      for (let [key, value] of formData.entries()) {
        formDataEntries[key] = value;
      }

      // Verify partial update mapping
      expect(formDataEntries.Title).toBe(frontendData.title);
      expect(formDataEntries.IsActive).toBe(frontendData.isActive.toString());
      expect(formDataEntries.Order).toBe(frontendData.order.toString());

      // Should not have fields that weren't provided
      expect(formDataEntries.Description).toBeUndefined();
      expect(formDataEntries.ImageUrl).toBeUndefined();
    });

    test("should correctly map success story data with same structure as hero slides", async () => {
      // Mock successful API response
      api.post.mockResolvedValue({
        data: { id: "story-id", title: "Test Story" },
      });

      // Test success story data
      const frontendData = {
        title: "Success Story Title",
        description: "Success story description",
        imageUrl: "https://example.com/story-image.jpg",
        actionLabel: "Read More",
        actionLink: "/stories/1",
        order: 3,
      };

      await service.createStory(frontendData);

      // Get the FormData that was sent to the API
      const [url, formData] = api.post.mock.calls[0];

      expect(url).toBe("/SuccessStories");

      // Convert FormData to object for easier testing
      const formDataEntries = {};
      for (let [key, value] of formData.entries()) {
        formDataEntries[key] = value;
      }

      // Verify success story uses same field mapping as hero slides
      expect(formDataEntries.Title).toBe(frontendData.title);
      expect(formDataEntries.Description).toBe(frontendData.description);
      expect(formDataEntries.ImageUrl).toBe(frontendData.imageUrl);
      expect(formDataEntries.ActionLabel).toBe(frontendData.actionLabel);
      expect(formDataEntries.ActionLink).toBe(frontendData.actionLink);
      expect(formDataEntries.Order).toBe(frontendData.order.toString());
    });

    test("should handle optional fields correctly in mapping", async () => {
      // Mock successful API response
      api.post.mockResolvedValue({
        data: { id: "test-id", title: "Minimal Slide" },
      });

      // Test data with only required fields
      const frontendData = {
        title: "Minimal Slide",
        imageUrl: "https://example.com/minimal.jpg",
        order: 0,
      };

      await service.createSlide(frontendData);

      // Get the FormData that was sent to the API
      const [, formData] = api.post.mock.calls[0];

      // Convert FormData to object for easier testing
      const formDataEntries = {};
      for (let [key, value] of formData.entries()) {
        formDataEntries[key] = value;
      }

      // Verify required fields are mapped
      expect(formDataEntries.Title).toBe(frontendData.title);
      expect(formDataEntries.ImageUrl).toBe(frontendData.imageUrl);
      expect(formDataEntries.Order).toBe(frontendData.order.toString());

      // Verify optional fields are not included when not provided
      expect(formDataEntries.Description).toBeUndefined();
      expect(formDataEntries.ActionLabel).toBeUndefined();
      expect(formDataEntries.ActionLink).toBeUndefined();
    });

    test("should preserve data types correctly during mapping", async () => {
      // Mock successful API response
      api.post.mockResolvedValue({
        data: { id: "test-id", title: "Type Test" },
      });

      // Test data with various types
      const frontendData = {
        title: "Type Test Slide",
        description: "", // Empty string
        imageUrl: "https://example.com/test.jpg",
        actionLabel: null, // Null value
        actionLink: undefined, // Undefined value
        order: 0, // Zero value
      };

      await service.createSlide(frontendData);

      // Get the FormData that was sent to the API
      const [, formData] = api.post.mock.calls[0];

      // Convert FormData to object for easier testing
      const formDataEntries = {};
      for (let [key, value] of formData.entries()) {
        formDataEntries[key] = value;
      }

      // Verify type handling
      expect(formDataEntries.Title).toBe("Type Test Slide");
      expect(formDataEntries.Description).toBe(""); // Empty string preserved
      expect(formDataEntries.ImageUrl).toBe("https://example.com/test.jpg");
      expect(formDataEntries.Order).toBe("0"); // Number converted to string

      // Null and undefined should not be included
      expect(formDataEntries.ActionLabel).toBeUndefined();
      expect(formDataEntries.ActionLink).toBeUndefined();
    });
  });
});
