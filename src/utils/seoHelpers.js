/**
 * Non-hook SEO utilities
 * Temporary solution to bypass React hook issues
 */

import { getSiteOrigin } from "./seo";

/**
 * Generate SEO configuration without hooks
 */
export const generateSEOConfig = ({
  seoData,
  fallbackTitle,
  fallbackDescription,
  currentUrl,
}) => {
  try {
    const baseUrl = getSiteOrigin();

    return {
      title: seoData?.metaTitle || fallbackTitle || "آکادمی پردیس توس",
      description:
        seoData?.metaDescription ||
        fallbackDescription ||
        "بهترین دوره‌های آموزشی آنلاین",
      canonicalUrl:
        seoData?.canonicalUrl ||
        (currentUrl ? `${baseUrl}${currentUrl}` : undefined),
      noIndex: seoData?.noIndex || false,
      noFollow: seoData?.noFollow || false,
    };
  } catch (error) {
    console.error("generateSEOConfig error:", error);
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
 * Generate home structured data without hooks
 */
export const generateHomeStructuredData = () => {
  try {
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
  } catch (error) {
    console.error("generateHomeStructuredData error:", error);
    return {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: "آکادمی پردیس توس",
      description: "بهترین دوره‌های آموزشی آنلاین در ایران",
      url: getSiteOrigin(),
    };
  }
};
