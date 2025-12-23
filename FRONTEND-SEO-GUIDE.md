# راهنمای کامل مدیریت SEO در فرانت‌اند

## مقدمه

این راهنما نحوه مدیریت SEO در فرانت‌اند React برای سیستم آموزشی پردیس را شرح می‌دهد. سیستم بک‌اند از ساختار `SeoMetadata` برای ذخیره اطلاعات SEO استفاده می‌کند.

## ساختار SEO در بک‌اند

### مدل SeoMetadata

```csharp
public class SeoMetadata
{
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? CanonicalUrl { get; set; }
    public bool NoIndex { get; set; }
    public bool NoFollow { get; set; }
}
```

### SeoDto برای API

```csharp
public class SeoDto
{
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? CanonicalUrl { get; set; }
    public bool NoIndex { get; set; }
    public bool NoFollow { get; set; }
}
```

## پیاده‌سازی در React

### 1. تایپ‌های TypeScript

```typescript
// types/seo.ts
export interface SeoData {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  noIndex: boolean;
  noFollow: boolean;
}

export interface CourseWithSeo {
  id: string;
  title: string;
  description: string;
  slug: string;
  seo: SeoData;
  // سایر فیلدهای دوره
}

export interface CategoryWithSeo {
  id: string;
  title: string;
  description: string;
  slug: string;
  seo: SeoData;
  // سایر فیلدهای دسته‌بندی
}
```

### 2. کامپوننت SEOHead

```tsx
// components/SEO/SEOHead.tsx
import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  ogImage?: string;
  ogType?: string;
  structuredData?: object;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalUrl,
  noIndex = false,
  noFollow = false,
  ogImage,
  ogType = "website",
  structuredData,
}) => {
  const siteTitle = "آکادمی پردیس توس";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  const robotsContent = [
    noIndex ? "noindex" : "index",
    noFollow ? "nofollow" : "follow",
  ].join(", ");

  return (
    <Helmet>
      <title>{fullTitle}</title>

      {description && <meta name="description" content={description} />}

      <meta name="robots" content={robotsContent} />

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
```

### 3. هوک SEO

```tsx
// hooks/useSEO.ts
import { useMemo } from "react";
import { SeoData } from "../types/seo";

interface UseSEOProps {
  seoData?: SeoData;
  fallbackTitle?: string;
  fallbackDescription?: string;
  currentUrl?: string;
}

export const useSEO = ({
  seoData,
  fallbackTitle,
  fallbackDescription,
  currentUrl,
}: UseSEOProps) => {
  return useMemo(() => {
    const baseUrl = process.env.REACT_APP_BASE_URL || "https://pardistous.com";

    return {
      title: seoData?.metaTitle || fallbackTitle,
      description: seoData?.metaDescription || fallbackDescription,
      canonicalUrl:
        seoData?.canonicalUrl ||
        (currentUrl ? `${baseUrl}${currentUrl}` : undefined),
      noIndex: seoData?.noIndex || false,
      noFollow: seoData?.noFollow || false,
    };
  }, [seoData, fallbackTitle, fallbackDescription, currentUrl]);
};
```

### 4. کامپوننت صفحه دوره

```tsx
// pages/CoursePage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SEOHead } from "../components/SEO/SEOHead";
import { useSEO } from "../hooks/useSEO";
import { CourseWithSeo } from "../types/seo";

export const CoursePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<CourseWithSeo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // فراخوانی API برای دریافت دوره با اطلاعات SEO
        const response = await fetch(`/api/courses/by-slug/${slug}`);
        const courseData = await response.json();
        setCourse(courseData);
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  const seoConfig = useSEO({
    seoData: course?.seo,
    fallbackTitle: course?.title,
    fallbackDescription: course?.description,
    currentUrl: `/courses/${slug}`,
  });

  // ساختار داده‌های ساختاریافته برای دوره
  const courseStructuredData = course
    ? {
        "@context": "https://schema.org",
        "@type": "Course",
        name: course.title,
        description: course.description,
        provider: {
          "@type": "Organization",
          name: "آکادمی پردیس توس",
        },
        url: `${process.env.REACT_APP_BASE_URL}/courses/${slug}`,
        courseMode: "online",
        inLanguage: "fa",
      }
    : undefined;

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  if (!course) {
    return <div>دوره یافت نشد</div>;
  }

  return (
    <>
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        canonicalUrl={seoConfig.canonicalUrl}
        noIndex={seoConfig.noIndex}
        noFollow={seoConfig.noFollow}
        ogType="article"
        structuredData={courseStructuredData}
      />

      <div className="course-page">
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        {/* محتوای صفحه دوره */}
      </div>
    </>
  );
};
```

### 5. کامپوننت صفحه دسته‌بندی

