/**
 * Custom Hook برای مدیریت SEO
 * مطابق با ساختار بک‌اند SeoMetadata
 */

import { useMemo } from "react";
import { getSiteOrigin } from "../utils/seo";
import { debugLog, debugError, debugReactHook } from "../utils/debug";

/**
 * Hook برای مدیریت اطلاعات SEO
 * @param {import('../types/seo').UseSEOProps} props
 * @returns {Object} اطلاعات SEO پردازش شده
 */
export const useSEO = ({
  seoData,
  fallbackTitle,
  fallbackDescription,
  currentUrl,
}) => {
  debugLog("useSEO called with props:", {
    seoData,
    fallbackTitle,
    fallbackDescription,
    currentUrl,
  });

  try {
    const result = useMemo(() => {
      const baseUrl = getSiteOrigin();

      const seoConfig = {
        title: seoData?.metaTitle || fallbackTitle,
        description: seoData?.metaDescription || fallbackDescription,
        canonicalUrl:
          seoData?.canonicalUrl ||
          (currentUrl ? `${baseUrl}${currentUrl}` : undefined),
        noIndex: seoData?.noIndex || false,
        noFollow: seoData?.noFollow || false,
      };

      debugLog("useSEO result:", seoConfig);
      return seoConfig;
    }, [seoData, fallbackTitle, fallbackDescription, currentUrl]);

    debugReactHook(
      "useSEO",
      { seoData, fallbackTitle, fallbackDescription, currentUrl },
      result
    );
    return result;
  } catch (error) {
    debugError("useSEO error:", error);
    // Fallback در صورت خطا
    return {
      title: fallbackTitle || "آکادمی پردیس توس",
      description: fallbackDescription || "بهترین دوره‌های آموزشی آنلاین",
      canonicalUrl: currentUrl ? `${getSiteOrigin()}${currentUrl}` : undefined,
      noIndex: false,
      noFollow: false,
    };
  }
};

/**
 * Hook برای ایجاد داده‌های ساختاریافته دوره
 * @param {import('../types/seo').CourseWithSeo} course
 * @param {string} slug
 * @returns {Object|null} داده‌های ساختاریافته
 */
export const useCourseStructuredData = (course, slug) => {
  try {
    return useMemo(() => {
      if (!course) return null;

      const baseUrl = getSiteOrigin();

      return {
        "@context": "https://schema.org",
        "@type": "Course",
        name: course.title,
        description: course.description,
        provider: {
          "@type": "Organization",
          name: "آکادمی پردیس توس",
          url: baseUrl,
        },
        url: `${baseUrl}/course/${slug}`,
        courseMode: "online",
        inLanguage: "fa",
        ...(course.thumbnail && {
          image: course.thumbnail.startsWith("http")
            ? course.thumbnail
            : `${baseUrl}${course.thumbnail}`,
        }),
        ...(course.price && {
          offers: {
            "@type": "Offer",
            price: course.price,
            priceCurrency: "IRR",
            availability: "https://schema.org/InStock",
          },
        }),
        ...(course.level && {
          educationalLevel: course.level,
        }),
        ...(course.duration && {
          timeRequired: `PT${course.duration}H`,
        }),
      };
    }, [course, slug]);
  } catch (error) {
    debugError("useCourseStructuredData error:", error);
    return null;
  }
};

/**
 * Hook برای ایجاد داده‌های ساختاریافته دسته‌بندی
 * @param {import('../types/seo').CategoryWithSeo} category
 * @param {string} slug
 * @returns {Object|null} داده‌های ساختاریافته
 */
export const useCategoryStructuredData = (category, slug) => {
  try {
    return useMemo(() => {
      if (!category) return null;

      const baseUrl = getSiteOrigin();

      return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: category.title,
        description: category.description,
        url: `${baseUrl}/category/${slug}`,
        mainEntity: {
          "@type": "ItemList",
          name: `دوره‌های ${category.title}`,
          ...(category.courseCount && {
            numberOfItems: category.courseCount,
          }),
        },
      };
    }, [category, slug]);
  } catch (error) {
    debugError("useCategoryStructuredData error:", error);
    return null;
  }
};

/**
 * Hook برای ایجاد داده‌های ساختاریافته صفحه اصلی
 * @returns {Object} داده‌های ساختاریافته
 */
export const useHomeStructuredData = () => {
  try {
    return useMemo(() => {
      const baseUrl = getSiteOrigin();

      return {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: "آکادمی پردیس توس",
        description: "بهترین دوره‌های آموزشی آنلاین در ایران",
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        sameAs: [
          "https://instagram.com/pardistous",
          "https://telegram.me/pardistous",
        ],
        address: {
          "@type": "PostalAddress",
          addressCountry: "IR",
          addressLocality: "مشهد",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: "Persian",
        },
      };
    }, []);
  } catch (error) {
    debugError("useHomeStructuredData error:", error);
    return {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: "آکادمی پردیس توس",
      description: "بهترین دوره‌های آموزشی آنلاین در ایران",
      url: getSiteOrigin(),
    };
  }
};

export default useSEO;
