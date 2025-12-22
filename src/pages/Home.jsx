import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, BookOpen, Award, Clock, Phone, ArrowLeft, Users, X, Star, Zap, ShieldCheck, PlayCircle, GraduationCap, MessageSquare, User, Layers } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/UI';
import CourseCard from '../components/CourseCard';
import CourseGridSkeleton from '../components/CourseGridSkeleton';
import SeoHead from '../components/Seo/SeoHead';
import {
    buildCanonicalUrl,
    createBreadcrumbSchema,
    createFaqSchema,
    createItemListSchema,
    createOrganizationSchema,
    createWebSiteSchema,
    getSiteBaseUrl
} from '../utils/seo';

// --- کامپوننت‌های داخلی ---

const SectionHeader = ({ title, subtitle, icon: Icon, level = 2 }) => {
    const HeadingTag = `h${level}`;
    return (
        <div className="text-center mb-12">
            {Icon && (
                <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400 mb-4 animate-in fade-in zoom-in duration-500">
                    <Icon size={24} />
                </div>
            )}
            <HeadingTag className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{title}</HeadingTag>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
        </div>
    );
};

const FeatureItem = ({ icon: Icon, title, desc, color }) => (
    <div className="relative bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 transition-all duration-500 group h-full backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${color}`}>
                <Icon size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
        </div>
    </div>
);

const StatBox = ({ value, label }) => (
    <div className="text-center p-8 bg-gradient-to-br from-white via-indigo-50/30 to-white dark:from-slate-800/80 dark:via-slate-700/50 dark:to-slate-800/80 rounded-3xl border border-indigo-200/30 dark:border-slate-700/50 shadow-lg shadow-indigo-100/50 dark:shadow-slate-900/20 hover:shadow-xl hover:shadow-indigo-200/60 dark:hover:shadow-slate-800/30 transition-all duration-500 backdrop-blur-sm group">
        <div className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 tracking-tighter group-hover:scale-110 transition-transform duration-300">{value}</div>
        <div className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{label}</div>
    </div>
);

const InstructorCard = ({ instructor }) => {
    const instructorName = instructor.fullName || instructor.name;
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg transition-all text-center group">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500">
                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold text-2xl">
                    {instructorName ? instructorName.charAt(0) : <User />}
                </div>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {instructorName || 'مدرس ناشناس'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">مدرس ارشد</p>
            <div className="flex justify-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                    برنامه‌نویسی
                </span>
            </div>
        </div>
    );
};

