/**
 * Property-based tests for slider data transformation utilities
 * Feature: slider-api-integration-fix
 */

import { describe, test, expect } from "vitest";
import * as fc from "fast-check";
import {
  transformSlideFormToApi,
  transformSlideFormToApiForUpdate,
  transformStoryFormToApi,
  transformStoryFormToApiForUpdate,
  validateSlideForm,
  validateStoryForm,
  handleApiError,
} from "./sliderDataTransform";

// Generators for property-based testing
const slideTypeGen = fc.constantFrom("permanent", "temporary");
const storyTypeGen = fc.constantFrom("permanent", "temporary");
const urlGen = fc.webUrl();
const shortStringGen = fc.string({ minLength: 1, maxLength: 50 });
const mediumStringGen = fc.string({ minLength: 1, maxLength: 200 });
const longStringGen = fc.string({ minLength: 1, maxLength: 500 });
const orderGen = fc.integer({ min: 0, max: 100 });
const durationGen = fc.integer({ min: 1000, max: 10000 });
const booleanGen = fc.boolean();
const dateStringGen = fc.constantFrom(
  "2024-01-01T00:00:00.000Z",
  "2024-06-15T12:30:00.000Z",
  "2024-12-31T23:59:59.999Z",
  "2025-03-15T08:45:30.123Z"
);

const actionGen = fc.record({
  label: shortStringGen,
  link: fc.oneof(urlGen, fc.string({ minLength: 1, maxLength: 100 })),
});

const slideFormDataGen = fc.record({
  title: mediumStringGen,
  description: fc.option(longStringGen),
  image: fc.option(urlGen),
  badge: fc.option(shortStringGen),
  primaryAction: fc.option(actionGen),
  secondaryAction: fc.option(actionGen),
  slideType: slideTypeGen,
  expiresAt: fc.option(dateStringGen),
  order: fc.option(orderGen),
  isActive: fc.option(booleanGen),
  linkUrl: fc.option(urlGen),
});

const storyFormDataGen = fc.record({
  title: mediumStringGen,
  subtitle: fc.option(shortStringGen),
  description: fc.option(longStringGen),
  image: fc.option(urlGen),
  badge: fc.option(shortStringGen),
  type: fc.option(fc.constantFrom("success", "video", "testimonial")),
  studentName: fc.option(shortStringGen),
  courseName: fc.option(mediumStringGen),
  courseId: fc.option(fc.uuid()),
  action: fc.option(actionGen),
  duration: fc.option(durationGen),
  storyType: storyTypeGen,
  expiresAt: fc.option(dateStringGen),
  order: fc.option(orderGen),
  isActive: fc.option(booleanGen),
  linkUrl: fc.option(urlGen),
});

