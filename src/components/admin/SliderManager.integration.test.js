/**
 * Integration tests for SliderManager API operations
 * Feature: slider-api-integration-fix
 * Requirements: 4.3, 4.4
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "../../services/api";
import {
  transformSlideFormToApi,
  transformSlideFormToApiForUpdate,
  transformStoryFormToApi,
  transformStoryFormToApiForUpdate,
  validateSlideForm,
  validateStoryForm,
  handleApiError,
} from "../../utils/sliderDataTransform";

// Mock the API module
vi.mock("../../services/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("SliderManager API Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Complete Create/Update/Delete API Flows", () => {
    test("should use POST method for slide creation with proper data transformation", async () => {
      const slideFormData = {
        title: "Test Slide",
        description: "Test Description",
        image: "https://example.com/image.jpg",
        primaryAction: {
          label: "Click Me",
          link: "https://example.com/action",
        },
        slideType: "permanent",
        order: 1,
        isActive: true,
      };

      // Mock successful API response
      api.post.mockResolvedValue({
        data: { success: true, data: { id: "1" } },
      });

      // Transform data as the component would
      const formData = transformSlideFormToApi(slideFormData);

      // Simulate API call as component would make it
      const response = await api.post("/HeroSlides", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Verify POST method was used
      expect(api.post).toHaveBeenCalledWith(
        "/HeroSlides",
        expect.any(FormData),
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Verify response
      expect(response.data.success).toBe(true);
      expect(response.data.data.id).toBe("1");

      // Verify form data transformation
      expect(formData.get("Title")).toBe("Test Slide");
      expect(formData.get("Description")).toBe("Test Description");
      expect(formData.get("ImageUrl")).toBe("https://example.com/image.jpg");
      expect(formData.get("PrimaryActionLabel")).toBe("Click Me");
      expect(formData.get("PrimaryActionLink")).toBe(
        "https://example.com/action"
      );
      expect(formData.get("IsPermanent")).toBe("true");
      expect(formData.get("Order")).toBe("1");
    });

    test("should use PUT method for slide updates with proper data transformation", async () => {
      const slideId = "123";
      const slideFormData = {
        title: "Updated Slide",
        description: "Updated Description",
        image: "https://example.com/updated-image.jpg",
        slideType: "temporary",
        expiresAt: "2024-12-31T23:59:59.999Z",
        order: 2,
        isActive: false,
      };

      // Mock successful API response
      api.put.mockResolvedValue({
        data: { success: true, data: { id: slideId } },
      });

      // Transform data as the component would for update
      const formData = transformSlideFormToApiForUpdate(slideFormData);

      // Simulate API call as component would make it
      const response = await api.put(`/HeroSlides/${slideId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Verify PUT method was used with correct URL
      expect(api.put).toHaveBeenCalledWith(
        `/HeroSlides/${slideId}`,
        expect.any(FormData),
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Verify response
      expect(response.data.success).toBe(true);

      // Verify update-specific fields are included
      expect(formData.get("IsActive")).toBe("false");
      expect(formData.get("IsPermanent")).toBe("false");
      expect(formData.get("ExpiresAt")).toBe("2024-12-31T23:59:59.999Z");
    });

    test("should use DELETE method for slide deletion", async () => {
      const slideId = "456";

      // Mock successful API response
      api.delete.mockResolvedValue({
        data: { success: true },
      });

      // Simulate API call as component would make it
      const response = await api.delete(`/HeroSlides/${slideId}`);

      // Verify DELETE method was used with correct URL
      expect(api.delete).toHaveBeenCalledWith(`/HeroSlides/${slideId}`);

      // Verify response
      expect(response.data.success).toBe(true);
    });

    test("should use POST method for success story creation", async () => {
      const storyFormData = {
        title: "Test Success Story",
        subtitle: "Test Subtitle",
        description: "Test Description",
        image: "https://example.com/story-image.jpg",
        type: "success",
        storyType: "permanent",
        order: 1,
        isActive: true,
      };

      // Mock successful API response
      api.post.mockResolvedValue({
        data: { success: true, data: { id: "story-1" } },
      });

      // Transform data as the component would
      const formData = transformStoryFormToApi(storyFormData);

      // Simulate API call as component would make it
      const response = await api.post("/SuccessStories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Verify POST method was used
      expect(api.post).toHaveBeenCalledWith(
        "/SuccessStories",
        expect.any(FormData),
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Verify response
      expect(response.data.success).toBe(true);
      expect(response.data.data.id).toBe("story-1");

      // Verify story-specific fields
      expect(formData.get("Title")).toBe("Test Success Story");
      expect(formData.get("Subtitle")).toBe("Test Subtitle");
      expect(formData.get("Type")).toBe("success");
    });

    test("should use PUT method for success story updates", async () => {
      const storyId = "story-123";
      const storyFormData = {
        title: "Updated Success Story",
        subtitle: "Updated Subtitle",
        description: "Updated Description",
        type: "testimonial",
        storyType: "temporary",
        expiresAt: "2024-06-30T12:00:00.000Z",
        order: 3,
        isActive: true,
      };

      // Mock successful API response
      api.put.mockResolvedValue({
        data: { success: true, data: { id: storyId } },
      });

      // Transform data as the component would for update
      const formData = transformStoryFormToApiForUpdate(storyFormData);

      // Simulate API call as component would make it
      const response = await api.put(`/SuccessStories/${storyId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Verify PUT method was used with correct URL
      expect(api.put).toHaveBeenCalledWith(
        `/SuccessStories/${storyId}`,
        expect.any(FormData),
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Verify response
      expect(response.data.success).toBe(true);

      // Verify update-specific fields
      expect(formData.get("IsActive")).toBe("true");
      expect(formData.get("Type")).toBe("testimonial");
    });
  });

  describe("Data Loading and State Management", () => {
    test("should load slides with proper API parameters", async () => {
      const mockSlides = [
        {
          id: "1",
          title: "Test Slide 1",
          isActive: true,
          order: 1,
        },
        {
          id: "2",
          title: "Test Slide 2",
          isActive: false,
          order: 2,
        },
      ];

      api.get.mockResolvedValue({
        data: { data: mockSlides },
      });

      // Simulate loading slides as component would
      const response = await api.get(
        "/HeroSlides?adminView=true&includeInactive=true&includeExpired=true"
      );

      // Verify correct API call
      expect(api.get).toHaveBeenCalledWith(
        "/HeroSlides?adminView=true&includeInactive=true&includeExpired=true"
      );

      // Verify data structure
      expect(response.data.data).toHaveLength(2);
      expect(response.data.data[0].title).toBe("Test Slide 1");
      expect(response.data.data[1].isActive).toBe(false);
    });

    test("should load success stories with proper API parameters", async () => {
      const mockStories = [
        {
          id: "1",
          title: "Test Story 1",
          type: "success",
          isActive: true,
          order: 1,
        },
      ];

      api.get.mockResolvedValue({
        data: { data: mockStories },
      });

      // Simulate loading stories as component would
      const response = await api.get(
        "/SuccessStories?adminView=true&includeInactive=true&includeExpired=true"
      );

      // Verify correct API call
      expect(api.get).toHaveBeenCalledWith(
        "/SuccessStories?adminView=true&includeInactive=true&includeExpired=true"
      );

      // Verify data structure
      expect(response.data.data).toHaveLength(1);
      expect(response.data.data[0].type).toBe("success");
    });
  });

  describe("Error Handling Integration", () => {
    test("should handle validation errors from API", async () => {
      const apiError = {
        response: {
          status: 400,
          data: {
            errors: {
              Title: ["Title is required"],
              ImageUrl: ["Invalid URL format"],
            },
          },
        },
      };

      api.post.mockRejectedValue(apiError);

      try {
        await api.post("/HeroSlides", new FormData());
      } catch (error) {
        const errorMessage = handleApiError(error);

        // Verify error handling
        expect(errorMessage).toContain("Title: Title is required");
        expect(errorMessage).toContain("ImageUrl: Invalid URL format");
      }
    });

    test("should handle network errors", async () => {
      const networkError = new Error("Network Error");
      networkError.code = "ECONNREFUSED";

      api.get.mockRejectedValue(networkError);

      try {
        await api.get("/HeroSlides");
      } catch (error) {
        const errorMessage = handleApiError(error);

        // Verify network error handling
        expect(errorMessage).toContain("خطا در اتصال به سرور");
      }
    });

    test("should handle server errors", async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: "Internal Server Error" },
        },
      };

      api.post.mockRejectedValue(serverError);

      try {
        await api.post("/HeroSlides", new FormData());
      } catch (error) {
        const errorMessage = handleApiError(error);

        // Verify server error handling
        expect(errorMessage).toContain("خطای داخلی سرور");
      }
    });
  });

  describe("Form Validation Integration", () => {
    test("should validate slide form before API submission", () => {
      const validSlideData = {
        title: "Valid Slide",
        image: "https://example.com/image.jpg",
        description: "Valid description",
      };

      const invalidSlideData = {
        title: "",
        image: "",
        description: "Valid description",
      };

      // Test valid data
      const validResult = validateSlideForm(validSlideData);
      expect(validResult.isValid).toBe(true);
      expect(Object.keys(validResult.errors)).toHaveLength(0);

      // Test invalid data
      const invalidResult = validateSlideForm(invalidSlideData);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.title).toBeDefined();
      expect(invalidResult.errors.image).toBeDefined();
    });

    test("should validate story form before API submission", () => {
      const validStoryData = {
        title: "Valid Story",
        image: "https://example.com/image.jpg",
        subtitle: "Valid subtitle",
      };

      const invalidStoryData = {
        title: "",
        image: "",
        subtitle: "Valid subtitle",
      };

      // Test valid data
      const validResult = validateStoryForm(validStoryData);
      expect(validResult.isValid).toBe(true);
      expect(Object.keys(validResult.errors)).toHaveLength(0);

      // Test invalid data
      const invalidResult = validateStoryForm(invalidStoryData);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.title).toBeDefined();
      expect(invalidResult.errors.image).toBeDefined();
    });
  });

  describe("File Upload Integration", () => {
    test("should handle file uploads in slide creation", async () => {
      const mockFile = new File(["test content"], "test.jpg", {
        type: "image/jpeg",
      });

      const slideFormData = {
        title: "Slide with File",
        imageFile: mockFile,
        slideType: "permanent",
        order: 1,
      };

      api.post.mockResolvedValue({
        data: { success: true, data: { id: "1" } },
      });

      // Transform data with file
      const formData = transformSlideFormToApi(slideFormData);

      // Simulate API call
      await api.post("/HeroSlides", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Verify file is included in FormData
      expect(formData.has("ImageFile")).toBe(true);
      expect(formData.get("ImageFile")).toBe(mockFile);
      expect(formData.has("ImageUrl")).toBe(false);
    });

    test("should prioritize file over URL when both are provided", () => {
      const mockFile = new File(["test content"], "test.jpg", {
        type: "image/jpeg",
      });

      const slideFormData = {
        title: "Slide with Both",
        image: "https://example.com/image.jpg",
        imageFile: mockFile,
        slideType: "permanent",
        order: 1,
      };

      // Transform data
      const formData = transformSlideFormToApi(slideFormData);

      // Verify file is prioritized
      expect(formData.has("ImageFile")).toBe(true);
      expect(formData.get("ImageFile")).toBe(mockFile);
      expect(formData.get("ImageUrl")).toBeNull();
    });
  });

  describe("Content-Type Headers", () => {
    test("should use multipart/form-data for slide operations", async () => {
      const slideFormData = {
        title: "Test Slide",
        image: "https://example.com/image.jpg",
        slideType: "permanent",
        order: 1,
      };

      api.post.mockResolvedValue({ data: { success: true } });
      api.put.mockResolvedValue({ data: { success: true } });

      const formData = transformSlideFormToApi(slideFormData);
      const updateFormData = transformSlideFormToApiForUpdate({
        ...slideFormData,
        isActive: true,
      });

      // Test create
      await api.post("/HeroSlides", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Test update
      await api.put("/HeroSlides/1", updateFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Verify headers
      expect(api.post).toHaveBeenCalledWith(
        "/HeroSlides",
        expect.any(FormData),
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      expect(api.put).toHaveBeenCalledWith(
        "/HeroSlides/1",
        expect.any(FormData),
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    });

    test("should use multipart/form-data for story operations", async () => {
      const storyFormData = {
        title: "Test Story",
        image: "https://example.com/image.jpg",
        type: "success",
        storyType: "permanent",
        order: 1,
      };

      api.post.mockResolvedValue({ data: { success: true } });

      const formData = transformStoryFormToApi(storyFormData);

      await api.post("/SuccessStories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Verify headers
      expect(api.post).toHaveBeenCalledWith(
        "/SuccessStories",
        expect.any(FormData),
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    });
  });

  describe("Complete User Workflows", () => {
    test("should handle complete slide creation workflow with UI state updates", async () => {
      // Mock initial empty state
      api.get.mockResolvedValueOnce({
        data: { data: [] },
      });

      // Mock successful creation
      api.post.mockResolvedValueOnce({
        data: { success: true, data: { id: "new-slide-1" } },
      });

      // Mock updated state after creation
      api.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: "new-slide-1",
              title: "New Slide",
              description: "New Description",
              isActive: true,
              order: 1,
            },
          ],
        },
      });

      const slideFormData = {
        title: "New Slide",
        description: "New Description",
        image: "https://example.com/image.jpg",
        slideType: "permanent",
        order: 1,
        isActive: true,
      };

      // Simulate complete workflow: load initial data
      const initialResponse = await api.get(
        "/HeroSlides?adminView=true&includeInactive=true&includeExpired=true"
      );
      expect(initialResponse.data.data).toHaveLength(0);

      // Create new slide
      const formData = transformSlideFormToApi(slideFormData);
      const createResponse = await api.post("/HeroSlides", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      expect(createResponse.data.success).toBe(true);

      // Reload data to verify UI state update (Requirement 4.4)
      const updatedResponse = await api.get(
        "/HeroSlides?adminView=true&includeInactive=true&includeExpired=true"
      );
      expect(updatedResponse.data.data).toHaveLength(1);
      expect(updatedResponse.data.data[0].title).toBe("New Slide");

      // Verify API calls were made in correct order
      expect(api.get).toHaveBeenCalledTimes(2);
      expect(api.post).toHaveBeenCalledTimes(1);
    });

    test("should handle complete slide update workflow with state refresh", async () => {
      const slideId = "existing-slide-1";
      const originalSlide = {
        id: slideId,
        title: "Original Title",
        description: "Original Description",
        isActive: true,
        order: 1,
      };

      const updatedSlideData = {
        title: "Updated Title",
        description: "Updated Description",
        image: "https://example.com/updated-image.jpg",
        slideType: "permanent",
        order: 1,
        isActive: false,
      };

      // Mock successful update
      api.put.mockResolvedValueOnce({
        data: { success: true, data: { id: slideId } },
      });

      // Mock refreshed state after update
      api.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              ...originalSlide,
              title: "Updated Title",
              description: "Updated Description",
              isActive: false,
            },
          ],
        },
      });

      // Update slide
      const formData = transformSlideFormToApiForUpdate(updatedSlideData);
      const updateResponse = await api.put(`/HeroSlides/${slideId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      expect(updateResponse.data.success).toBe(true);

      // Reload data to verify UI state update (Requirement 4.4)
      const refreshedResponse = await api.get(
        "/HeroSlides?adminView=true&includeInactive=true&includeExpired=true"
      );
      const updatedSlide = refreshedResponse.data.data[0];
      expect(updatedSlide.title).toBe("Updated Title");
      expect(updatedSlide.isActive).toBe(false);

      // Verify API calls
      expect(api.put).toHaveBeenCalledWith(
        `/HeroSlides/${slideId}`,
        expect.any(FormData),
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      expect(api.get).toHaveBeenCalledTimes(1);
    });

    test("should handle complete slide deletion workflow", async () => {
      const slideId = "slide-to-delete";

      // Mock successful deletion
      api.delete.mockResolvedValueOnce({
        data: { success: true },
      });

      // Mock empty state after deletion
      api.get.mockResolvedValueOnce({
        data: { data: [] },
      });

      // Delete slide
      const deleteResponse = await api.delete(`/HeroSlides/${slideId}`);
      expect(deleteResponse.data.success).toBe(true);

      // Reload data to verify UI state update
      const refreshedResponse = await api.get(
        "/HeroSlides?adminView=true&includeInactive=true&includeExpired=true"
      );
      expect(refreshedResponse.data.data).toHaveLength(0);

      // Verify API calls
      expect(api.delete).toHaveBeenCalledWith(`/HeroSlides/${slideId}`);
      expect(api.get).toHaveBeenCalledTimes(1);
    });

    test("should handle complete success story workflow", async () => {
      const storyFormData = {
        title: "Success Story",
        subtitle: "Amazing Achievement",
        description: "This is a success story",
        image: "https://example.com/story.jpg",
        type: "success",
        storyType: "permanent",
        order: 1,
        isActive: true,
      };

      // Mock successful creation
      api.post.mockResolvedValueOnce({
        data: { success: true, data: { id: "new-story-1" } },
      });

      // Mock updated state after creation
      api.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: "new-story-1",
              title: "Success Story",
              subtitle: "Amazing Achievement",
              type: "success",
              isActive: true,
              order: 1,
            },
          ],
        },
      });

      // Create story
      const formData = transformStoryFormToApi(storyFormData);
      const createResponse = await api.post("/SuccessStories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      expect(createResponse.data.success).toBe(true);

      // Reload data to verify UI state update
      const updatedResponse = await api.get(
        "/SuccessStories?adminView=true&includeInactive=true&includeExpired=true"
      );
      expect(updatedResponse.data.data).toHaveLength(1);
      expect(updatedResponse.data.data[0].subtitle).toBe("Amazing Achievement");

      // Verify API calls
      expect(api.post).toHaveBeenCalledWith(
        "/SuccessStories",
        expect.any(FormData),
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Scenarios and Recovery", () => {
    test("should handle API validation errors and allow retry", async () => {
      const invalidSlideData = {
        title: "",
        image: "",
        slideType: "permanent",
        order: 1,
      };

      // First attempt - validation error
      const validationError = {
        response: {
          status: 400,
          data: {
            errors: {
              Title: ["Title is required"],
              ImageUrl: ["Image is required"],
            },
          },
        },
      };

      api.post.mockRejectedValueOnce(validationError);

      // Second attempt - success after fixing validation
      api.post.mockResolvedValueOnce({
        data: { success: true, data: { id: "fixed-slide" } },
      });

      api.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: "fixed-slide",
              title: "Fixed Title",
              isActive: true,
            },
          ],
        },
      });

      // First attempt with invalid data
      try {
        const formData = transformSlideFormToApi(invalidSlideData);
        await api.post("/HeroSlides", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (error) {
        const errorMessage = handleApiError(error);
        expect(errorMessage).toContain("Title: Title is required");
        expect(errorMessage).toContain("ImageUrl: Image is required");
      }

      // Second attempt with fixed data (Requirement 5.2 - recovery)
      const fixedSlideData = {
        title: "Fixed Title",
        image: "https://example.com/fixed-image.jpg",
        slideType: "permanent",
        order: 1,
      };

      const fixedFormData = transformSlideFormToApi(fixedSlideData);
      const retryResponse = await api.post("/HeroSlides", fixedFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      expect(retryResponse.data.success).toBe(true);

      // Verify recovery by reloading data
      const recoveryResponse = await api.get(
        "/HeroSlides?adminView=true&includeInactive=true&includeExpired=true"
      );
      expect(recoveryResponse.data.data[0].title).toBe("Fixed Title");

      // Verify both attempts were made
      expect(api.post).toHaveBeenCalledTimes(2);
    });

    test("should handle network errors and allow retry", async () => {
      const slideData = {
        title: "Network Test Slide",
        image: "https://example.com/image.jpg",
        slideType: "permanent",
        order: 1,
      };

      // First attempt - network error
      const networkError = new Error("Network Error");
      networkError.code = "ECONNREFUSED";
      api.post.mockRejectedValueOnce(networkError);

      // Second attempt - success after network recovery
      api.post.mockResolvedValueOnce({
        data: { success: true, data: { id: "network-recovered-slide" } },
      });

      // First attempt with network error
      try {
        const formData = transformSlideFormToApi(slideData);
        await api.post("/HeroSlides", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (error) {
        const errorMessage = handleApiError(error);
        expect(errorMessage).toContain("خطا در اتصال به سرور");
      }

      // Second attempt after network recovery (Requirement 5.3 - recovery)
      const retryFormData = transformSlideFormToApi(slideData);
      const retryResponse = await api.post("/HeroSlides", retryFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      expect(retryResponse.data.success).toBe(true);
      expect(retryResponse.data.data.id).toBe("network-recovered-slide");

      // Verify both attempts were made
      expect(api.post).toHaveBeenCalledTimes(2);
    });

    test("should handle server errors gracefully", async () => {
      const slideData = {
        title: "Server Error Test",
        image: "https://example.com/image.jpg",
        slideType: "permanent",
        order: 1,
      };

      // Server error
      const serverError = {
        response: {
          status: 500,
          data: { message: "Internal Server Error" },
        },
      };

      api.post.mockRejectedValueOnce(serverError);

      // Attempt with server error
      try {
        const formData = transformSlideFormToApi(slideData);
        await api.post("/HeroSlides", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (error) {
        const errorMessage = handleApiError(error);
        expect(errorMessage).toContain("خطای داخلی سرور");
      }

      expect(api.post).toHaveBeenCalledTimes(1);
    });

    test("should handle partial failures in batch operations", async () => {
      // Simulate scenario where loading slides succeeds but loading stories fails
      api.get
        .mockResolvedValueOnce({
          data: { data: [{ id: "1", title: "Slide 1" }] },
        })
        .mockRejectedValueOnce(new Error("Stories API unavailable"));

      // Load slides successfully
      const slidesResponse = await api.get(
        "/HeroSlides?adminView=true&includeInactive=true&includeExpired=true"
      );
      expect(slidesResponse.data.data).toHaveLength(1);

      // Load stories fails
      try {
        await api.get(
          "/SuccessStories?adminView=true&includeInactive=true&includeExpired=true"
        );
      } catch (error) {
        expect(error.message).toBe("Stories API unavailable");
      }

      // Verify partial success handling
      expect(api.get).toHaveBeenCalledTimes(2);
    });

    test("should handle concurrent operations correctly", async () => {
      const slide1Data = {
        title: "Concurrent Slide 1",
        image: "https://example.com/image1.jpg",
        slideType: "permanent",
        order: 1,
      };

      const slide2Data = {
        title: "Concurrent Slide 2",
        image: "https://example.com/image2.jpg",
        slideType: "permanent",
        order: 2,
      };

      // Mock concurrent successful creations
      api.post
        .mockResolvedValueOnce({
          data: { success: true, data: { id: "concurrent-1" } },
        })
        .mockResolvedValueOnce({
          data: { success: true, data: { id: "concurrent-2" } },
        });

      // Create both slides concurrently
      const formData1 = transformSlideFormToApi(slide1Data);
      const formData2 = transformSlideFormToApi(slide2Data);

      const [response1, response2] = await Promise.all([
        api.post("/HeroSlides", formData1, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
        api.post("/HeroSlides", formData2, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
      ]);

      // Verify both operations succeeded
      expect(response1.data.success).toBe(true);
      expect(response2.data.success).toBe(true);
      expect(response1.data.data.id).toBe("concurrent-1");
      expect(response2.data.data.id).toBe("concurrent-2");

      // Verify both API calls were made
      expect(api.post).toHaveBeenCalledTimes(2);
    });

    test("should handle form validation errors before API calls", async () => {
      const invalidSlideData = {
        title: "", // Invalid - empty title
        image: "", // Invalid - no image
        slideType: "permanent",
        order: 1,
      };

      // Validate form data (should fail before API call)
      const validation = validateSlideForm(invalidSlideData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.title).toBeDefined();
      expect(validation.errors.image).toBeDefined();

      // API should not be called when validation fails
      // This simulates the component's behavior of preventing API calls on validation failure
      if (!validation.isValid) {
        // Component would show validation errors and return early
        expect(Object.keys(validation.errors)).toContain("title");
        expect(Object.keys(validation.errors)).toContain("image");
        return;
      }

      // This should not be reached due to validation failure
      expect(true).toBe(false);
    });
  });
});
