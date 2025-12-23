import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { buildCanonicalUrl, getSiteOrigin } from '../../utils/seo';

const SeoHead = ({
  title,
  description,
  canonical,
  noIndex = false,
  noFollow = false,
  ogType = 'website',
  ogImage = '/og-image.png',
  locale = 'fa_IR',
  schemas = []
}) => {
  const location = useLocation();

  const canonicalUrl = useMemo(() => {
    if (canonical) {
      return canonical;
    }
    return buildCanonicalUrl(`${location.pathname}${location.search || ''}`);
  }, [canonical, location.pathname, location.search]);

  const robotsContent = useMemo(() => {
    const indexValue = noIndex ? 'noindex' : 'index';
    const followValue = noFollow ? 'nofollow' : 'follow';
    return `${indexValue}, ${followValue}`;
  }, [noIndex, noFollow]);

  const normalizedSchemas = useMemo(() => {
    if (!schemas.length) return [];
    const seen = new Set();
    return schemas.filter((schema) => {
      const key = `${schema['@type']}-${schema.name || schema.url || ''}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [schemas]);

  const siteUrl = getSiteOrigin();
  const resolvedOgImage = useMemo(() => {
    if (!ogImage) return null;
    return ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  }, [ogImage, siteUrl]);

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={robotsContent} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="آکادمی پردیس توس" />
      <meta property="og:locale" content={locale} />
      {resolvedOgImage && <meta property="og:image" content={resolvedOgImage} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {resolvedOgImage && <meta name="twitter:image" content={resolvedOgImage} />}

      {normalizedSchemas.map((schema, index) => (
        <script key={`${schema['@type']}-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SeoHead;