const TestimonialCard = ({ name, role, text, image }) => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-100 dark:hover:border-indigo-900 transition-colors relative">
        <div className="absolute top-8 left-8 text-slate-200 dark:text-slate-800">
            <MessageSquare size={40} fill="currentColor" className="opacity-50" />
        </div>
        <div className="flex items-center gap-1 text-amber-400 mb-6">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed relative z-10">"{text}"</p>
        <div className="flex items-center gap-4 border-t border-slate-50 dark:border-slate-800 pt-6">
        <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            width="48"
            height="48"
            className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-md"
        />
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">{role}</p>
            </div>
        </div>
    </div>
);

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const categoryId = searchParams.get('category_id');
    const [categoryTitle, setCategoryTitle] = useState(null);

    // ✅ استیت سئو: مقادیر پیش‌فرض
    const [seoData, setSeoData] = useState({
        title: 'آکادمی پردیس توس | آموزش برنامه‌نویسی و مهارت‌های دیجیتال',
        description: 'دوره‌های پروژه‌محور برنامه‌نویسی، طراحی وب و مهارت‌های دیجیتال با پشتیبانی منتور و مدرک معتبر. مسیر یادگیری تا استخدام.',
        noIndex: false,
        noFollow: false,
        canonical: buildCanonicalUrl('/')
    });

    // 1. دریافت اطلاعات پایه (دسته‌بندی‌ها و مدرسین)
    useEffect(() => {
        api.get('home/categories')
            .then(res => setCategories(res.data?.data || []))
            .catch(err => console.error("Categories Error:", err));

        // ✅ دریافت لیست مدرسین
        api.get('/home/Instructors')
            .then(res => setInstructors(res.data?.data || []))
            .catch(err => console.error("Instructors Error:", err));
    }, []);

    // 2. دریافت دوره‌ها و ✅ تنظیم سئو از بک‌اند
    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                let url = `/home/courses?page=${page}`;

                if (categoryId) {
                    url += `&category_id=${categoryId}`;
                    // پیدا کردن دسته‌بندی برای تایتل و سئو
                    const cat = categories?.find(c => c.id == categoryId);
                    if (cat) {
                        setCategoryTitle(cat.title);

                        // ✅ استخراج دیتای سئو از آبجکت category که از بک‌اند آمده
                        // فرض بر این است که بک‌اند فیلد seo را برمی‌گرداند
                        setSeoData({
                            title: cat.seo?.metaTitle || `دوره‌های ${cat.title} | آموزش پروژه‌محور در آکادمی پردیس توس`,
                            description: cat.seo?.metaDescription || `لیست کامل دوره‌های ${cat.title} با مسیر یادگیری مرحله‌به‌مرحله، منتورینگ و پروژه عملی.`,
                            noIndex: cat.seo?.noIndex ?? true,
                            noFollow: cat.seo?.noFollow || false,
                            canonical: cat.seo?.canonicalUrl || buildCanonicalUrl(`/category/${cat.slug || ''}`)
                        });
                    }
                } else {
                    setCategoryTitle(null);
                    // ✅ بازگشت به سئوی پیش‌فرض صفحه اصلی
                    setSeoData({
                        title: 'آکادمی پردیس توس | آموزش برنامه‌نویسی و مهارت‌های دیجیتال',
                        description: 'دوره‌های پروژه‌محور برنامه‌نویسی، طراحی وب و مهارت‌های دیجیتال با پشتیبانی منتور و مدرک معتبر. مسیر یادگیری تا استخدام.',
                        noIndex: false,
                        noFollow: false,
                        canonical: buildCanonicalUrl('/')
                    });
                }

                const response = await api.get(url);
                const data = response.data?.data || response.data || [];

                setCourses(Array.isArray(data) ? data : []);

                if (data.length < 12) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

            } catch (error) {
                console.error("Courses Error:", error);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [categoryId, page, categories]); // وابستگی به categories مهم است تا اطلاعات سئو آپدیت شود

    useEffect(() => {
        setPage(1);
    }, [categoryId]);

    const clearFilter = useCallback(() => {
        setSearchParams({});
        setPage(1);
    }, [setSearchParams]);

    const handleNextPage = useCallback(() => setPage(prev => prev + 1), []);
    const handlePrevPage = useCallback(() => setPage(prev => Math.max(1, prev - 1)), []);
    const handleCategoryClick = useCallback((slug) => navigate(`/courses/${slug}`), [navigate]);

    // ✅ ساخت Schema Markup (JSON-LD) برای گوگل
    const faqItems = useMemo(
        () => [
            {
                question: 'چطور مسیر یادگیری مناسب خودم را انتخاب کنم؟',
                answer:
                    'با توجه به علاقه و هدف شغلی‌تان، از مسیرهای یادگیری آماده ما استفاده کنید یا مشاوره رایگان بگیرید تا بهترین گزینه را انتخاب کنید.'
            },
            {
                question: 'دوره‌ها پروژه‌محور هستند؟',
                answer:
                    'بله، هر دوره با تمرین و پروژه عملی طراحی شده تا مهارت شما برای ورود به بازار کار واقعی آماده شود.'
            },
            {
                question: 'آیا پس از دوره پشتیبانی دارید؟',
                answer:
                    'پشتیبانی منتورها و پاسخگویی به سوالات تا زمان یادگیری کامل در کنار شماست.'
            }
        ],
        []
    );

    const schemaMarkup = useMemo(() => {
        const baseUrl = getSiteBaseUrl();
        const schemas = [
            createOrganizationSchema(baseUrl),
            createWebSiteSchema(baseUrl),
            createBreadcrumbSchema([
                { name: 'خانه', item: buildCanonicalUrl('/') }
            ])
        ];

        if (categoryId && courses.length > 0) {
            schemas.push(
                createItemListSchema({
                    name: categoryTitle,
                    description: seoData.description,
                    items: courses.map((course) => ({
                        url: `${baseUrl}/course/${course.slug || course.id}`,
                        name: course.title
                    }))
                })
            );
        }

        if (!categoryId) {
            schemas.push(createFaqSchema(faqItems));
        }
        return schemas;
    }, [categoryId, categoryTitle, courses, faqItems, seoData.description]);

    return (
        <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">

            <SeoHead
                title={seoData.title}
                description={seoData.description}
                canonical={seoData.canonical}
                noIndex={seoData.noIndex}
                noFollow={seoData.noFollow}
                ogType={categoryId ? 'website' : 'business.business'}
                schemas={schemaMarkup}
            />

            {/* 1. HERO SECTION */}
            {!categoryId && (
                <section className="relative pt-10 pb-32 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl z-0 pointer-events-none">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[100px] animate-blob"></div>
                        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center max-w-5xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">تخفیف‌های ویژه پاییز شروع شد</span>
                            </div>

                            <h1 className="text-fluid-hero font-black text-slate-900 dark:text-white mb-8 leading-tight tracking-tighter animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
                                آموزش برنامه‌نویسی و مهارت‌های دیجیتال <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">با مسیرهای یادگیری پروژه‌محور</span>
                            </h1>

                            <p className="text-fluid-subtitle text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                                از صفر تا استخدام در حوزه برنامه‌نویسی و طراحی وب. دوره‌های تخصصی با تمرین عملی، منتورینگ و پشتیبانی واقعی.
                            </p>
                            <ul className="flex flex-col sm:flex-row justify-center gap-4 text-sm font-bold text-slate-600 dark:text-slate-300 mb-12">
                                <li className="flex items-center gap-2">
                                    <Sparkles size={16} className="text-amber-500" />
                                    پروژه واقعی برای رزومه
                                </li>
                                <li className="flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-emerald-500" />
                                    پشتیبانی منتور و رفع اشکال
                                </li>
                                <li className="flex items-center gap-2">
                                    <GraduationCap size={16} className="text-indigo-500" />
                                    مدرک معتبر و قابل استعلام
                                </li>
                            </ul>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                                <a href="#courses" className="w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                                    شروع یادگیری <ChevronLeft />
                                </a>
                                <button className="w-full sm:w-auto px-10 py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                                    <PlayCircle size={20} /> مشاوره رایگان
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none max-w-4xl mx-auto animate-in fade-in zoom-in duration-700 delay-500">
                                <StatBox value="+۲k" label="دانشجوی فعال" />
                                <StatBox value="+۵۰" label="دوره تخصصی" />
                                <StatBox value="+۴۰" label="استاد خبره" />
                                <StatBox value="۴.۸" label="امتیاز دوره" />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 2. POPULAR CATEGORIES */}
            {!categoryId && categories?.length > 0 && (
                <section className="py-24 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
                    <div className="container mx-auto px-4">
                        <SectionHeader title="مسیرهای یادگیری" subtitle="دسته‌بندی مورد علاقه خود را انتخاب کنید و متخصص شوید" icon={GraduationCap} />

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {Array.isArray(categories) && categories.slice(0, 6).map(cat => (
                                <div
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.slug)}
                                    className="cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 p-6 rounded-3xl text-center transition-all duration-300 group hover:-translate-y-1"
                                >
                                    <div className="w-16 h-16 mx-auto bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        <BookOpen size={24} />
                                    </div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">{cat.title}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">{cat.coursesCount} دوره آموزشی</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 3. COURSES GRID */}
            <section id="courses" className="py-24 container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        {categoryId ? (
                            <div className="flex items-center gap-4 animate-in slide-in-from-right-4 duration-500">
                                <div className="p-3 bg-indigo-600 rounded-xl text-white"><BookOpen size={24} /></div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">دوره‌های {categoryTitle || 'انتخابی'}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">نمایش دوره‌های تخصصی این بخش</p>
                                </div>
                                <button onClick={clearFilter} className="mr-auto flex items-center gap-1 text-sm font-bold text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl transition-colors">
                                    <X size={16} /> حذف فیلتر
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-3 text-sm tracking-wide uppercase"><Zap size={18} /><span>فرصت یادگیری</span></div>
                                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">جدیدترین دوره‌های آموزشی</h2>
                            </>
                        )}
                    </div>
                    {!categoryId && (
                        <a href="#" className="hidden md:flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:gap-3 group bg-slate-100 dark:bg-slate-800 px-6 py-3 rounded-xl">
                            مشاهده همه دوره‌ها <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </a>
                    )}
                </div>

                {loading ? (
                    <CourseGridSkeleton />
                ) : (
                    <>
                        {courses?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {Array.isArray(courses) && courses.map(course => <CourseCard key={course.id} course={course} />)}
                            </div>
                        ) : (
                            <div className="col-span-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-700 p-20 text-center">
                                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-6"><BookOpen size={48} /></div>
                                <h3 className="text-2xl font-black text-slate-700 dark:text-slate-200 mb-2">هیچ دوره‌ای یافت نشد!</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg">
                                    {categoryId ? 'در این دسته‌بندی هنوز دوره‌ای ثبت نشده است. لطفاً دسته‌بندی دیگری را امتحان کنید.' : 'در حال حاضر دوره‌ای برای نمایش وجود ندارد.'}
                                </p>
                                {categoryId && <button onClick={clearFilter} className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/30">بازگشت به همه دوره‌ها</button>}
                            </div>
                        )}

                        {/* Pagination */}
                        {courses.length > 0 && (
                            <div className="flex justify-center items-center gap-6 mt-16">
                                <Button onClick={handlePrevPage} disabled={page === 1} variant="secondary" className="!px-6"><ChevronRight size={20} /> صفحه قبل</Button>
                                <span className="font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">صفحه {page}</span>
                                <Button onClick={handleNextPage} disabled={!hasMore} variant="secondary" className="!px-6">صفحه بعد <ChevronLeft size={20} /></Button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* 4. INSTRUCTORS SECTION */}
            {!categoryId && instructors.length > 0 && (
                <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
                    <div className="container mx-auto px-4">
                        <SectionHeader title="مدرسین برتر" subtitle="با بهترین‌های هر حوزه یاد بگیرید و تجربه کسب کنید" icon={Users} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.isArray(instructors) && instructors.slice(0, 4).map(inst => (
                                <InstructorCard key={inst.id} instructor={inst} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 5. WHY US */}
            {!categoryId && (
                <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[120px] -mt-40 -mr-40 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[120px] -mb-40 -ml-40 pointer-events-none"></div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div className="order-2 lg:order-1">
                                <div className="inline-block px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-bold mb-8">
                                    چرا آکادمی پردیس توس؟
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1]">
                                    تفاوت ما در <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">کیفیت آموزش و پشتیبانی</span> است
                                </h2>
                                <p className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed max-w-xl">
                                    ما فقط ویدیو ضبط نمی‌کنیم؛ ما مسیر یادگیری شما را طراحی می‌کنیم. با پشتیبانی دائمی و پروژه‌های واقعی، فاصله شما تا بازار کار تنها یک قدم است.
                                </p>

                                <div className="space-y-8">
                                    {[
                                        { title: "پشتیبانی ۲۴/۷ منتورها", desc: "پاسخگویی به سوالات شما در کمتر از یک ساعت توسط تیم فنی" },
                                        { title: "مدرک معتبر بین‌المللی", desc: "ارائه مدرک رسمی فنی و حرفه‌ای، قابل ترجمه برای مهاجرت" },
                                        { title: "ضمانت بازگشت وجه", desc: "در صورت عدم رضایت از کیفیت دوره تا ۷ روز بدون قید و شرط" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-6 group">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                                <ShieldCheck size={28} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-xl mb-2 text-slate-100">{item.title}</h4>
                                                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="order-1 lg:order-2 relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-[3rem] rotate-6 opacity-30 blur-3xl"></div>
                                <div className="relative bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-8 md:p-12 rounded-[3rem] shadow-2xl">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <FeatureItem icon={Award} title="مدرک معتبر" desc="گواهینامه رسمی فنی و حرفه‌ای" color="bg-gradient-to-br from-amber-400 to-orange-500" />
                                        <FeatureItem icon={Users} title="جامعه فعال" desc="دسترسی به انجمن پرسش و پاسخ" color="bg-gradient-to-br from-blue-400 to-indigo-500" />
                                        <FeatureItem icon={Clock} title="آپدیت دائمی" desc="دسترسی همیشگی به نسخه جدید" color="bg-gradient-to-br from-emerald-400 to-teal-500" />
                                        <FeatureItem icon={ShieldCheck} title="تضمین کیفیت" desc="بررسی دقیق سرفصل‌ها" color="bg-gradient-to-br from-rose-400 to-pink-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 6. TESTIMONIALS */}
            {!categoryId && (
                <section className="py-32 bg-slate-50 dark:bg-slate-950">
                    <div className="container mx-auto px-4">
                        <SectionHeader title="دانشجویان ما چه می‌گویند؟" subtitle="بیش از ۱۰,۰۰۰ دانشجو به ما اعتماد کرده‌اند و مسیر شغلی خود را تغییر داده‌اند" icon={MessageSquare} />

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            <TestimonialCard
                                name="سارا احمدی"
                                role="توسعه‌دهنده فرانت‌اند"
                                text="دوره ریکت استاد واقعاً دید من رو عوض کرد. الان توی یک شرکت معتبر مشغول به کارم و همش رو مدیون این دوره هستم. سبک تدریس فوق‌العاده بود."
                                image="https://i.pravatar.cc/150?img=5"
                            />
                            <TestimonialCard
                                name="محمد رضاپور"
                                role="برنامه‌نویس PHP"
                                text="پشتیبانی عالی بود. هر سوالی داشتم سریع جواب می‌دادند. پروژه‌های دوره هم خیلی به درد بخور و واقعی بود و باعث شد ترسم از کدنویسی بریزه."
                                image="https://i.pravatar.cc/150?img=11"
                            />
                            <TestimonialCard
                                name="الناز حسینی"
                                role="فریلنسر"
                                text="بهترین سرمایه‌گذاری که روی خودم کردم. کیفیت صدا و تصویر عالی، سرفصل‌ها کامل و از همه مهم‌تر بیان شیوای استاد که پیچیده‌ترین مباحث رو ساده می‌گفت."
                                image="https://i.pravatar.cc/150?img=9"
                            />
                        </div>
                    </div>
                </section>
            )}

            {!categoryId && (
                <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <div className="container mx-auto px-4">
                        <SectionHeader
                            title="پرسش‌های پرتکرار کاربران"
                            subtitle="پاسخ‌های کوتاه و شفاف درباره مسیر یادگیری، پشتیبانی و کیفیت دوره‌ها"
                            icon={Layers}
                        />
                        <div className="grid md:grid-cols-3 gap-6">
                            {faqItems.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-700"
                                >
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">
                                        {faq.question}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 7. CTA */}
            {!categoryId && (
                <section className="py-24 container mx-auto px-4">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-indigo-500/30">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black opacity-20 rounded-full blur-[100px] -ml-20 -mb-20"></div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">هنوز برای شروع مردد هستید؟</h2>
                            <p className="text-indigo-100 text-xl mb-12 leading-relaxed">همین حالا با مشاوران ما تماس بگیرید تا بر اساس علاقه و بازار کار، بهترین مسیر یادگیری را به شما پیشنهاد دهند. مشاوره کاملاً رایگان است!</p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <button className="px-10 py-5 bg-white text-indigo-700 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl hover:-translate-y-1">دریافت مشاوره رایگان</button>
                                <button className="px-10 py-5 bg-indigo-800/50 backdrop-blur border border-indigo-400/30 text-white rounded-2xl font-bold text-lg hover:bg-indigo-800 transition-all flex items-center justify-center gap-3">
                                    <Phone size={20} /> 021-12345678
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

        </div>
    );
};

export default Home;
