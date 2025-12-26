/**
 * تست ساده برای useSEO hook
 */

import { useSEO } from "./useSEO";

// Mock getSiteOrigin
jest.mock("../utils/seo", () => ({
  getSiteOrigin: () => "http://localhost:3000",
}));

// Mock React hooks
import { renderHook } from "@testing-library/react";

describe("useSEO Hook", () => {
  test("should return correct SEO config with fallback values", () => {
    const { result } = renderHook(() =>
      useSEO({
        seoData: null,
        fallbackTitle: "Test Title",
        fallbackDescription: "Test Description",
        currentUrl: "/test",
      })
    );

    expect(result.current).toEqual({
      title: "Test Title",
      description: "Test Description",
      canonicalUrl: "http://localhost:3000/test",
      noIndex: false,
      noFollow: false,
    });
  });

  test("should use seoData when provided", () => {
    const seoData = {
      metaTitle: "SEO Title",
      metaDescription: "SEO Description",
      canonicalUrl: "https://example.com/custom",
      noIndex: true,
      noFollow: true,
    };

    const { result } = renderHook(() =>
      useSEO({
        seoData,
        fallbackTitle: "Fallback Title",
        fallbackDescription: "Fallback Description",
        currentUrl: "/test",
      })
    );

    expect(result.current).toEqual({
      title: "SEO Title",
      description: "SEO Description",
      canonicalUrl: "https://example.com/custom",
      noIndex: true,
      noFollow: true,
    });
  });
});
