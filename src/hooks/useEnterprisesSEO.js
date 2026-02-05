/**
 * Enterprise SEO Hook
 * Advanced SEO management with performance optimization
 */

import { useMemo, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SEOConfig } from "../config/seo";

export const useEnterpriseSEO = ({
  seoData,
  entityData,
  pageType,
  customConfig = {},
}) => {
  const location = useLocation();

  // Memoized SEO configuration
  const seoConfig = useMemo(() => {
    const defaultConfig = SEOConfig.getDefaultConfig(pageType);

    // Build title with entity data
    const title = buildContextualTitle(
      seoData,
      entityData,
      pageType,
      defaultConfig,
    );

    // Build description with entity data
    const description = buildContextualDescription(
      seoData,
      entityData,
      pageType,
      defaultConfig,
    );

    // Build canonical URL
    const canonical = buildCanonicalUrl(seoData, location, pageType);

    // Determine indexability
    const isIndexable = determineIndexability(
      pageType,
      location.pathname,
      seoData,
    );

    return {
      title,
      description,
      canonical,
      noIndex: seoData?.noIndex || !isIndexable,
      noFollow: seoData?.noFollow || false,
      image: seoData?.image || entityData?.thumbnail || defaultConfig.image,
      ...customConfig,
    };
  }, [seoData, entityData, pageType, location, customConfig]);

  // Structured data generation
  const structuredData = useMemo(() => {
    switch (pageType) {
      case "home":
        return SEOConfig.getOrganizationSchema();

      case "course":
        return entityData ? SEOConfig.getCourseSchema(entityData) : null;

      case "category":
        return entityData
          ? SEOConfig.getCategorySchema(entityData, entityData.courses)
          : null;

      default:
        return null;
    }
  }, [pageType, entityData]);

  // Breadcrumb generation
  const breadcrumbs = useMemo(() => {
    return generateBreadcrumbs(pageType, entityData, location.pathname);
  }, [pageType, entityData, location.pathname]);

  // SEO validation
  const validation = useMemo(() => {
    return SEOConfig.validateSEO(seoConfig);
  }, [seoConfig]);

  // Performance optimization: preload critical resources
  const preloadCriticalResources = useCallback(() => {
    if (seoConfig.image && !seoConfig.image.startsWith("data:")) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = seoConfig.image;
      document.head.appendChild(link);
    }
  }, [seoConfig.image]);

  // Effect for performance optimizations
  useEffect(() => {
    if (pageType === "course" || pageType === "category") {
      preloadCriticalResources();
    }
  }, [pageType, preloadCriticalResources]);

  // Development warnings
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      if (validation.warnings.length > 0) {
        console.warn("SEO Warnings:", validation.warnings);
      }
      if (validation.errors.length > 0) {
        console.error("SEO Errors:", validation.errors);
      }
    }
  }, [validation]);

  return {
    seoConfig,
    structuredData,
    breadcrumbs,
    validation,
    isValid: validation.isValid,
  };
};

// Helper functions
const buildContextualTitle = (seoData, entityData, pageType, defaultConfig) => {
  if (seoData?.metaTitle) return seoData.metaTitle;

  switch (pageType) {
    case "course":
      return entityData?.title || defaultConfig.title;

    case "category":
      return entityData?.title
        ? `دوره‌های ${entityData.title}`
        : defaultConfig.title;

    case "home":
      return defaultConfig.title;

    default:
      return entityData?.title || defaultConfig.title;
  }
};

const buildContextualDescription = (
  seoData,
  entityData,
  pageType,
  defaultConfig,
) => {
  if (seoData?.metaDescription) return seoData.metaDescription;

  switch (pageType) {
    case "course":
      if (entityData?.description) {
        return entityData.description.length > 160
          ? `${entityData.description.substring(0, 157)}...`
          : entityData.description;
      }
      return defaultConfig.description;

    case "category":
      if (entityData?.description) {
        return entityData.description;
      }
      return entityData?.title
        ? `دوره‌های تخصصی ${entityData.title} با آموزش قدم‌به‌قدم و پشتیبانی منتور`
        : defaultConfig.description;

    default:
      return entityData?.description || defaultConfig.description;
  }
};

const buildCanonicalUrl = (seoData, location, pageType) => {
  if (seoData?.canonicalUrl) return seoData.canonicalUrl;

  const baseUrl = SEOConfig.SITE_URL;
  const path = location.pathname;

  // Handle pagination and filtering
  const searchParams = new URLSearchParams(location.search);
  const allowedParams = ["page", "category", "level", "price"];
  const filteredParams = new URLSearchParams();

  allowedParams.forEach((param) => {
    if (searchParams.has(param)) {
      filteredParams.set(param, searchParams.get(param));
    }
  });

  const queryString = filteredParams.toString();
  return `${baseUrl}${path}${queryString ? `?${queryString}` : ""}`;
};

const determineIndexability = (pageType, pathname, seoData) => {
  if (seoData?.noIndex !== undefined) return !seoData.noIndex;

  const noIndexPaths = [
    "/admin",
    "/profile",
    "/cart",
    "/orders",
    "/login",
    "/register",
  ];
  return !noIndexPaths.some((path) => pathname.startsWith(path));
};

const generateBreadcrumbs = (pageType, entityData, pathname) => {
  const breadcrumbs = [{ name: "خانه", url: "/" }];

  switch (pageType) {
    case "course":
      if (entityData?.category) {
        breadcrumbs.push({
          name: entityData.category.title,
          url: `/category/${entityData.category.slug}`,
        });
      }
      if (entityData?.title) {
        breadcrumbs.push({
          name: entityData.title,
          url: `/course/${entityData.slug}`,
        });
      }
      break;

    case "category":
      if (entityData?.title) {
        breadcrumbs.push({
          name: entityData.title,
          url: `/category/${entityData.slug}`,
        });
      }
      break;

    default:
      // Auto-generate from pathname
      const segments = pathname.split("/").filter(Boolean);
      segments.forEach((segment, index) => {
        const path = "/" + segments.slice(0, index + 1).join("/");
        breadcrumbs.push({
          name: segment.charAt(0).toUpperCase() + segment.slice(1),
          url: path,
        });
      });
  }

  return breadcrumbs;
};
