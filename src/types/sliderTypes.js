/**
 * Type definitions for Slider components
 *
 * This file contains JSDoc type definitions for better IDE support
 * and documentation of the data structures used in slider components.
 */

/**
 * Frontend form data structure for slides
 * @typedef {Object} SlideFormData
 * @property {string} [id] - Slide ID (for updates)
 * @property {string} title - Slide title (required)
 * @property {string} [description] - Slide description
 * @property {string} [image] - Image URL or file path
 * @property {File} [imageFile] - Uploaded image file
 * @property {string} [badge] - Badge text
 * @property {Object} [primaryAction] - Primary action button
 * @property {string} [primaryAction.label] - Primary button text
 * @property {string} [primaryAction.link] - Primary button link
 * @property {Object} [secondaryAction] - Secondary action button
 * @property {string} [secondaryAction.label] - Secondary button text
 * @property {string} [secondaryAction.link] - Secondary button link
 * @property {'permanent'|'temporary'} slideType - Slide type
 * @property {string} [expiresAt] - Expiration date (ISO string)
 * @property {number} [order] - Display order
 * @property {boolean} [isActive] - Active status
 * @property {string} [linkUrl] - Additional link URL
 */

/**
 * Frontend form data structure for success stories
 * @typedef {Object} StoryFormData
 * @property {string} [id] - Story ID (for updates)
 * @property {string} title - Story title (required)
 * @property {string} [subtitle] - Story subtitle
 * @property {string} [description] - Story description
 * @property {string} [image] - Image URL or file path
 * @property {File} [imageFile] - Uploaded image file
 * @property {string} [badge] - Badge text
 * @property {string} [type] - Story type (success, video, testimonial)
 * @property {string} [studentName] - Student name
 * @property {string} [courseName] - Course name
 * @property {string} [courseId] - Course ID
 * @property {Object} [action] - Action button
 * @property {string} [action.label] - Action button text
 * @property {string} [action.link] - Action button link
 * @property {number} [duration] - Display duration in milliseconds
 * @property {'permanent'|'temporary'} storyType - Story type
 * @property {string} [expiresAt] - Expiration date (ISO string)
 * @property {number} [order] - Display order
 * @property {boolean} [isActive] - Active status
 * @property {string} [linkUrl] - Additional link URL
 */

/**
 * API request structure for creating hero slides
 * @typedef {Object} HeroSlideCreateRequest
 * @property {string} Title - Slide title (required, max 200 chars)
 * @property {string} [Description] - Slide description (max 500 chars)
 * @property {string} [ImageUrl] - Image URL (max 500 chars)
 * @property {File} [ImageFile] - Image file
 * @property {string} [Badge] - Badge text (max 100 chars)
 * @property {string} [ButtonText] - Button text (max 100 chars)
 * @property {string} [ButtonLink] - Button link (max 500 chars)
 * @property {string} [PrimaryActionLabel] - Primary action label (max 100 chars)
 * @property {string} [PrimaryActionLink] - Primary action link (max 500 chars)
 * @property {string} [SecondaryActionLabel] - Secondary action label (max 100 chars)
 * @property {string} [SecondaryActionLink] - Secondary action link (max 500 chars)
 * @property {number} [Order] - Display order
 * @property {boolean} [IsPermanent] - Whether slide is permanent
 * @property {string} [ExpiresAt] - Expiration date (ISO string)
 * @property {string} [LinkUrl] - Additional link URL (max 500 chars)
 */

/**
 * API request structure for updating hero slides
 * @typedef {HeroSlideCreateRequest} HeroSlideUpdateRequest
 * @property {boolean} [IsActive] - Active status
 */

/**
 * API request structure for creating success stories
 * @typedef {Object} SuccessStoryCreateRequest
 * @property {string} Title - Story title (required, max 200 chars)
 * @property {string} [Subtitle] - Story subtitle (max 100 chars)
 * @property {string} [Description] - Story description (max 1000 chars)
 * @property {string} [ImageUrl] - Image URL (max 500 chars)
 * @property {File} [ImageFile] - Image file
 * @property {string} [Badge] - Badge text (max 100 chars)
 * @property {string} [Type] - Story type (max 50 chars)
 * @property {string} [StudentName] - Student name (max 100 chars)
 * @property {string} [CourseName] - Course name (max 200 chars)
 * @property {string} [CourseId] - Course ID (UUID)
 * @property {string} [ActionLabel] - Action button label (max 100 chars)
 * @property {string} [ActionLink] - Action button link (max 500 chars)
 * @property {number} [Duration] - Display duration in milliseconds
 * @property {number} [Order] - Display order
 * @property {boolean} [IsPermanent] - Whether story is permanent
 * @property {string} [ExpiresAt] - Expiration date (ISO string)
 * @property {string} [LinkUrl] - Additional link URL (max 500 chars)
 */

/**
 * API request structure for updating success stories
 * @typedef {SuccessStoryCreateRequest} SuccessStoryUpdateRequest
 * @property {boolean} [IsActive] - Active status
 */

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {Object<string, string>} errors - Validation errors by field name
 */

/**
 * API response structure
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether request was successful
 * @property {*} data - Response data
 * @property {string} [message] - Response message
 * @property {Object} [errors] - Validation errors
 */

/**
 * Slider API service options
 * @typedef {Object} SliderApiServiceOptions
 * @property {boolean} [showSuccessAlert] - Whether to show success alerts
 * @property {boolean} [showErrorAlert] - Whether to show error alerts
 */

// Export types for JSDoc usage
export const SliderTypes = {
  SlideFormData: "SlideFormData",
  StoryFormData: "StoryFormData",
  HeroSlideCreateRequest: "HeroSlideCreateRequest",
  HeroSlideUpdateRequest: "HeroSlideUpdateRequest",
  SuccessStoryCreateRequest: "SuccessStoryCreateRequest",
  SuccessStoryUpdateRequest: "SuccessStoryUpdateRequest",
  ValidationResult: "ValidationResult",
  ApiResponse: "ApiResponse",
  SliderApiServiceOptions: "SliderApiServiceOptions",
};
