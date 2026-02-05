/**
 * Enterprise SEO Head Component
 * Unified SEO rendering for all entity types
 */

import React, { useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const EnterpriseHead = ({ seoData, entityType, entitySlug }) => {
    const location = useLocation();
    const [resolvedSeo, setResolvedSeo] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    // Fetch SEO data from backend API
    useEffect(() => {
        const fetchSeoData = async () => {
            if (seoData) {
                setResolvedSeo(seoData);
                setLoading(false);
                return;
            }

            if (!entityType || !entitySlug) {
                setLoading(false);
                return;
            }

            try {
                const params = new URLSearchParams({
                    language: 'fa',
                    ...(location.search && { ...Object.fromEntries(new URLSearchParams(location.search)) })
                });

                const response = await fetch(`/api/seo/${entityType}/${entitySlug}?${params}`);
                if (response.ok) {
                    const seoResult = await response.json();
                    setResolvedSeo(seoResult);
                }
            } catch (error) {
                console.error('Failed to fetch SEO data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSeoData();
    }, [entityType, entitySlug, location.search, seoData]);

    const seoConfig = useMemo(() => {
        if (!resolvedSeo) {
            return {
                title: 'آکادمی پردیس توس',
                description: 'دوره‌های پروژه‌محور برنامه‌نویسی و طراحی وب',
                canonicalUrl: `${window.location.origin}${location.pathname}`,
                robotsContent: 'index, follow',
                openGraphTitle: 'آکادمی پردیس توس',
                openGraphDescription: 'دوره‌های پروژه‌محور برنامه‌نویسی و طراحی وب',
                openGraphType: 'website',
                openGraphUrl: `${window.location.origin}${location.pathname}`,
                twitterTitle: 'آکادمی پردیس توس',
                twitterDescription: 'دوره‌های پروژه‌محور برنامه‌نویسی و طراحی وب',
                jsonLdSchemas: [],
                breadcrumbs: []
            };
        }

        return {
            title: resolvedSeo.title,
            description: resolvedSeo.description,
            keywords: resolvedSeo.keywords,
            canonicalUrl: resolvedSeo.canonicalUrl,
            robotsContent: resolvedSeo.robotsContent,
            openGraphTitle: resolvedSeo.openGraphTitle,
            openGraphDescription: resolvedSeo.openGraphDescription,
            openGraphImage: resolvedSeo.openGraphImage,
            openGraphType: resolvedSeo.openGraphType,
            openGraphUrl: resolvedSeo.openGraphUrl,
            twitterTitle: resolvedSeo.twitterTitle,
            twitterDescription: resolvedSeo.twitterDescription,
            twitterImage: resolvedSeo.twitterImage,
            twitterCardType: resolvedSeo.twitterCardType,
            jsonLdSchemas: resolvedSeo.jsonLdSchemas || [],
            breadcrumbs: resolvedSeo.breadcrumbs || [],
            author: resolvedSeo.author,
            lastModified: resolvedSeo.lastModified,
            prevUrl: resolvedSeo.prevUrl,
            nextUrl: resolvedSeo.nextUrl
        };
    }, [resolvedSeo, location.pathname]);

    if (loading) {
        return null; // Don't render anything while loading
    }

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{seoConfig.title}</title>
            <meta name="description" content={seoConfig.description} />
            {seoConfig.keywords && <meta name="keywords" content={seoConfig.keywords} />}
            <link rel="canonical" href={seoConfig.canonicalUrl} />
            <meta name="robots" content={seoConfig.robotsContent} />

            {/* Language and Locale */}
            <html lang="fa" dir="rtl" />
            <meta httpEquiv="content-language" content="fa" />

            {/* Open Graph */}
            <meta property="og:title" content={seoConfig.openGraphTitle} />
            <meta property="og:description" content={seoConfig.openGraphDescription} />
            <meta property="og:url" content={seoConfig.openGraphUrl} />
            <meta property="og:type" content={seoConfig.openGraphType} />
            <meta property="og:site_name" content="آکادمی پردیس توس" />
            <meta property="og:locale" content="fa_IR" />
            {seoConfig.openGraphImage && <meta property="og:image" content={seoConfig.openGraphImage} />}
            {seoConfig.openGraphImage && <meta property="og:image:alt" content={seoConfig.openGraphTitle} />}

            {/* Twitter Card */}
            <meta name="twitter:card" content={seoConfig.twitterCardType || "summary_large_image"} />
            <meta name="twitter:title" content={seoConfig.twitterTitle} />
            <meta name="twitter:description" content={seoConfig.twitterDescription} />
            {seoConfig.twitterImage && <meta name="twitter:image" content={seoConfig.twitterImage} />}

            {/* Additional Meta */}
            {seoConfig.author && <meta name="author" content={seoConfig.author} />}
            {seoConfig.lastModified && <meta name="last-modified" content={seoConfig.lastModified} />}

            {/* Pagination Links */}
            {seoConfig.prevUrl && <link rel="prev" href={seoConfig.prevUrl} />}
            {seoConfig.nextUrl && <link rel="next" href={seoConfig.nextUrl} />}

            {/* JSON-LD Structured Data */}
            {seoConfig.jsonLdSchemas.map((schema, index) => (
                <script key={index} type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            ))}

            {/* Breadcrumb Schema */}
            {seoConfig.breadcrumbs.length > 1 && (
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": seoConfig.breadcrumbs.map((crumb) => ({
                            "@type": "ListItem",
                            "position": crumb.position,
                            "name": crumb.name,
                            "item": crumb.url.startsWith('http') ? crumb.url : `${window.location.origin}${crumb.url}`
                        }))
                    })}
                </script>
            )}
        </Helmet>
    );
};

export default EnterpriseHead;