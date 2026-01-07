import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useHomeData } from '../hooks/useHomeData';
import { generateSEOConfig, generateHomeStructuredData } from '../utils/seoHelpers';
import { SITE_NAME, getSiteOrigin } from '../utils/seo';

// Lazy load heavy components
const HeroSlider = React.lazy(() => import('../components/HeroSlider'));
const StorySlider = React.lazy(() => import('../components/StorySlider'));
const FAQ = React.lazy(() => import('../components/FAQ'));

// Import lightweight components normally
import SeoHead from '../components/Seo/SeoHead';
import CourseCard from '../components/CourseCard';
import CourseGridSkeleton from '../components/CourseGridSkeleton';
import { Button } from '../components/UI';
import {
    Sparkles,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Award,
    Clock,
    Users,
    Star,
    Zap,
    ShieldCheck,
    GraduationCap,
    MessageSquare,
    User
} from 'lucide-react';

// Lightweight components
const SectionHeader = ({ title, subtitle, icon: Icon, level = 2 }) => {
    const HeadingTag = `h${level}`;
    return (
        <div className="text-center mb-12">
            {Icon && (
                <div className="inline-flex items-center justify-center p-3 bg-primary-50 dark:bg-primary-900/30 rounded-2xl text-primary-600 dark:text-primary-400 mb-4 animate-in fade-in zoom-in duration-500">
                    <Icon size={24} />
                </div>
            )}
            <HeadingTag className="text-3xl md:text-4xl font-black text-text-primary dark:text-white mb-4 tracking-tight">{title}</HeadingTag>
            <p className="text-text-secondary dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
        </div>
    );
};

const FeatureItem = ({ icon: Icon, title, desc, color }) => (
    <div className="relative bg-gradient-to-br from-white via-neutral-50/50 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 p-8 rounded-3xl border border-neutral-200/50 dark:border-slate-800/50 shadow-lg shadow-neutral-200/20 dark:shadow-slate-900/20 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 transition-all duration-500 group h-full backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-primary-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${color}`}>
                <Icon size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-text-primary dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">{title}</h3>
            <p className="text-text-secondary dark:text-slate-400 leading-relaxed">{desc}</p>
        </div>
    </div>
);

const InstructorCard = ({ instructor }) => {
    const instructorName = instructor.fullName || instructor.name;
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-neutral-100 dark:border-slate-800 shadow-sm hover:border-neutral-200 dark:hover:border-primary-800 hover:shadow-lg transition-all text-center group">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full p-1 bg-gradient-to-tr from-primary-500 to-secondary-500">
                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold text-2xl">
                    {instructorName ? instructorName.charAt(0) : <User />}
                </div>
            </div>
            <h4 className="font-bold text-text-primary dark:text-white text-lg mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {instructorName || 'مدرس ناشناس'}
            </h4>
            <p className="text-xs text-text-tertiary dark:text-slate-400 font-medium mb-4">مدرس ارشد</p>
        </div>
    );
};

