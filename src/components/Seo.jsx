import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import {
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_TWITTER_IMAGE,
  buildCanonicalUrl,
  getSiteOrigin,
} from '../utils/seo';

const Seo = ({
  title,
  description,
  canonical,
  robots = 'index, follow',
  ogType = 'website',
  ogImage,
  twitterImage,
  schema = [],
  noIndex = false,
}) => {
  const location = useLocation();

  const canonicalUrl = useMemo(
    () =>
      buildCanonicalUrl({
        canonical,
        pathname: location.pathname,
        search: location.search,
      }),
    [canonical, location.pathname, location.search]
  );

  const schemaMarkup = useMemo(() => {
    if (!schema || schema.length === 0) {
      return null;
    }

    return {
      '@context': 'https://schema.org',
      '@graph': schema,
    };
  }, [schema]);

  const effectiveOgImage = ogImage || SITE_OG_IMAGE;
  const effectiveTwitterImage = twitterImage || SITE_TWITTER_IMAGE;
  const siteOrigin = getSiteOrigin();

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : robots} />

      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="fa_IR" />
      {effectiveOgImage && (
        <meta property="og:image" content={`${siteOrigin}${effectiveOgImage}`} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {effectiveTwitterImage && (
        <meta name="twitter:image" content={`${siteOrigin}${effectiveTwitterImage}`} />
      )}

      {schemaMarkup && (
        <script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>
      )}
    </Helmet>
  );
};

export default Seo;
