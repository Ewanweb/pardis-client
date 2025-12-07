import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// ✅ اضافه کردن ChevronRight و ChevronLeft به ایمپورت‌ها
import { BookOpen, Users, X, Zap, ChevronRight, ChevronLeft, Layers, Search } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/UI';
import CourseCard from '../components/CourseCard';
import { useTheme } from '../context/ThemeContext';
import {Helmet} from "react-helmet-async";

const CategoryPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { mode } = useTheme();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryInfo, setCategoryInfo] = useState(null);
    const [seoData, setSeoData] = useState({
        title: 'دسته‌بندی دوره‌ها | آکادمی پردیس',
        description: 'لیست دوره‌های آموزشی تخصصی در آکادمی پردیس',
        noIndex: false,
        noFollow: false,
        canonical: window.location.href
    });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchCategoryData = async () => {
            setLoading(true);
            try {
                const coursesResponse = await api.get(`/courses/category/${slug}?page=${page}`);
                const data = coursesResponse.data?.data || [];
                const category = coursesResponse.data?.category_info || null;

                setCourses(Array.isArray(data) ? data : []);
                setCategoryInfo(category);

                setSeoData({
                    title: category.seo?.metaTitle || `دوره‌های آموزشی ${category.title} | آکادمی پردیس`,
                    description: category.seo?.metaDescription || `جامع‌ترین دوره‌های ${category.title} را تجربه کنید.`,
                    noIndex: category.seo?.noIndex || false,
                    noFollow: category.seo?.noFollow || false,
                    canonical: category.seo?.canonicalUrl || window.location.href
                });


                if (data.length < 12) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

            } catch (error) {
                console.error("Category Page Error:", error);
                setCourses([]);
                if (error.response && error.response.status === 404) {
                    setCategoryInfo({ title: 'دسته یافت نشد', error: true });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, [slug, page]);

    const categoryTitle = categoryInfo?.title;
    const generateSchema = () => {
        return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": categoryTitle,
            "description": seoData.description,
            "itemListElement": courses.map((course, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `${window.location.origin}/courses/${course.slug || course.id}`, // لینک فرضی دوره تکی
                "name": course.title
            }))
        };
    };

    if (!loading && categoryInfo?.error) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans relative overflow-hidden">
                <Helmet>
                    <title>{seoData.title}</title>
                    <meta name="description" content={seoData.description} />
                    <link rel="canonical" href={seoData.canonical} />
                    <meta name="robots" content={`${seoData.noIndex ? 'noindex' : 'index'}, ${seoData.noFollow ? 'nofollow' : 'follow'}`} />

                    {/* Open Graph */}
                    <meta property="og:title" content={seoData.title} />
                    <meta property="og:description" content={seoData.description} />
                    <meta property="og:url" content={window.location.href} />
                    <meta property="og:type" content="website" />

                    {/* Structured Data */}
                    {courses.length > 0 && (
                        <script type="application/ld+json">
                            {JSON.stringify(generateSchema())}
                        </script>
                    )}
                </Helmet>
                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 dark:opacity-5"></div>

                <div className="relative z-10 text-center p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-bounce">
                        <Search size={40} />
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2">۴۰۴</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">دسته‌بندی مورد نظر شما پیدا نشد.</p>
                    <Button onClick={() => navigate('/')} className="shadow-lg shadow-indigo-500/30">بازگشت به صفحه اصلی</Button>
                </div>
            </div>
        );
    }

    const handleNextPage = () => setPage(prev => prev + 1);
    const handlePrevPage = () => setPage(prev => Math.max(1, prev - 1));

    return (
        <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans relative selection:bg-indigo-500 selection:text-white">

            {/* Background Pattern */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-10 blur-[120px]"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">

                {/* Header Section */}
                <section id="category-header" className="mb-16">
                    <div className="relative overflow-hidden p-8 md:p-12 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                        {/* Decorative Gradients */}
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-right">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 transform rotate-3 transition-transform hover:rotate-6">
                                <Layers size={40} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3 border border-indigo-100 dark:border-indigo-800">
                                    <BookOpen size={14} />
                                    <span>مسیر یادگیری</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                                    دوره‌های <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">{categoryTitle}</span>
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-2xl">
                                    مجموعه‌ای کامل از دوره‌های تخصصی و پروژه‌محور در دسته‌بندی {categoryTitle}.
                                    مهارت‌های خود را با بهترین اساتید ارتقا دهید.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Courses List */}
                <section id="courses-list">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {Array(4).fill(0).map((_, n) => (
                                <div key={n} className="bg-white dark:bg-slate-900 rounded-[2rem] h-[400px] border border-slate-100 dark:border-slate-800 shadow-sm p-5">
                                    <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-5 animate-pulse"></div>
                                    <div className="space-y-3">
                                        <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg w-3/4 animate-pulse"></div>
                                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-full animate-pulse"></div>
                                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/2 animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {courses?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {courses.map(course => <CourseCard key={course.id} course={course} />)}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-700 text-center shadow-sm">
                                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-6 animate-bounce-slow">
                                        <Zap size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-700 dark:text-slate-200 mb-2">هنوز دوره‌ای ثبت نشده!</h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                        به نظر می‌رسد برای دسته‌بندی "{categoryTitle}" هنوز هیچ دوره‌ای منتشر نشده است.
                                    </p>
                                    <Button onClick={() => navigate('/')} variant="secondary" className="mt-8">
                                        بازگشت به همه دوره‌ها
                                    </Button>
                                </div>
                            )}

                            {/* Modern Pagination */}
                            {courses.length > 0 && (
                                <div className="flex justify-center items-center gap-6 mt-16">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={page === 1}
                                        className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-all hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200"
                                    >
                                        <ChevronRight size={20} className="group-hover:-mr-1 transition-all"/>
                                        صفحه قبل
                                    </button>

                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-black shadow-lg shadow-indigo-500/30">
                                        {page}
                                    </div>

                                    <button
                                        onClick={handleNextPage}
                                        disabled={!hasMore}
                                        className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-all hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200"
                                    >
                                        صفحه بعد
                                        <ChevronLeft size={20} className="group-hover:-ml-1 transition-all"/>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CategoryPage;