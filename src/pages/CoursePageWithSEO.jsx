import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EnterpriseHead from '../components/SEO/EnterpriseHead';

const CoursePageWithSEO = () => {
    const { slug } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/courses/detail/${slug}`);
                const data = await response.json();
                setCourse(data.course);
            } catch (error) {
                console.error("Course fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [slug]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!course) {
        return <div>Course not found</div>;
    }

    return (
        <>
            {/* SEO handled by backend API call */}
            <EnterpriseHead
                entityType="course"
                entitySlug={slug}
            />

            <div className="course-page">
                <div className="container mx-auto px-4 py-8">
                    <div className="course-header">
                        <h1>{course.title}</h1>
                        <p>{course.description}</p>

                        {course.instructor && (
                            <div className="instructor-info">
                                <span>مدرس: {course.instructor.name}</span>
                            </div>
                        )}

                        {course.duration && (
                            <div className="course-meta">
                                <span>مدت زمان: {course.duration} ساعت</span>
                            </div>
                        )}

                        {course.price && (
                            <div className="course-price">
                                <span>{course.price.toLocaleString()} تومان</span>
                            </div>
                        )}
                    </div>

                    <div className="course-content">
                        {/* Course content sections */}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CoursePageWithSEO;