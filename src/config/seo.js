/**
 * Enterprise SEO Configuration
 * Centralized SEO rules and defaults
 */

export const SEOConfig = {
  // Site constants
  SITE_NAME: "آکادمی پردیس توس",
  SITE_URL: process.env.VITE_SITE_URL || "https://pardistous.ir",
  SITE_DESCRIPTION:
    "دوره‌های پروژه‌محور برنامه‌نویسی، طراحی وب و مهارت‌های دیجیتال با پشتیبانی منتور و مدرک معتبر",
  SITE_LOGO: "/logo.png",
  DEFAULT_OG_IMAGE: "/og-image.png",

  // SEO limits and rules
  TITLE_MAX_LENGTH: 60,
  DESCRIPTION_MAX_LENGTH: 160,
  TITLE_MIN_LENGTH: 10,
  DESCRIPTION_MIN_LENGTH: 50,

  // Default configurations by page type
  getDefaultConfig: (pageType) => {
    const configs = {
      home: {
        title: "آکادمی پردیس توس | دوره‌های برنامه‌نویسی و طراحی وب",
        description:
          "دوره‌های پروژه‌محور برنامه‌نویسی، طراحی وب و مهارت‌های دیجیتال با مسیر یادگیری شفاف و پشتیبانی واقعی",
        image: "/og-home.png",
      },
      course: {
        title: "دوره آموزشی",
        description: "دوره آموزشی تخصصی با پروژه‌های واقعی و پشتیبانی منتور",
        image: "/og-course.png",
      },
      category: {
        title: "دسته‌بندی دوره‌ها",
        description: "مجموعه دوره‌های تخصصی با آموزش قدم‌به‌قدم",
        image: "/og-category.png",
      },
      profile: {
        title: "پروفایل کاربری",
        description: "مدیریت پروفایل و دوره‌های من",
        image: "/og-profile.png",
      },
      admin: {
        title: "پنل مدیریت",
        description: "پنل مدیریت آکادمی پردیس توس",
        image: "/og-admin.png",
      },
    };

    return configs[pageType] || configs.home;
  },

  // Structured data templates
  getOrganizationSchema: () => ({
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "آکادمی پردیس توس",
    description: "بهترین دوره‌های آموزشی آنلاین در ایران",
    url: SEOConfig.SITE_URL,
    logo: `${SEOConfig.SITE_URL}${SEOConfig.SITE_LOGO}`,
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
      telephone: "+98-51-XXXXXXXX",
    },
  }),

  getCourseSchema: (course) => {
    const baseUrl = SEOConfig.SITE_URL;

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
      url: `${baseUrl}/course/${course.slug}`,
      courseMode: "online",
      inLanguage: "fa",
      educationalLevel: course.level || "beginner",
      timeRequired: course.duration ? `PT${course.duration}H` : undefined,
      image: course.thumbnail
        ? course.thumbnail.startsWith("http")
          ? course.thumbnail
          : `${baseUrl}${course.thumbnail}`
        : undefined,
      offers: course.price
        ? {
            "@type": "Offer",
            price: course.price,
            priceCurrency: "IRR",
            availability: "https://schema.org/InStock",
            validFrom: course.createdAt,
          }
        : undefined,
      instructor: course.instructor
        ? {
            "@type": "Person",
            name: course.instructor.name,
            description: course.instructor.bio,
          }
        : undefined,
      aggregateRating: course.rating
        ? {
            "@type": "AggregateRating",
            ratingValue: course.rating.average,
            reviewCount: course.rating.count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    };
  },

  getCategorySchema: (category, courses = []) => {
    const baseUrl = SEOConfig.SITE_URL;

    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: category.title,
      description: category.description,
      url: `${baseUrl}/category/${category.slug}`,
      mainEntity: {
        "@type": "ItemList",
        name: `دوره‌های ${category.title}`,
        numberOfItems: courses.length,
        itemListElement: courses.slice(0, 10).map((course, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Course",
            name: course.title,
            url: `${baseUrl}/course/${course.slug}`,
          },
        })),
      },
    };
  },

  // SEO validation rules
  validateSEO: (seoData) => {
    const errors = [];
    const warnings = [];

    // Title validation
    if (!seoData.title) {
      errors.push("Title is required");
    } else if (seoData.title.length < SEOConfig.TITLE_MIN_LENGTH) {
      warnings.push(
        `Title too short (${seoData.title.length} chars, min ${SEOConfig.TITLE_MIN_LENGTH})`,
      );
    } else if (seoData.title.length > SEOConfig.TITLE_MAX_LENGTH) {
      warnings.push(
        `Title too long (${seoData.title.length} chars, max ${SEOConfig.TITLE_MAX_LENGTH})`,
      );
    }

    // Description validation
    if (!seoData.description) {
      errors.push("Description is required");
    } else if (seoData.description.length < SEOConfig.DESCRIPTION_MIN_LENGTH) {
      warnings.push(
        `Description too short (${seoData.description.length} chars, min ${SEOConfig.DESCRIPTION_MIN_LENGTH})`,
      );
    } else if (seoData.description.length > SEOConfig.DESCRIPTION_MAX_LENGTH) {
      warnings.push(
        `Description too long (${seoData.description.length} chars, max ${SEOConfig.DESCRIPTION_MAX_LENGTH})`,
      );
    }

    // Canonical URL validation
    if (seoData.canonical && !isValidUrl(seoData.canonical)) {
      errors.push("Invalid canonical URL format");
    }

    return { errors, warnings, isValid: errors.length === 0 };
  },

  // URL utilities
  buildCanonicalUrl: (path, params = {}) => {
    const baseUrl = SEOConfig.SITE_URL;
    const normalizedPath = path === "/" ? "/" : path.replace(/\/$/, "");

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        searchParams.set(key, value);
      }
    });

    const queryString = searchParams.toString();
    return `${baseUrl}${normalizedPath}${queryString ? `?${queryString}` : ""}`;
  },
};

// Helper functions
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};
