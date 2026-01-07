/**
 * کامپوننت SEOHead - مدیریت تگ‌های SEO
 * مطابق با ساختار بک‌اند SeoMetadata
 */

import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { buildCanonicalUrl, getSiteOrigin, SITE_NAME } from '../../utils/seo';

/**
 * کامپوننت SEOHead برای مدیریت تگ‌های SEO
 * @param {import('../../types/seo').SEOHeadProps} props
 */
const SeoHead = ({
  title,
  description,
  canonicalUrl,
  noIndex = false,
  noFollow = false,
  ogImage,
  ogType = 'website',
  structuredData,
}) => {
  const location = useLocation();

  const fullTitle = useMemo(() => {
    return title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  }, [title]);

  const resolvedCanonicalUrl = useMemo(() => {
    if (canonicalUrl) {
      return canonicalUrl;
    }
    return buildCanonicalUrl(`${location.pathname}${location.search || ''}`);
  }, [canonicalUrl, location.pathname, location.search]);

  const robotsContent = useMemo(() => {
    const indexValue = noIndex ? 'noindex' : 'index';
    const followValue = noFollow ? 'nofollow' : 'follow';
    return `${indexValue}, ${followValue}`;
  }, [noIndex, noFollow]);

  const resolvedOgImage = useMemo(() => {
    if (!ogImage) return null;
    const siteUrl = getSiteOrigin();
    return ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  }, [ogImage]);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={resolvedCanonicalUrl} />
      <meta name="robots" content={robotsContent} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={resolvedCanonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="fa_IR" />
      {resolvedOgImage && <meta property="og:image" content={resolvedOgImage} />}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {resolvedOgImage && <meta name="twitter:image" content={resolvedOgImage} />}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SeoHead;