const Home = () => {
    const [searchParams] = useSearchParams();
    const categoryId = searchParams.get('category');

    // ✅ OPTIMIZATION: Use route-specific data hook
    const {
        categories,
        instructors,
        courses,
        heroSlides,
        featuredStories,
        loading,
        coursesLoading
    } = useHomeData(categoryId);

    const [page, setPage] = useState(1);

    // SEO configuration
    const seoConfig = useMemo(() => generateSEOConfig({
        title: categoryId ? `دوره‌های ${categories.find(c => c.id == categoryId)?.title || 'دسته‌بندی'}` : 'صفحه اصلی',
        description: 'آکادمی پردیس توس - بهترین دوره‌های آموزشی برنامه‌نویسی و فناوری اطلاعات',
        keywords: ['آموزش برنامه‌نویسی', 'دوره آنلاین', 'پردیس توس'],
        url: getSiteOrigin(),
        siteName: SITE_NAME
    }), [categoryId, categories]);

    const structuredData = useMemo(() => generateHomeStructuredData({
        courses: courses.slice(0, 6),
        instructors: instructors.slice(0, 4)
    }), [courses, instructors]);

    // Show skeleton while loading critical data
    if (loading) {
        return (
            <>
                <SeoHead {...seoConfig} structuredData={structuredData} />
                <div className="min-h-screen">
                    <div className="h-96 bg-slate-100 dark:bg-slate-800 animate-pulse mb-8" />
                    <div className="container mx-auto px-4">
                        <CourseGridSkeleton />
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <SeoHead {...seoConfig} structuredData={structuredData} />

            {/* Hero Section - Lazy loaded */}
            <React.Suspense fallback={<div className="h-96 bg-slate-100 dark:bg-slate-800 animate-pulse" />}>
                {heroSlides.length > 0 && <HeroSlider slides={heroSlides} />}
            </React.Suspense>

            {/* Success Stories - Lazy loaded */}
            <React.Suspense fallback={null}>
                {featuredStories.length > 0 && (
                    <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
                        <div className="container mx-auto px-4">
                            <SectionHeader
                                title="داستان‌های موفقیت"
                                subtitle="تجربه‌های واقعی دانشجویان ما"
                                icon={Award}
                            />
                            <StorySlider stories={featuredStories} />
                        </div>
                    </section>
                )}
            </React.Suspense>

            {/* Categories Section */}
            {categories.length > 0 && (
                <section className="py-16 bg-white dark:bg-slate-950">
                    <div className="container mx-auto px-4">
                        <SectionHeader
                            title="دسته‌بندی دوره‌ها"
                            subtitle="انتخاب کنید و یادگیری را شروع کنید"
                            icon={BookOpen}
                        />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {categories.slice(0, 8).map((category) => (
                                <div key={category.id} className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl text-center hover:shadow-lg transition-all">
                                    <h3 className="font-bold text-text-primary dark:text-white mb-2">{category.title}</h3>
                                    <p className="text-sm text-text-secondary dark:text-slate-400">{category.coursesCount || 0} دوره</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Courses Section */}
            <section className="py-16 bg-slate-50 dark:bg-slate-900">
                <div className="container mx-auto px-4">
                    <SectionHeader
                        title="دوره‌های پیشنهادی"
                        subtitle="بهترین دوره‌ها برای شروع یادگیری"
                        icon={GraduationCap}
                    />

                    {coursesLoading ? (
                        <CourseGridSkeleton />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {courses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Instructors Section */}
            {instructors.length > 0 && (
                <section className="py-16 bg-white dark:bg-slate-950">
                    <div className="container mx-auto px-4">
                        <SectionHeader
                            title="مدرسین ما"
                            subtitle="با بهترین اساتید یاد بگیرید"
                            icon={Users}
                        />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {instructors.slice(0, 8).map((instructor) => (
                                <InstructorCard key={instructor.id} instructor={instructor} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Features Section */}
            <section className="py-16 bg-slate-50 dark:bg-slate-900">
                <div className="container mx-auto px-4">
                    <SectionHeader
                        title="چرا پردیس توس؟"
                        subtitle="مزایای یادگیری با ما"
                        icon={Sparkles}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureItem
                            icon={Zap}
                            title="یادگیری سریع"
                            desc="با روش‌های نوین و عملی"
                            color="bg-gradient-to-br from-yellow-500 to-orange-500"
                        />
                        <FeatureItem
                            icon={ShieldCheck}
                            title="گواهی معتبر"
                            desc="مدرک قابل ارائه به کارفرمایان"
                            color="bg-gradient-to-br from-green-500 to-emerald-500"
                        />
                        <FeatureItem
                            icon={Clock}
                            title="پشتیبانی ۲۴/۷"
                            desc="همیشه در کنار شما هستیم"
                            color="bg-gradient-to-br from-blue-500 to-purple-500"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Section - Lazy loaded */}
            <React.Suspense fallback={null}>
                <FAQ />
            </React.Suspense>
        </>
    );
};

export default Home;