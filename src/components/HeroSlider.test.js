/**
 * Property-based tests for HeroSlider component display consistency
 * Feature: simplified-slider-system, Property 8: Component Display Consistency
 * Validates: Requirements 7.1, 7.2, 7.4
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import * as fc from "fast-check";
import React from "react";
import HeroSlider from "./HeroSlider";

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

// Generator for simplified slide data (matching the new simplified structure)
const simplifiedSlideArbitrary = fc.record({
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

// Generator for slides array
const slidesArrayArbitrary = fc.array(simplifiedSlideArbitrary, {
  minLength: 1,
  maxLength: 5,
});

describe("HeroSlider Component Display Consistency", () => {
  test(
    "Property 8: Component Display Consistency - For any slider data, only essential elements should be displayed and missing optional fields should not cause rendering errors",
    { timeout: 15000 },
    () => {
      fc.assert(
        fc.property(slidesArrayArbitrary, (slides) => {
          // Render the component with generated slides
          const { container } = renderWithRouter(
            React.createElement(HeroSlider, { slides })
          );

          // Verify the component renders without errors
          expect(container).toBeTruthy();

          // Get the current slide (first slide by default)
          const currentSlide = slides[0];

          // Verify essential elements are present
          // Title should always be displayed (use a flexible matcher)
          const expectedTitle = currentSlide.title.trim() || "Untitled Slide";
          const titleElements = container.querySelectorAll("h1");
          expect(titleElements.length).toBeGreaterThan(0);
          expect(titleElements[0].textContent).toBe(expectedTitle);

          // Image should always be displayed (check that at least one image matches the current slide)
          const imageElements = screen.getAllByAltText(
            currentSlide.title.trim() || "Slide"
          );
          expect(imageElements.length).toBeGreaterThan(0);
          expect(imageElements[0]).toBeInTheDocument();
          // Just verify that an image element exists, don't check specific URL since multiple slides may have different URLs

          // Description should be displayed if present, gracefully handled if missing
          if (currentSlide.description && currentSlide.description.trim()) {
            const descriptionElements = screen.getAllByText(
              currentSlide.description.trim()
            );
            expect(descriptionElements.length).toBeGreaterThan(0);
            expect(descriptionElements[0]).toBeInTheDocument();
          }

          // Action button should be displayed if both actionLabel and actionLink are present
          if (
            currentSlide.actionLabel &&
            currentSlide.actionLabel.trim() &&
            currentSlide.actionLink &&
            currentSlide.actionLink.trim()
          ) {
            // Find button elements specifically, not just any element with the text
            const buttonElements = container.querySelectorAll("button");
            const actionButton = Array.from(buttonElements).find(
              (button) =>
                button.textContent &&
                button.textContent.includes(currentSlide.actionLabel.trim())
            );
            expect(actionButton).toBeTruthy();
            expect(actionButton).toBeInTheDocument();
            expect(actionButton.tagName).toBe("BUTTON");
          }

          // Verify no complex UI elements are present (stats, badges, secondary actions)
          // These should not exist in the simplified component
          expect(screen.queryByText(/badge/i)).not.toBeInTheDocument();
          expect(screen.queryByText(/stats/i)).not.toBeInTheDocument();
          expect(screen.queryByText(/secondary/i)).not.toBeInTheDocument();

          // Verify navigation elements are present for multiple slides
          if (slides.length > 1) {
            // Navigation arrows should be present
            const navButtons = container.querySelectorAll(
              'button[class*="absolute"]'
            );
            expect(navButtons.length).toBeGreaterThanOrEqual(2); // At least prev/next buttons

            // Dots indicator should be present
            const dots = container.querySelectorAll(
              'button[class*="rounded-full"]'
            );
            expect(dots.length).toBeGreaterThanOrEqual(slides.length);
          }

          // Verify responsive design classes are maintained
          const mainContainer = container.querySelector(
            'div[class*="relative"]'
          );
          expect(mainContainer).toHaveClass("w-full");
          expect(mainContainer.className).toMatch(/h-\[600px\]|md:h-\[700px\]/);
        }),
        { numRuns: 20 }
      );
    }
  );

  test("Property 8: Component handles empty or invalid slide data gracefully", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant([]), // Empty array
          fc.constant(null), // Null
          fc.constant(undefined), // Undefined
          fc.array(
            fc.record({
              // Invalid slide data
              id: fc.option(fc.string()),
              title: fc.option(fc.string()),
              // Missing required fields
            }),
            { maxLength: 3 }
          )
        ),
        (invalidSlides) => {
          // Should not throw errors when rendering with invalid data
          expect(() => {
            renderWithRouter(
              React.createElement(HeroSlider, { slides: invalidSlides })
            );
          }).not.toThrow();

          // For empty/null/undefined, component should return null (not render)
          if (!invalidSlides || invalidSlides.length === 0) {
            const { container } = renderWithRouter(
              React.createElement(HeroSlider, { slides: invalidSlides })
            );
            expect(container.firstChild).toBeNull();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test("Property 8: Component maintains consistent structure across different slide configurations", () => {
    fc.assert(
      fc.property(slidesArrayArbitrary, (slides) => {
        const { container } = renderWithRouter(
          React.createElement(HeroSlider, { slides })
        );

        // Verify consistent DOM structure
        const mainContainer = container.querySelector('div[class*="relative"]');
        expect(mainContainer).toBeTruthy();

        // Background image container should always be present
        const backgroundContainer = container.querySelector(
          'div[class*="absolute inset-0"]'
        );
        expect(backgroundContainer).toBeTruthy();

        // Content container should always be present
        const contentContainer = container.querySelector(
          'div[class*="relative z-10"]'
        );
        expect(contentContainer).toBeTruthy();

        // Title container should always be present
        const titleContainer = container.querySelector("h1");
        expect(titleContainer).toBeTruthy();
        expect(titleContainer.textContent).toBe(
          slides[0].title.trim() || "Untitled Slide"
        );

        // Verify no legacy complex elements are rendered
        expect(container.querySelector('[class*="badge"]')).toBeNull();
        expect(container.querySelector('[class*="stats"]')).toBeNull();
        expect(
          container.querySelector('[class*="secondary-action"]')
        ).toBeNull();
      }),
      { numRuns: 20 }
    );
  });
});
