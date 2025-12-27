/**
 * Integration tests for Slider API - Final checkpoint verification
 * Feature: slider-api-integration-fix, Task 10: Final checkpoint - Verify API integration
 *
 * This test suite verifies:
 * - Slide creation with various data combinations
 * - Slide updates and deletions
 * - Success story operations work correctly
 * - All validation and error handling works as expected
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { SliderApiService } from "./sliderApiService";
import { api } from "./api";
import * as fc from "fast-check";

// Mock the API module
vi.mock("./api", () => ({
  api: {
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  },
}));

describe("Slider API Integration - Final Checkpoint", () => {
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

  describe("Slide Creation with Various Data Combinations", () => {
    test("should create slide with minimal required data", async () => {
      const mockResponse = {
        data: {
          id: "slide-123",
          title: "Test Slide",
          isActive: true,
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const slideData = {
        title: "Test Slide",
        image: "https://example.com/image.jpg",
        slideType: "permanent",
        order: 1,
      };

      const result = await service.createSlide(slideData);

      expect(api.post).toHaveBeenCalledWith(
        "/HeroSlides",
        expect.any(FormData),
        expect.objectContaining({
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        })
      );

      // Verify FormData contains correct fields
      const formData = api.post.mock.calls[0][1];
      expect(formData.get("Title")).toBe("Test Slide");
      expect(formData.get("ImageUrl")).toBe("https://example.com/image.jpg");
      expect(formData.get("IsPermanent")).toBe("true");
      expect(formData.get("Order")).toBe("1");

      expect(result).toEqual(mockResponse.data);
      expect(mockAlert.showSuccess).toHaveBeenCalledWith(
        "اسلاید با موفقیت ایجاد شد"
      );
    });

    test("should create slide with complete data including actions", async () => {
      const mockResponse = {
        data: {
          id: "slide-456",
          title: "Complete Slide",
          isActive: true,
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const slideData = {
        title: "Complete Slide",
        description: "This is a complete slide with all fields",
        image: "https://example.com/complete-image.jpg",
        badge: "New",
        primaryAction: {
          label: "Learn More",
          link: "/courses",
        },
        secondaryAction: {
          label: "Contact Us",
          link: "/contact",
        },
        slideType: "temporary",
        expiresAt: "2024-12-31T23:59:59.999Z",
        order: 2,
        linkUrl: "https://example.com/link",
      };

      const result = await service.createSlide(slideData);

      const formData = api.post.mock.calls[0][1];
      expect(formData.get("Title")).toBe("Complete Slide");
      expect(formData.get("Description")).toBe(
        "This is a complete slide with all fields"
      );
      expect(formData.get("Badge")).toBe("New");
      expect(formData.get("ButtonText")).toBe("Learn More");
      expect(formData.get("PrimaryActionLabel")).toBe("Learn More");
      expect(formData.get("ButtonLink")).toBe("/courses");
      expect(formData.get("PrimaryActionLink")).toBe("/courses");
      expect(formData.get("SecondaryActionLabel")).toBe("Contact Us");
      expect(formData.get("SecondaryActionLink")).toBe("/contact");
      expect(formData.get("IsPermanent")).toBe("false");
      expect(formData.get("ExpiresAt")).toBe("2024-12-31T23:59:59.999Z");
      expect(formData.get("Order")).toBe("2");
      expect(formData.get("LinkUrl")).toBe("https://example.com/link");

      expect(result).toEqual(mockResponse.data);
    });

    test("should create slide with file upload instead of URL", async () => {
      const mockResponse = {
        data: {
          id: "slide-789",
          title: "File Upload Slide",
          isActive: true,
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const slideData = {
        title: "File Upload Slide",
        image: "https://example.com/fallback.jpg", // Should be ignored
        imageFile: mockFile,
        slideType: "permanent",
        order: 3,
      };

      const result = await service.createSlide(slideData);

      const formData = api.post.mock.calls[0][1];
      expect(formData.get("Title")).toBe("File Upload Slide");
      expect(formData.get("ImageFile")).toBe(mockFile);
      expect(formData.get("ImageUrl")).toBeNull(); // Should not be set when file is provided

      expect(result).toEqual(mockResponse.data);
    });

    test("should handle validation errors during creation", async () => {
      const slideData = {
        title: "", // Invalid - empty title
        image: "", // Invalid - no image
        slideType: "permanent",
      };

      await expect(service.createSlide(slideData)).rejects.toThrow();
      expect(api.post).not.toHaveBeenCalled();
    });

    test("should handle API errors during creation", async () => {
      const apiError = {
        response: {
          status: 400,
          data: {
            errors: {
              Title: ["Title is required"],
            },
          },
        },
      };
      api.post.mockRejectedValue(apiError);

      const slideData = {
        title: "Test Slide",
        image: "https://example.com/image.jpg",
        slideType: "permanent",
      };

      await expect(service.createSlide(slideData)).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalled();
    });
  });

  describe("Slide Updates and Deletions", () => {
    test("should update slide with complete data", async () => {
      const mockResponse = {
        data: {
          id: "slide-123",
          title: "Updated Slide",
          isActive: false,
        },
      };
      api.put.mockResolvedValue(mockResponse);

      const slideData = {
        title: "Updated Slide",
        description: "This slide has been updated",
        image: "https://example.com/updated-image.jpg",
        slideType: "permanent",
        order: 1,
        isActive: false,
      };

      const result = await service.updateSlide("slide-123", slideData);

      expect(api.put).toHaveBeenCalledWith(
        "/HeroSlides/slide-123",
        expect.any(FormData),
        expect.objectContaining({
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        })
      );

      const formData = api.put.mock.calls[0][1];
      expect(formData.get("Title")).toBe("Updated Slide");
      expect(formData.get("IsActive")).toBe("false"); // Update-specific field
      expect(formData.get("IsPermanent")).toBe("true");

      expect(result).toEqual(mockResponse.data);
      expect(mockAlert.showSuccess).toHaveBeenCalledWith(
        "اسلاید با موفقیت به‌روزرسانی شد"
      );
    });

    test("should update slide from temporary to permanent", async () => {
      const mockResponse = {
        data: {
          id: "slide-456",
          title: "Permanent Slide",
          isActive: true,
        },
      };
      api.put.mockResolvedValue(mockResponse);

      const slideData = {
        title: "Permanent Slide",
        image: "https://example.com/image.jpg",
        slideType: "permanent", // Changed from temporary
        order: 2,
        isActive: true,
      };

      const result = await service.updateSlide("slide-456", slideData);

      const formData = api.put.mock.calls[0][1];
      expect(formData.get("IsPermanent")).toBe("true");
      expect(formData.get("ExpiresAt")).toBeNull(); // Should not be set for permanent

      expect(result).toEqual(mockResponse.data);
    });

    test("should delete slide successfully", async () => {
      const mockResponse = {
        data: { success: true, message: "Slide deleted successfully" },
      };
      api.delete.mockResolvedValue(mockResponse);

      const result = await service.deleteSlide("slide-123");

      expect(api.delete).toHaveBeenCalledWith("/HeroSlides/slide-123", {
        timeout: 10000,
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAlert.showSuccess).toHaveBeenCalledWith(
        "اسلاید با موفقیت حذف شد"
      );
    });

    test("should handle 404 error when deleting non-existent slide", async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { message: "Slide not found" },
        },
      };
      api.delete.mockRejectedValue(notFoundError);

      await expect(service.deleteSlide("non-existent")).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalled();
    });

    test("should handle validation errors during update", async () => {
      const slideData = {
        title: "", // Invalid
        image: "https://example.com/image.jpg",
        slideType: "permanent",
        isActive: true,
      };

      await expect(
        service.updateSlide("slide-123", slideData)
      ).rejects.toThrow();
      expect(api.put).not.toHaveBeenCalled();
    });
  });

  describe("Success Story Operations", () => {
    test("should create success story with complete data", async () => {
      const mockResponse = {
        data: {
          id: "story-123",
          title: "Success Story",
          isActive: true,
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const storyData = {
        title: "Success Story",
        subtitle: "Amazing Achievement",
        description: "This is a success story description",
        image: "https://example.com/story-image.jpg",
        type: "success",
        studentName: "John Doe",
        courseName: "Web Development",
        courseId: "course-456",
        action: {
          label: "Read More",
          link: "/stories/123",
        },
        duration: 5000,
        storyType: "permanent",
        order: 1,
      };

      const result = await service.createStory(storyData);

      expect(api.post).toHaveBeenCalledWith(
        "/SuccessStories",
        expect.any(FormData),
        expect.objectContaining({
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        })
      );

      const formData = api.post.mock.calls[0][1];
      expect(formData.get("Title")).toBe("Success Story");
      expect(formData.get("Subtitle")).toBe("Amazing Achievement");
      expect(formData.get("Description")).toBe(
        "This is a success story description"
      );
      expect(formData.get("Type")).toBe("success");
      expect(formData.get("StudentName")).toBe("John Doe");
      expect(formData.get("CourseName")).toBe("Web Development");
      expect(formData.get("CourseId")).toBe("course-456");
      expect(formData.get("ActionLabel")).toBe("Read More");
      expect(formData.get("ActionLink")).toBe("/stories/123");
      expect(formData.get("Duration")).toBe("5000");
      expect(formData.get("IsPermanent")).toBe("true");
      expect(formData.get("Order")).toBe("1");

      expect(result).toEqual(mockResponse.data);
      expect(mockAlert.showSuccess).toHaveBeenCalledWith(
        "استوری با موفقیت ایجاد شد"
      );
    });

    test("should create temporary success story with expiration", async () => {
      const mockResponse = {
        data: {
          id: "story-456",
          title: "Temporary Story",
          isActive: true,
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const storyData = {
        title: "Temporary Story",
        image: "https://example.com/temp-story.jpg",
        type: "video",
        storyType: "temporary",
        expiresAt: "2024-06-30T23:59:59.999Z",
        duration: 3000,
        order: 2,
      };

      const result = await service.createStory(storyData);

      const formData = api.post.mock.calls[0][1];
      expect(formData.get("IsPermanent")).toBe("false");
      expect(formData.get("ExpiresAt")).toBe("2024-06-30T23:59:59.999Z");

      expect(result).toEqual(mockResponse.data);
    });

    test("should update success story", async () => {
      const mockResponse = {
        data: {
          id: "story-123",
          title: "Updated Story",
          isActive: false,
        },
      };
      api.put.mockResolvedValue(mockResponse);

      const storyData = {
        title: "Updated Story",
        subtitle: "Updated Subtitle",
        image: "https://example.com/updated-story.jpg",
        type: "testimonial",
        storyType: "permanent",
        order: 1,
        isActive: false,
      };

      const result = await service.updateStory("story-123", storyData);

      expect(api.put).toHaveBeenCalledWith(
        "/SuccessStories/story-123",
        expect.any(FormData),
        expect.objectContaining({
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        })
      );

      const formData = api.put.mock.calls[0][1];
      expect(formData.get("Title")).toBe("Updated Story");
      expect(formData.get("Subtitle")).toBe("Updated Subtitle");
      expect(formData.get("Type")).toBe("testimonial");
      expect(formData.get("IsActive")).toBe("false"); // Update-specific field

      expect(result).toEqual(mockResponse.data);
      expect(mockAlert.showSuccess).toHaveBeenCalledWith(
        "استوری با موفقیت به‌روزرسانی شد"
      );
    });

    test("should delete success story", async () => {
      const mockResponse = {
        data: { success: true, message: "Story deleted successfully" },
      };
      api.delete.mockResolvedValue(mockResponse);

      const result = await service.deleteStory("story-123");

      expect(api.delete).toHaveBeenCalledWith("/SuccessStories/story-123");

      expect(result).toEqual(mockResponse.data);
      expect(mockAlert.showSuccess).toHaveBeenCalledWith(
        "استوری با موفقیت حذف شد"
      );
    });

    test("should handle validation errors for success stories", async () => {
      const storyData = {
        title: "", // Invalid
        image: "", // Invalid
        storyType: "permanent",
      };

      await expect(service.createStory(storyData)).rejects.toThrow();
      expect(api.post).not.toHaveBeenCalled();
    });
  });

  describe("Data Retrieval Operations", () => {
    test("should get all slides with admin parameters", async () => {
      const mockResponse = {
        data: {
          items: [
            { id: "slide-1", title: "Slide 1", isActive: true },
            { id: "slide-2", title: "Slide 2", isActive: false },
          ],
          totalCount: 2,
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await service.getSlides();

      expect(api.get).toHaveBeenCalledWith("/HeroSlides", {
        params: {
          adminView: true,
          includeInactive: true,
          includeExpired: true,
        },
        timeout: 15000,
      });

      expect(result).toEqual(mockResponse.data);
    });

    test("should get slides with custom parameters", async () => {
      const mockResponse = {
        data: {
          items: [{ id: "slide-1", title: "Active Slide", isActive: true }],
          totalCount: 1,
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const customParams = {
        includeInactive: false,
        page: 1,
        pageSize: 10,
      };

      const result = await service.getSlides(customParams);

      expect(api.get).toHaveBeenCalledWith("/HeroSlides", {
        params: {
          adminView: true,
          includeInactive: false,
          includeExpired: true,
          page: 1,
          pageSize: 10,
        },
        timeout: 15000,
      });

      expect(result).toEqual(mockResponse.data);
    });

    test("should get single slide by ID", async () => {
      const mockResponse = {
        data: {
          id: "slide-123",
          title: "Single Slide",
          description: "Slide description",
          isActive: true,
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await service.getSlideById("slide-123");

      expect(api.get).toHaveBeenCalledWith("/HeroSlides/slide-123", {
        timeout: 10000,
      });

      expect(result).toEqual(mockResponse.data);
    });

    test("should get all success stories", async () => {
      const mockResponse = {
        data: {
          items: [
            { id: "story-1", title: "Story 1", type: "success" },
            { id: "story-2", title: "Story 2", type: "video" },
          ],
          totalCount: 2,
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await service.getStories();

      expect(api.get).toHaveBeenCalledWith("/SuccessStories", {
        params: {
          adminView: true,
          includeInactive: true,
          includeExpired: true,
        },
      });

      expect(result).toEqual(mockResponse.data);
    });

    test("should get single success story by ID", async () => {
      const mockResponse = {
        data: {
          id: "story-123",
          title: "Single Story",
          subtitle: "Story subtitle",
          type: "testimonial",
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await service.getStoryById("story-123");

      expect(api.get).toHaveBeenCalledWith("/SuccessStories/story-123");

      expect(result).toEqual(mockResponse.data);
    });

    test("should handle errors when fetching data", async () => {
      const networkError = new Error("Network Error");
      api.get.mockRejectedValue(networkError);

      await expect(service.getSlides()).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalledWith(
        expect.stringContaining("خطا در بارگذاری اسلایدها")
      );
    });
  });

  describe("Complete Workflow Integration", () => {
    test("should handle complete slide lifecycle (create, update, delete)", async () => {
      // Create
      const createResponse = {
        data: {
          id: "slide-lifecycle",
          title: "Lifecycle Slide",
          isActive: true,
        },
      };
      api.post.mockResolvedValueOnce(createResponse);

      const initialData = {
        title: "Lifecycle Slide",
        image: "https://example.com/lifecycle.jpg",
        slideType: "permanent",
        order: 1,
      };

      const createResult = await service.createSlide(initialData);
      expect(createResult).toEqual(createResponse.data);

      // Update
      const updateResponse = {
        data: {
          id: "slide-lifecycle",
          title: "Updated Lifecycle Slide",
          isActive: false,
        },
      };
      api.put.mockResolvedValueOnce(updateResponse);

      const updateData = {
        ...initialData,
        title: "Updated Lifecycle Slide",
        isActive: false,
      };

      const updateResult = await service.updateSlide(
        "slide-lifecycle",
        updateData
      );
      expect(updateResult).toEqual(updateResponse.data);

      // Delete
      const deleteResponse = {
        data: { success: true, message: "Deleted successfully" },
      };
      api.delete.mockResolvedValueOnce(deleteResponse);

      const deleteResult = await service.deleteSlide("slide-lifecycle");
      expect(deleteResult).toEqual(deleteResponse.data);

      // Verify all operations were called
      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.put).toHaveBeenCalledTimes(1);
      expect(api.delete).toHaveBeenCalledTimes(1);

      // Verify success messages
      expect(mockAlert.showSuccess).toHaveBeenCalledTimes(3);
    });

    test("should handle complete success story lifecycle", async () => {
      // Create
      const createResponse = {
        data: {
          id: "story-lifecycle",
          title: "Lifecycle Story",
          isActive: true,
        },
      };
      api.post.mockResolvedValueOnce(createResponse);

      const initialData = {
        title: "Lifecycle Story",
        image: "https://example.com/story-lifecycle.jpg",
        type: "success",
        storyType: "permanent",
        order: 1,
      };

      const createResult = await service.createStory(initialData);
      expect(createResult).toEqual(createResponse.data);

      // Update
      const updateResponse = {
        data: {
          id: "story-lifecycle",
          title: "Updated Lifecycle Story",
          isActive: false,
        },
      };
      api.put.mockResolvedValueOnce(updateResponse);

      const updateData = {
        ...initialData,
        title: "Updated Lifecycle Story",
        isActive: false,
      };

      const updateResult = await service.updateStory(
        "story-lifecycle",
        updateData
      );
      expect(updateResult).toEqual(updateResponse.data);

      // Delete
      const deleteResponse = {
        data: { success: true, message: "Story deleted successfully" },
      };
      api.delete.mockResolvedValueOnce(deleteResponse);

      const deleteResult = await service.deleteStory("story-lifecycle");
      expect(deleteResult).toEqual(deleteResponse.data);

      // Verify all operations were called
      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.put).toHaveBeenCalledTimes(1);
      expect(api.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Recovery and Edge Cases", () => {
    test("should handle timeout errors gracefully", async () => {
      const timeoutError = {
        code: "ECONNABORTED",
        message: "timeout of 30000ms exceeded",
      };
      api.post.mockRejectedValue(timeoutError);

      const slideData = {
        title: "Timeout Test",
        image: "https://example.com/timeout.jpg",
        slideType: "permanent",
      };

      await expect(service.createSlide(slideData)).rejects.toThrow();
      expect(mockAlert.showError).toHaveBeenCalled();
    });

    test("should handle malformed API responses", async () => {
      const malformedResponse = {
        data: null, // Malformed response
      };
      api.post.mockResolvedValue(malformedResponse);

      const slideData = {
        title: "Malformed Test",
        image: "https://example.com/malformed.jpg",
        slideType: "permanent",
      };

      const result = await service.createSlide(slideData);
      expect(result).toBeNull();
    });

    test("should handle concurrent operations", async () => {
      // Simulate concurrent create operations
      const responses = [
        { data: { id: "slide-1", title: "Concurrent 1" } },
        { data: { id: "slide-2", title: "Concurrent 2" } },
        { data: { id: "slide-3", title: "Concurrent 3" } },
      ];

      api.post
        .mockResolvedValueOnce(responses[0])
        .mockResolvedValueOnce(responses[1])
        .mockResolvedValueOnce(responses[2]);

      const slideDataArray = [
        {
          title: "Concurrent 1",
          image: "https://example.com/1.jpg",
          slideType: "permanent",
        },
        {
          title: "Concurrent 2",
          image: "https://example.com/2.jpg",
          slideType: "permanent",
        },
        {
          title: "Concurrent 3",
          image: "https://example.com/3.jpg",
          slideType: "permanent",
        },
      ];

      const promises = slideDataArray.map((data) => service.createSlide(data));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual(responses[0].data);
      expect(results[1]).toEqual(responses[1].data);
      expect(results[2]).toEqual(responses[2].data);
    });

    test("should handle partial failures in batch operations", async () => {
      // First operation succeeds, second fails
      api.post
        .mockResolvedValueOnce({
          data: { id: "slide-success", title: "Success" },
        })
        .mockRejectedValueOnce(new Error("API Error"));

      const slideDataArray = [
        {
          title: "Success Slide",
          image: "https://example.com/success.jpg",
          slideType: "permanent",
        },
        {
          title: "Failure Slide",
          image: "https://example.com/failure.jpg",
          slideType: "permanent",
        },
      ];

      const results = await Promise.allSettled([
        service.createSlide(slideDataArray[0]),
        service.createSlide(slideDataArray[1]),
      ]);

      expect(results[0].status).toBe("fulfilled");
      expect(results[1].status).toBe("rejected");
    });
  });

  describe("Property-Based Integration Tests", () => {
    test("should handle random valid slide data combinations", () => {
      const slideDataGen = fc.record({
        title: fc.string({ minLength: 1, maxLength: 200 }),
        description: fc.option(fc.string({ maxLength: 500 })),
        image: fc.webUrl(),
        slideType: fc.constantFrom("permanent", "temporary"),
        order: fc.integer({ min: 0, max: 100 }),
      });

      return fc.assert(
        fc.asyncProperty(slideDataGen, async (slideData) => {
          const mockResponse = {
            data: { id: "test-slide", title: slideData.title, isActive: true },
          };
          api.post.mockResolvedValue(mockResponse);

          const result = await service.createSlide(slideData);
          expect(result).toEqual(mockResponse.data);

          // Verify FormData was created correctly
          expect(api.post).toHaveBeenCalledWith(
            "/HeroSlides",
            expect.any(FormData),
            expect.any(Object)
          );

          const formData =
            api.post.mock.calls[api.post.mock.calls.length - 1][1];
          expect(formData.get("Title")).toBe(slideData.title);
          expect(formData.get("ImageUrl")).toBe(slideData.image);

          vi.clearAllMocks();
        }),
        { numRuns: 20 } // Reduced for integration tests
      );
    });

    test("should handle random valid story data combinations", () => {
      const storyDataGen = fc.record({
        title: fc.string({ minLength: 1, maxLength: 200 }),
        subtitle: fc.option(fc.string({ maxLength: 100 })),
        image: fc.webUrl(),
        type: fc.constantFrom("success", "video", "testimonial"),
        storyType: fc.constantFrom("permanent", "temporary"),
        order: fc.integer({ min: 0, max: 100 }),
      });

      return fc.assert(
        fc.asyncProperty(storyDataGen, async (storyData) => {
          const mockResponse = {
            data: { id: "test-story", title: storyData.title, isActive: true },
          };
          api.post.mockResolvedValue(mockResponse);

          const result = await service.createStory(storyData);
          expect(result).toEqual(mockResponse.data);

          const formData =
            api.post.mock.calls[api.post.mock.calls.length - 1][1];
          expect(formData.get("Title")).toBe(storyData.title);
          expect(formData.get("Type")).toBe(storyData.type);

          vi.clearAllMocks();
        }),
        { numRuns: 20 }
      );
    });
  });
});
