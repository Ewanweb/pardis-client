import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EnterpriseHead from '../components/SEO/EnterpriseHead';

const StaticPageWithSEO = () => {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/pages/${slug}`);
                const data = await response.json();
                setPage(data.page);
            } catch (error) {
                console.error("Page fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [slug]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!page) {
        return <div>Page not found</div>;
    }

    return (
        <>
            {/* SEO handled by backend API call */}
            <EnterpriseHead
                entityType="page"
                entitySlug={slug}
            />

            <div className="static-page">
                <div className="container mx-auto px-4 py-8">
                    <div className="page-header">
                        <h1>{page.title}</h1>
                    </div>

                    <div className="page-content">
                        <div dangerouslySetInnerHTML={{ __html: page.content }} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default StaticPageWithSEO;