/**
 * Property-based tests for StorySlider component display consistency
 * Feature: simplified-slider-system, Property 8: Component Display Consistency
 * Validates: Requirements 7.2, 7.4
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import * as fc from "fast-check";
import React from "react";
import StorySlider from "./StorySlider";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper function to render component with router
const renderWithRouter = (component) => {
  return render(React.createElement(BrowserRouter, null, component));
};

// Generator for simplified story data (matching the new simplified structure)
const simplifiedStoryArbitrary = fc.record({
  id: fc.string({ minLength: 1 }),
  title: fc
    .string({ minLength: 1, maxLength: 200 })
    .filter((s) => s.trim().length > 0),
  description: fc.option(
    fc.string({ maxLength: 500 }).filter((s) => s.trim().length > 0)
  ),
  image: fc.webUrl(),
  actionLabel: fc.option(
    fc
      .string({ minLength: 1, maxLength: 100 })
      .filter((s) => s.trim().length > 0)
  ),
  actionLink: fc.option(fc.webUrl()),
  order: fc.integer({ min: 0, max: 100 }),
  isActive: fc.boolean(),
});

// Generator for stories array
const storiesArrayArbitrary = fc.array(simplifiedStoryArbitrary, {
  minLength: 1,
  maxLength: 8,
});

describe("StorySlider Component Display Consistency", () => {
  test("Property 8: Component Display Consistency - For any story data, only essential elements should be displayed and missing optional fields should not cause rendering errors", () => {
    fc.assert(
      fc.property(storiesArrayArbitrary, (stories) => {
        // Render the component with generated stories
        const { container } = renderWithRouter(
          React.createElement(StorySlider, { stories })
        );

        // Verify the component renders without errors
        expect(container).toBeTruthy();

        // Verify main container has correct styling
        const mainContainer = container.querySelector(
          'div[class*="relative w-full h-"]'
        );
        expect(mainContainer).toBeTruthy();

        // Verify background image container is present
        const backgroundContainer = container.querySelector(
          'div[class*="absolute inset-0"]'
        );
        expect(backgroundContainer).toBeTruthy();

        // Verify content container is present
        const contentContainer = container.querySelector(
          'div[class*="relative z-10 h-full flex items-center"]'
        );
        expect(contentContainer).toBeTruthy();

        // Story image should be displayed (check by DOM structure rather than text)
        const imageElements = container.querySelectorAll("img");
        expect(imageElements.length).toBeGreaterThan(0);

        // Story title should be in an h2 element
        const titleElements = container.querySelectorAll("h2");
        expect(titleElements.length).toBeGreaterThan(0);

        // Verify essential elements are present for the current story
        const currentStory = stories[0]; // First story is displayed by default

        // Description should be in a p element if present
        if (currentStory.description) {
          const descriptionElements = container.querySelectorAll("p");
          expect(descriptionElements.length).toBeGreaterThan(0);
        }

        // Action button should be present if both actionLabel and actionLink are present
        if (currentStory.actionLabel && currentStory.actionLink) {
          const actionButtons = container.querySelectorAll(
            'button[class*="px-8 py-4 bg-white"]'
          );
          expect(actionButtons.length).toBeGreaterThan(0);
        }

        // Section title should be displayed in h3 element
        const sectionTitleElements = container.querySelectorAll("h3");
        expect(sectionTitleElements.length).toBeGreaterThan(0);

        // Verify no complex UI elements are present by checking for specific semantic elements
        // These should not exist in the simplified component
        expect(
          container.querySelector('[data-testid="story-badge"]')
        ).toBeNull();
        expect(
          container.querySelector('[data-testid="story-stats"]')
        ).toBeNull();
        expect(
          container.querySelector('[data-testid="story-duration"]')
        ).toBeNull();
        expect(
          container.querySelector('[data-testid="story-type"]')
        ).toBeNull();
        expect(
          container.querySelector('[data-testid="story-expiration"]')
        ).toBeNull();

        // Check for specific complex UI patterns that shouldn't exist
        expect(container.querySelector(".story-card")).toBeNull();
        expect(container.querySelector(".instagram-style")).toBeNull();

        // Verify navigation elements are present for multiple stories
        if (stories.length > 1) {
          // Navigation arrows should be present
          const navButtons = container.querySelectorAll(
            'button[class*="absolute"][class*="top-1/2"]'
          );
          expect(navButtons.length).toBeGreaterThanOrEqual(2);

          // Dots indicator should be present
          const dotsContainer = container.querySelector(
            'div[class*="absolute bottom-6 left-1/2"]'
          );
          expect(dotsContainer).toBeTruthy();
        }
      }),
      { numRuns: 100 }
    );
  });

  test("Property 8: Component handles empty or invalid story data gracefully", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant([]), // Empty array
          fc.constant(null), // Null
          fc.constant(undefined), // Undefined
          fc.array(
            fc.record({
              // Invalid story data
              id: fc.option(fc.string()),
              title: fc.option(fc.string()),
              // Missing required fields
            }),
            { maxLength: 3 }
          )
        ),
        (invalidStories) => {
          // Should not throw errors when rendering with invalid data
          expect(() => {
            renderWithRouter(
              React.createElement(StorySlider, { stories: invalidStories })
            );
          }).not.toThrow();

          // For empty/null/undefined, component should return null (not render)
          if (!invalidStories || invalidStories.length === 0) {
            const { container } = renderWithRouter(
              React.createElement(StorySlider, { stories: invalidStories })
            );
            expect(container.firstChild).toBeNull();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test("Property 8: Component maintains consistent structure with HeroSlider", () => {
    fc.assert(
      fc.property(storiesArrayArbitrary, (stories) => {
        const { container } = renderWithRouter(
          React.createElement(StorySlider, { stories })
        );

        // Verify consistent DOM structure similar to HeroSlider
        const mainContainer = container.querySelector(
          'div[class*="relative w-full h-"]'
        );
        expect(mainContainer).toBeTruthy();

        // Background image container should be present
        const backgroundContainer = container.querySelector(
          'div[class*="absolute inset-0"]'
        );
        expect(backgroundContainer).toBeTruthy();

        // Content container should be present
        const contentContainer = container.querySelector(
          'div[class*="relative z-10 h-full flex items-center"]'
        );
        expect(contentContainer).toBeTruthy();

        // Section title should be positioned at top-left
        const sectionTitle = container.querySelector(
          'div[class*="absolute top-6 left-6"]'
        );
        expect(sectionTitle).toBeTruthy();

        // Verify the component follows the same pattern as HeroSlider
        // but with story-specific styling (different gradient colors)
        const gradientContainer = container.querySelector(
          'div[class*="from-green-900 via-teal-900 to-blue-900"]'
        );
        expect(gradientContainer).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  test("Property 8: Component handles missing optional fields gracefully", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            title: fc.string({ minLength: 1, maxLength: 200 }),
            image: fc.webUrl(),
            // Optional fields may be missing
            description: fc.option(fc.string()),
            actionLabel: fc.option(fc.string()),
            actionLink: fc.option(fc.string()),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (stories) => {
          // Should render without errors even when optional fields are missing
          const { container } = renderWithRouter(
            React.createElement(StorySlider, { stories })
          );

          expect(container).toBeTruthy();

          // Title should always be present (required field) - check by DOM structure
          const titleElements = container.querySelectorAll("h2");
          expect(titleElements.length).toBeGreaterThan(0);

          // Image should always be present (required field) - check by DOM structure
          const imageElements = container.querySelectorAll("img");
          expect(imageElements.length).toBeGreaterThan(0);

          // Verify essential elements are present for the current story
          const currentStory = stories[0];

          // Optional fields should not cause errors if missing
          if (!currentStory.description) {
            // Should not crash when description is missing
            expect(container).toBeTruthy();
          } else {
            // Description should be in a p element if present
            const descriptionElements = container.querySelectorAll("p");
            expect(descriptionElements.length).toBeGreaterThan(0);
          }

          if (!currentStory.actionLabel || !currentStory.actionLink) {
            // Should not crash when action is missing
            expect(container).toBeTruthy();
          } else {
            // Action button should be present if both fields are present
            const actionButtons = container.querySelectorAll(
              'button[class*="px-8 py-4 bg-white"]'
            );
            expect(actionButtons.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
