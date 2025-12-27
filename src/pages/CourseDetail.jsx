import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, User, Calendar, BookOpen, CheckCircle2, ShieldCheck, Share2, MessageCircle, ShoppingCart, PlayCircle, AlertTriangle, ChevronLeft, Star, MonitorPlay, Check, Hourglass, Video, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { getImageUrl, formatPrice, formatDate } from '../services/Libs';
import { Button, Badge } from '../components/UI';
import { APIErrorAlert, DuplicateEnrollmentAlert } from '../components/Alert';
import { useErrorHandler } from '../hooks/useErrorHandler';
import CourseComments from '../components/CourseComments';
import { useAlert } from '../hooks/useAlert';
import SeoHead from '../components/Seo/SeoHead';
import { generateSEOConfig } from '../utils/seoHelpers';



const CourseDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const alert = useAlert();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [checkingEnrollment, setCheckingEnrollment] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);

    const { handleError, clearError } = useErrorHandler();

    useEffect(() => {
        const fetchCourse = async () => {
            setLoading(true);
            setApiError(null);
            try {
                const response = await api.get('/courses');

                let allCourses = response.data?.data || response.data || [];
                if (!Array.isArray(allCourses)) {
                    allCourses = [];
                }

                const foundCourse = allCourses.find(c => c.slug === slug);

                if (foundCourse) {
                    setCourse(foundCourse);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error(err);
                setApiError(err);
                handleError(err, false); // Don't show toast, we'll show alert instead
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [slug]);

    // بررسی وضعیت ثبت‌نام کاربر
    useEffect(() => {
        const checkEnrollment = async () => {
            const token = localStorage.getItem('token');
            if (!token || !course) return;

            setCheckingEnrollment(true);
            try {
                // بررسی ثبت‌نام از طریق API
                const response = await api.get(`/courses/${course.id}/enrollment-status`);
                setIsEnrolled(response.data?.isEnrolled || false);
            } catch (error) {
                // اگر API موجود نیست، از روش دیگری استفاده کنیم
                try {
                    const userCoursesResponse = await api.get('/Courses/my-enrollments');
                    const userCourses = userCoursesResponse.data?.data || [];
                    const enrolled = userCourses.some(userCourse =>
                        userCourse.courseId === course.id ||
                        userCourse.course?.id === course.id ||
                        userCourse.id === course.id
                    );
                    setIsEnrolled(enrolled);

                    if (enrolled) {
                        setShowDuplicateAlert(true);
                    }
                } catch (fallbackError) {
                    console.error('Error checking enrollment:', fallbackError);
                    setIsEnrolled(false);
                }
            } finally {
                setCheckingEnrollment(false);
            }
        };

        checkEnrollment();
    }, [course]);

    // ✅ تابع اشتراک‌گذاری اصلاح شده (با پشتیبانی کامل)
    const handleShare = () => {
        const url = window.location.href;

        // روش پشتیبان برای محیط‌هایی که clipboard API کار نمی‌کند (مثل IFrame یا HTTP)
        const copyFallback = (text) => {
            try {
                const textArea = document.createElement("textarea");
                textArea.value = text;

                // مخفی کردن textarea از دید کاربر
                textArea.style.position = "fixed";
                textArea.style.left = "0";
                textArea.style.top = "0";
                textArea.style.opacity = "0";

                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (successful) {
                    alert.showSuccess('لینک دوره کپی شد! آماده اشتراک‌گذاری 🔗');
                } else {
                    alert.showError('کپی نشد. لطفاً لینک را دستی کپی کنید.');
                }
            } catch (err) {
                console.error('Copy failed', err);
                alert.showError('خطا در کپی لینک');
            }
        };

        // تلاش اول: استفاده از API مدرن
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url)
                .then(() => {
                    alert.showSuccess('لینک دوره کپی شد! آماده اشتراک‌گذاری 🔗');
                })
                .catch(() => {
                    // اگر خطا داد، از روش قدیمی استفاده کن
                    copyFallback(url);
                });
        } else {
            // اگر API مدرن نبود، مستقیم از روش قدیمی استفاده کن
            copyFallback(url);
        }
    };

    // ✅ تابع درخواست مشاوره (ماک)
    const handleConsultation = () => {
        alert.showSuccess('درخواست مشاوره ثبت شد. کارشناسان ما به زودی تماس می‌گیرند 📞', {
            duration: 4000
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-center px-4">
                <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mb-6 animate-bounce">
                    <AlertTriangle size={40} />
                </div>
                <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">دوره مورد نظر یافت نشد!</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">ممکن است دوره حذف شده باشد یا آدرس را اشتباه وارد کرده باشید.</p>
                <Button onClick={() => navigate('/')} className="shadow-lg shadow-indigo-500/20">بازگشت به صفحه اصلی</Button>
            </div>
        );
    }

    const instructorName = course.instructor?.fullName || course.instructor?.name || 'مدرس ناشناس';
    const categoryTitle = course.category?.title || 'عمومی';
    const price = formatPrice(course.price);

    const sections = course.sections ? [...course.sections].sort((a, b) => a.order - b.order) : [];

    // SEO Configuration - using non-hook approach to avoid React issues
    const seoConfig = generateSEOConfig({
        seoData: course?.seo,
        fallbackTitle: course?.title,
        fallbackDescription: course?.description,
        currentUrl: `/course/${slug}`,
    });

    // Structured Data for Course - simplified approach
    const courseStructuredData = course ? {
        "@context": "https://schema.org",
        "@type": "Course",
        name: course.title,
        description: course.description,
        provider: {
            "@type": "Organization",
            name: "آکادمی پردیس توس",
        },
        courseMode: "online",
        inLanguage: "fa",
    } : null;

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] font-sans transition-colors duration-300 pb-20">
            {/* SEO Head */}
            <SeoHead
                title={seoConfig.title}
                description={seoConfig.description}
                canonicalUrl={seoConfig.canonicalUrl}
                noIndex={seoConfig.noIndex}
                noFollow={seoConfig.noFollow}
                ogType="article"
                ogImage={course?.thumbnail ? getImageUrl(course.thumbnail) : undefined}
                structuredData={courseStructuredData}
            />


            {/* Error Alerts */}
            {apiError && (
                <div className="fixed top-24 left-4 right-4 z-50 max-w-md mx-auto">
                    <APIErrorAlert
                        error={apiError}
                        onRetry={() => {
                            setApiError(null);
                            clearError();
                            window.location.reload();
                        }}
                        onClose={() => {
                            setApiError(null);
                            clearError();
                        }}
                    />
                </div>
            )}

            {showDuplicateAlert && (
                <div className="fixed top-24 left-4 right-4 z-50 max-w-md mx-auto">
                    <DuplicateEnrollmentAlert
                        courseName={course?.title}
                        onViewProfile={() => {
                            navigate('/profile?tab=courses');
                            setShowDuplicateAlert(false);
                        }}
                        onClose={() => setShowDuplicateAlert(false)}
                    />
                </div>
            )}

            {/* --- HERO SECTION --- */}
            <div className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-50/80 to-transparent dark:from-slate-900 dark:to-[#020617]"></div>
                    <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
                    <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[100px] rounded-full"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <Link to="/" className="hover:text-primary transition-colors">خانه</Link>
                        <ChevronLeft size={12} />
                        {course.category?.slug ? (
                            <Link to={`/category/${course.category.slug}`} className="hover:text-primary transition-colors">{categoryTitle}</Link>
                        ) : (
                            <span>{categoryTitle}</span>
                        )}
                        <ChevronLeft size={12} />
                        <span className="text-slate-800 dark:text-slate-200 line-clamp-1">{course.title}</span>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-7 space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                <BookOpen size={14} />
                                <span>{categoryTitle}</span>
                            </div>

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                                {course.title}
                            </h1>

                            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                                {course.seo?.metaDescription || 'با یادگیری این دوره، مهارت‌های خود را حرفه‌ای کنید و با پروژه‌های واقعی آماده ورود به بازار کار شوید.'}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-white dark:border-slate-600 shadow-sm">
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
                                            {instructorName.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">مدرس دوره</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{instructorName}</p>
                                    </div>
                                </div>

                                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-lg">
                                        <Star size={20} fill="currentColor" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">امتیاز</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">۴.۸ از ۵</p>
                                    </div>
                                </div>

                                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-lg">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">آخرین آپدیت</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            {formatDate(course.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 relative group animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
                            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-purple-600 rounded-[2.5rem] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 aspect-video">
                                <img
                                    src={getImageUrl(course.thumbnail) || "https://placehold.co/600x400/1e1b4b/FFF?text=Pardis+Academy"}
                                    alt={`تصویر دوره ${course.title}`}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    loading="eager"
                                    fetchpriority="high"
                                    width="960"
                                    height="540"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors cursor-pointer">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 text-white shadow-xl group-hover:scale-110 transition-transform">
                                        <PlayCircle size={40} fill="currentColor" className="opacity-90" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT & SIDEBAR --- */}
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* RIGHT COLUMN: CONTENT */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* About Course */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-primary">
                                    <BookOpen size={24} />
                                </div>
                                درباره این دوره
                            </h2>
                            <div
                                className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-2xl"
                                dangerouslySetInnerHTML={{ __html: course.description }}
                            ></div>
                        </div>

                        {/* ✅ Syllabus (سرفصل‌های واقعی) */}
                        {sections.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-slate-800 flex items-center justify-center text-emerald-500">
                                        <MonitorPlay size={24} />
                                    </div>
                                    سرفصل‌های دوره
                                </h2>
                                <div className="space-y-4">
                                    {Array.isArray(sections) && sections.map((section, index) => (
                                        <div key={section.id} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 flex flex-col gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-sm border border-slate-200 dark:border-slate-600">
                                                            {index + 1}
                                                        </span>
                                                        <span className="font-bold text-lg text-slate-700 dark:text-slate-200">
                                                            {section.title}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                                        <CheckCircle2 size={14} /> مشاهده
                                                    </span>
                                                </div>

                                                {/* نمایش توضیحات فصل (در صورت وجود) */}
                                                {section.description && (
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 pr-11 leading-relaxed border-t border-slate-200/50 dark:border-slate-700/50 mt-2 pt-2">
                                                        {section.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Course Comments Section */}
                        <CourseComments courseId={course.id} courseName={course.title} />

                    </div>

                    {/* LEFT COLUMN: STICKY SIDEBAR */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-6">

                            {/* Price Card */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-primary to-purple-500"></div>

                                <div className="flex items-center justify-between mb-6 mt-2">
                                    <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">قیمت دوره:</span>
                                    {course.price === 0 ? (
                                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">رایگان!</span>
                                    ) : (
                                        <div className="flex items-end gap-1">
                                            <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{price}</span>
                                            <span className="text-xs font-bold text-slate-400 mb-1.5">تومان</span>
                                        </div>
                                    )}
                                </div>

                                {/* اطلاعات برگزاری */}
                                {(course.startFrom || course.schedule || (course.schedules && course.schedules.length > 0)) && (
                                    <div className="mb-6 space-y-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                        {course.startFrom && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium">
                                                    <Calendar size={16} className="text-primary" /> شروع دوره:
                                                </span>
                                                <span className="font-bold text-slate-700 dark:text-white dir-ltr">{course.startFrom}</span>
                                            </div>
                                        )}

                                        {/* نمایش زمان‌بندی‌های دقیق */}
                                        {course.schedules && course.schedules.length > 0 ? (
                                            <div className="space-y-2">
                                                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium text-sm">
                                                    <Clock size={16} className="text-primary" /> زمان‌بندی کلاس‌ها:
                                                </span>
                                                <div className="space-y-1">
                                                    {Array.isArray(course.schedules) && course.schedules.slice(0, 3).map((schedule, index) => (
                                                        <div key={index} className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 p-2 rounded-lg">
                                                            <span className="font-bold text-slate-700 dark:text-slate-200">{schedule.fullScheduleText}</span>
                                                            <span className="text-slate-400">
                                                                {schedule.enrolledCount}/{schedule.maxCapacity} نفر
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {course.schedules.length > 3 && (
                                                        <div className="text-xs text-slate-400 text-center">
                                                            و {course.schedules.length - 3} زمان‌بندی دیگر...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : course.schedule && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium">
                                                    <Clock size={16} className="text-primary" /> زمان‌بندی:
                                                </span>
                                                <span className="font-bold text-slate-700 dark:text-white max-w-[50%] text-left truncate" title={course.schedule}>{course.schedule}</span>
                                            </div>
                                        )}

                                        <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-700 flex justify-center">
                                            {course.isCompleted ? (
                                                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                                                    <CheckCircle2 size={14} /> دوره تکمیل شده است
                                                </span>
                                            ) : course.isStarted ? (
                                                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full">
                                                    <PlayCircle size={14} /> دوره در حال برگزاری است
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                                                    <Hourglass size={14} /> در انتظار شروع
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* دکمه ورود به کلاس (برای کسانی که ثبت‌نام کرده‌اند) */}
                                {course.isStarted && (
                                    <Button
                                        className="w-full !py-4 !text-lg !rounded-2xl shadow-xl shadow-sky-500/20 mb-4 hover:-translate-y-1 transition-transform bg-sky-600 hover:bg-sky-700"
                                        onClick={() => {
                                            const courseType = (course.type || 'Online').toLowerCase();
                                            if (courseType === 'online') {
                                                navigate(`/course/${course.slug}`);
                                            } else if (course.location) {
                                                window.open(course.location, '_blank');
                                            } else {
                                                alert.showError('لینک دسترسی در دسترس نیست');
                                            }
                                        }}
                                    >
                                        <Video className="ml-2" size={20} />
                                        ورود به کلاس
                                    </Button>
                                )}

                                {checkingEnrollment ? (
                                    <Button
                                        className="w-full !py-4 !text-lg !rounded-2xl shadow-xl shadow-slate-300/20 mb-4"
                                        disabled
                                    >
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2"></div>
                                        در حال بررسی...
                                    </Button>
                                ) : isEnrolled ? (
                                    <div className="space-y-3 mb-4">
                                        <div className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg font-bold rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center">
                                            <CheckCircle2 className="ml-2" size={20} />
                                            شما در این دوره ثبت‌نام کرده‌اید
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full !py-3 !text-base !rounded-xl"
                                            onClick={() => navigate('/profile?tab=courses')}
                                        >
                                            <BookOpen className="ml-2" size={18} />
                                            مشاهده در پنل کاربری
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        className="w-full !py-4 !text-lg !rounded-2xl shadow-xl shadow-primary/20 mb-4 hover:-translate-y-1 transition-transform"
                                        onClick={() => navigate(`/checkout/${course.slug}`)}
                                    >
                                        <ShoppingCart className="ml-2" size={20} />
                                        ثبت‌نام در دوره
                                    </Button>
                                )}

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                                        <CheckCircle2 size={16} className="text-emerald-500" /> دسترسی دائمی به ویدیوها
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                                        <CheckCircle2 size={16} className="text-emerald-500" /> پشتیبانی مستقیم استاد
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                                        <CheckCircle2 size={16} className="text-emerald-500" /> ضمانت بازگشت وجه
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                                        <CheckCircle2 size={16} className="text-emerald-500" /> دریافت گواهی پایان دوره
                                    </div>
                                </div>

                                {/* ✅ دکمه‌های جدید: مشاوره و اشتراک */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleConsultation}
                                        className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle size={16} /> مشاوره
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Share2 size={16} /> اشتراک
                                    </button>
                                </div>
                            </div>

                            {/* Teacher Card */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 overflow-hidden flex items-center justify-center">
                                    <span className="text-2xl font-black text-slate-400 dark:text-slate-500">{instructorName.charAt(0)}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-primary mb-0.5 block">مدرس دوره</span>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-lg">{instructorName}</h4>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