describe("Slider Data Transformation Properties", () => {
  describe("Property 1: Complete Field Mapping for Slides", () => {
    test("Feature: slider-api-integration-fix, Property 1: Complete Field Mapping for Slides", () => {
      fc.assert(
        fc.property(slideFormDataGen, (formData) => {
          const result = transformSlideFormToApi(formData);

          // Title should always be mapped
          if (formData.title) {
            expect(result.get("Title")).toBe(formData.title);
          }

          // Description should be mapped if present
          if (formData.description) {
            expect(result.get("Description")).toBe(formData.description);
          }

          // Badge should be mapped if present
          if (formData.badge) {
            expect(result.get("Badge")).toBe(formData.badge);
          }

          // Primary action should have dual mapping
          if (formData.primaryAction?.label) {
            expect(result.get("ButtonText")).toBe(formData.primaryAction.label);
            expect(result.get("PrimaryActionLabel")).toBe(
              formData.primaryAction.label
            );
          }

          if (formData.primaryAction?.link) {
            expect(result.get("ButtonLink")).toBe(formData.primaryAction.link);
            expect(result.get("PrimaryActionLink")).toBe(
              formData.primaryAction.link
            );
          }

          // Secondary action should be mapped
          if (formData.secondaryAction?.label) {
            expect(result.get("SecondaryActionLabel")).toBe(
              formData.secondaryAction.label
            );
          }

          if (formData.secondaryAction?.link) {
            expect(result.get("SecondaryActionLink")).toBe(
              formData.secondaryAction.link
            );
          }

          // Slide type should be mapped to IsPermanent
          const expectedIsPermanent = formData.slideType === "permanent";
          expect(result.get("IsPermanent")).toBe(
            expectedIsPermanent.toString()
          );

          // Order should be converted to string
          if (formData.order !== undefined && formData.order !== null) {
            expect(result.get("Order")).toBe(formData.order.toString());
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Property 2: Image Handling Priority", () => {
    test("Feature: slider-api-integration-fix, Property 2: Image Handling Priority", () => {
      fc.assert(
        fc.property(
          mediumStringGen,
          urlGen,
          fc.boolean(),
          (title, imageUrl, hasFile) => {
            const mockFile = hasFile
              ? new File(["test content"], "test.jpg", { type: "image/jpeg" })
              : null;
            const formData = {
              title,
              image: imageUrl,
              imageFile: mockFile,
              slideType: "permanent",
            };

            const result = transformSlideFormToApi(formData);

            if (hasFile) {
              // File should be prioritized over URL
              expect(result.has("ImageFile")).toBe(true);
              expect(result.get("ImageFile")).toBeInstanceOf(File);
              expect(result.get("ImageFile").name).toBe("test.jpg");
              expect(result.has("ImageUrl")).toBe(false);
            } else {
              // URL should be used when no file
              expect(result.get("ImageUrl")).toBe(imageUrl);
              expect(result.has("ImageFile")).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Property 3: Slide Type and Expiration Mapping", () => {
    test("Feature: slider-api-integration-fix, Property 3: Slide Type and Expiration Mapping", () => {
      fc.assert(
        fc.property(
          mediumStringGen,
          slideTypeGen,
          fc.option(dateStringGen),
          (title, slideType, expiresAt) => {
            const formData = {
              title,
              slideType,
              expiresAt,
              image: "https://example.com/image.jpg",
            };

            const result = transformSlideFormToApi(formData);

            if (slideType === "permanent") {
              expect(result.get("IsPermanent")).toBe("true");
              expect(result.get("ExpiresAt")).toBeNull();
            } else {
              expect(result.get("IsPermanent")).toBe("false");
              if (expiresAt) {
                expect(result.get("ExpiresAt")).toBe(expiresAt);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Property 4: Data Type Conversion", () => {
    test("Feature: slider-api-integration-fix, Property 4: Data Type Conversion", () => {
      fc.assert(
        fc.property(mediumStringGen, orderGen, (title, order) => {
          const formData = {
            title,
            order,
            slideType: "permanent",
            image: "https://example.com/image.jpg",
          };

          const result = transformSlideFormToApi(formData);

          // Order should be converted to string but preserve numeric value
          expect(result.get("Order")).toBe(order.toString());
          expect(parseInt(result.get("Order"))).toBe(order);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Property 5: Update vs Create Field Differences", () => {
    test("Feature: slider-api-integration-fix, Property 5: Update vs Create Field Differences", () => {
      fc.assert(
        fc.property(slideFormDataGen, booleanGen, (formData, isActive) => {
          const formDataWithActive = { ...formData, isActive };

          const createResult = transformSlideFormToApi(formDataWithActive);
          const updateResult =
            transformSlideFormToApiForUpdate(formDataWithActive);

          // Update should have all create fields plus IsActive
          expect(updateResult.get("IsActive")).toBe(isActive.toString());

          // All other fields should be the same
          if (formData.title) {
            expect(updateResult.get("Title")).toBe(createResult.get("Title"));
          }

          if (formData.description) {
            expect(updateResult.get("Description")).toBe(
              createResult.get("Description")
            );
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Property 6: Form Validation Completeness", () => {
    test("Feature: slider-api-integration-fix, Property 6: Form Validation Completeness", () => {
      fc.assert(
        fc.property(
          fc.option(mediumStringGen),
          fc.option(urlGen),
          fc.option(fc.record({ name: fc.string(), type: fc.string() })),
          (title, imageUrl, imageFile) => {
            const formData = {
              title: title?.trim(),
              image: imageUrl,
              imageFile,
            };

            const result = validateSlideForm(formData);

            const hasTitle = title && title.trim().length > 0;
            const hasImage =
              (imageUrl && imageUrl.trim().length > 0) || imageFile;

            if (hasTitle && hasImage) {
              expect(result.isValid).toBe(true);
            } else {
              expect(result.isValid).toBe(false);
              if (!hasTitle) {
                expect(result.errors.title).toBeDefined();
              }
              if (!hasImage) {
                expect(result.errors.image).toBeDefined();
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Property 7: Success Story Field Mapping", () => {
    test("Feature: slider-api-integration-fix, Property 7: Success Story Field Mapping", () => {
      fc.assert(
        fc.property(storyFormDataGen, (formData) => {
          const result = transformStoryFormToApi(formData);

          // Title should always be mapped
          if (formData.title) {
            expect(result.get("Title")).toBe(formData.title);
          }

          // Subtitle should be mapped if present
          if (formData.subtitle) {
            expect(result.get("Subtitle")).toBe(formData.subtitle);
          }

          // Description should be mapped if present
          if (formData.description) {
            expect(result.get("Description")).toBe(formData.description);
          }

          // Type should be mapped if present
          if (formData.type) {
            expect(result.get("Type")).toBe(formData.type);
          }

          // Action should be mapped if present
          if (formData.action?.label) {
            expect(result.get("ActionLabel")).toBe(formData.action.label);
          }

          if (formData.action?.link) {
            expect(result.get("ActionLink")).toBe(formData.action.link);
          }

          // Duration should be converted to string
          if (formData.duration !== undefined && formData.duration !== null) {
            expect(result.get("Duration")).toBe(formData.duration.toString());
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Property 8: Round-trip Data Integrity", () => {
    test("Feature: slider-api-integration-fix, Property 8: Round-trip Data Integrity", () => {
      fc.assert(
        fc.property(slideFormDataGen, (formData) => {
          // Only test with valid data that would pass validation
          if (!formData.title || (!formData.image && !formData.imageFile)) {
            return; // Skip invalid data
          }

          const apiData = transformSlideFormToApi(formData);

          // Verify that all non-empty form fields are preserved in API data
          if (formData.title) {
            expect(apiData.get("Title")).toBe(formData.title);
          }

          if (formData.description) {
            expect(apiData.get("Description")).toBe(formData.description);
          }

          if (formData.primaryAction?.label) {
            expect(apiData.get("PrimaryActionLabel")).toBe(
              formData.primaryAction.label
            );
          }

          if (formData.order !== undefined && formData.order !== null) {
            expect(parseInt(apiData.get("Order"))).toBe(formData.order);
          }

          // Verify boolean conversions are reversible
          const isPermanent = apiData.get("IsPermanent") === "true";
          expect(isPermanent).toBe(formData.slideType === "permanent");
        }),
        { numRuns: 100 }
      );
    });
  });
});

// Unit tests for specific scenarios
describe("Slider Data Transformation Unit Tests", () => {
  test("should handle empty form data gracefully", () => {
    const result = transformSlideFormToApi({});
    expect(result).toBeInstanceOf(FormData);
  });

  test("should validate required fields correctly", () => {
    const invalidData = { title: "", image: "" };
    const result = validateSlideForm(invalidData);

    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe("عنوان الزامی است");
    expect(result.errors.image).toBe("تصویر الزامی است");
  });

  test("should handle API validation errors", () => {
    const error = {
      response: {
        status: 400,
        data: {
          errors: {
            Title: ["Title is required"],
            Description: ["Description is too long"],
          },
        },
      },
    };

    const result = handleApiError(error);
    expect(result).toContain("Title: Title is required");
    expect(result).toContain("Description: Description is too long");
  });

  test("should handle network errors", () => {
    const error = { message: "Network Error" };
    const result = handleApiError(error);
    expect(result).toBe("خطا در شبکه. لطفاً اتصال اینترنت خود را بررسی کنید");
  });
});
