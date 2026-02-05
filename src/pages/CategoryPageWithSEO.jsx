import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EnterpriseHead from '../components/SEO/EnterpriseHead';
import CourseCard from '../components/CourseCard';

const CategoryPageWithSEO = () => {
    const { slug } = useParams();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/courses/category/${slug}${window.location.search}`);
                const data = await response.json();
                setCourses(data.courses || []);
            } catch (error) {
                console.error("Category fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, [slug]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {/* SEO handled by backend API call */}
            <EnterpriseHead
                entityType="category"
                entitySlug={slug}
            />

            <div className="category-page">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CategoryPageWithSEO;