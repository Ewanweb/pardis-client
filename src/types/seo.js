/**
 * SEO Types - تایپ‌های مربوط به SEO
 * مطابق با ساختار بک‌اند SeoMetadata
 */

/**
 * @typedef {Object} SeoData
 * @property {string} [metaTitle] - عنوان SEO
 * @property {string} [metaDescription] - توضیحات SEO
 * @property {string} [canonicalUrl] - URL کانونیکال
 * @property {boolean} noIndex - عدم نمایه‌سازی
 * @property {boolean} noFollow - عدم دنبال کردن لینک‌ها
 */

/**
 * @typedef {Object} CourseWithSeo
 * @property {string} id - شناسه دوره
 * @property {string} title - عنوان دوره
 * @property {string} description - توضیحات دوره
 * @property {string} slug - نامک دوره
 * @property {string} [thumbnail] - تصویر دوره
 * @property {number} [price] - قیمت دوره
 * @property {string} [level] - سطح دوره
 * @property {number} [duration] - مدت زمان دوره
 * @property {SeoData} seo - اطلاعات SEO
 */

/**
 * @typedef {Object} CategoryWithSeo
 * @property {string} id - شناسه دسته‌بندی
 * @property {string} title - عنوان دسته‌بندی
 * @property {string} description - توضیحات دسته‌بندی
 * @property {string} slug - نامک دسته‌بندی
 * @property {string} [icon] - آیکون دسته‌بندی
 * @property {number} [courseCount] - تعداد دوره‌ها
 * @property {SeoData} seo - اطلاعات SEO
 */

/**
 * @typedef {Object} SEOHeadProps
 * @property {string} [title] - عنوان صفحه
 * @property {string} [description] - توضیحات صفحه
 * @property {string} [canonicalUrl] - URL کانونیکال
 * @property {boolean} [noIndex] - عدم نمایه‌سازی
 * @property {boolean} [noFollow] - عدم دنبال کردن لینک‌ها
 * @property {string} [ogImage] - تصویر Open Graph
 * @property {string} [ogType] - نوع Open Graph
 * @property {Object} [structuredData] - داده‌های ساختاریافته
 */

/**
 * @typedef {Object} UseSEOProps
 * @property {SeoData} [seoData] - داده‌های SEO از بک‌اند
 * @property {string} [fallbackTitle] - عنوان پیش‌فرض
 * @property {string} [fallbackDescription] - توضیحات پیش‌فرض
 * @property {string} [currentUrl] - URL فعلی
 */

// Export types for JSDoc
export const SEOTypes = {};