```tsx
// pages/CategoryPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SEOHead } from "../components/SEO/SEOHead";
import { useSEO } from "../hooks/useSEO";
import { CategoryWithSeo } from "../types/seo";

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<CategoryWithSeo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/by-slug/${slug}`);
        const categoryData = await response.json();
        setCategory(categoryData);
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  const seoConfig = useSEO({
    seoData: category?.seo,
    fallbackTitle: category?.title,
    fallbackDescription: category?.description,
    currentUrl: `/categories/${slug}`,
  });

  const categoryStructuredData = category
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: category.title,
        description: category.description,
        url: `${process.env.REACT_APP_BASE_URL}/categories/${slug}`,
        mainEntity: {
          "@type": "ItemList",
          name: `دوره‌های ${category.title}`,
        },
      }
    : undefined;

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  if (!category) {
    return <div>دسته‌بندی یافت نشد</div>;
  }

  return (
    <>
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        canonicalUrl={seoConfig.canonicalUrl}
        noIndex={seoConfig.noIndex}
        noFollow={seoConfig.noFollow}
        structuredData={categoryStructuredData}
      />

      <div className="category-page">
        <h1>{category.title}</h1>
        <p>{category.description}</p>
        {/* لیست دوره‌های این دسته‌بندی */}
      </div>
    </>
  );
};
```

## API Endpoints مورد نیاز

### 1. دریافت دوره با SEO

```
GET /api/courses/by-slug/{slug}
```

Response:

```json
{
  "id": "guid",
  "title": "عنوان دوره",
  "description": "توضیحات دوره",
  "slug": "course-slug",
  "seo": {
    "metaTitle": "عنوان SEO دوره",
    "metaDescription": "توضیحات SEO دوره",
    "canonicalUrl": "https://pardistous.com/courses/course-slug",
    "noIndex": false,
    "noFollow": false
  }
}
```

### 2. دریافت دسته‌بندی با SEO

```
GET /api/categories/by-slug/{slug}
```

Response:

```json
{
  "id": "guid",
  "title": "عنوان دسته‌بندی",
  "description": "توضیحات دسته‌بندی",
  "slug": "category-slug",
  "seo": {
    "metaTitle": "عنوان SEO دسته‌بندی",
    "metaDescription": "توضیحات SEO دسته‌بندی",
    "canonicalUrl": "https://pardistous.com/categories/category-slug",
    "noIndex": false,
    "noFollow": false
  }
}
```

## نصب وابستگی‌ها

```bash
npm install react-helmet-async
npm install @types/react-helmet-async --save-dev
```

## تنظیمات App.tsx

```tsx
// App.tsx
import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { CoursePage } from "./pages/CoursePage";
import { CategoryPage } from "./pages/CategoryPage";

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/courses/:slug" element={<CoursePage />} />
          <Route path="/categories/:slug" element={<CategoryPage />} />
          {/* سایر روت‌ها */}
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
```

## بهترین شیوه‌ها

### 1. مدیریت عنوان‌ها

- حداکثر 60 کاراکتر برای عنوان
- استفاده از کلمات کلیدی مهم در ابتدای عنوان
- ساختار: "عنوان صفحه | نام سایت"

### 2. توضیحات متا

- حداکثر 160 کاراکتر
- شامل کلمات کلیدی مهم
- جذاب و توصیفی

### 3. URL کانونیکال

- همیشه URL کامل استفاده کنید
- از HTTPS استفاده کنید
- پارامترهای اضافی را حذف کنید

### 4. داده‌های ساختاریافته

- برای دوره‌ها از schema.org/Course استفاده کنید
- برای دسته‌بندی‌ها از schema.org/CollectionPage استفاده کنید
- اطلاعات کامل و دقیق ارائه دهید

## مثال کامل استفاده

```tsx
// pages/HomePage.tsx
import React from "react";
import { SEOHead } from "../components/SEO/SEOHead";

export const HomePage: React.FC = () => {
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "آکادمی پردیس توس",
    description: "بهترین دوره‌های آموزشی آنلاین",
    url: process.env.REACT_APP_BASE_URL,
    sameAs: [
      "https://instagram.com/pardistous",
      "https://telegram.me/pardistous",
    ],
  };

  return (
    <>
      <SEOHead
        title="صفحه اصلی"
        description="آکادمی پردیس توس - بهترین دوره‌های آموزشی آنلاین در ایران"
        canonicalUrl={process.env.REACT_APP_BASE_URL}
        structuredData={homeStructuredData}
      />

      <div className="home-page">{/* محتوای صفحه اصلی */}</div>
    </>
  );
};
```

## نکات مهم

1. **Server-Side Rendering**: برای بهتر شدن SEO، استفاده از Next.js یا Gatsby توصیه می‌شود
2. **Sitemap**: فایل sitemap.xml را به‌روزرسانی کنید
3. **robots.txt**: تنظیمات مناسب برای robots.txt
4. **Performance**: سرعت بارگذاری صفحات تأثیر مستقیم بر SEO دارد
5. **Mobile-First**: طراحی ریسپانسیو ضروری است

این راهنما تمام جنبه‌های مدیریت SEO در فرانت‌اند React را پوشش می‌دهد و با ساختار موجود بک‌اند سازگار است.
