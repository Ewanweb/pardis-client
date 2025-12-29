import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // ✅ اضافه شدن useLocation
import { ShoppingCart, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Wallet, ChevronRight, Clock, BookOpen, Receipt } from 'lucide-react';
import { apiClient } from '../services/api';
import { getImageUrl, formatPrice } from '../services/Libs';
import { Button } from '../components/UI';
import ScheduleSelector from '../components/ScheduleSelector';
import { DuplicateEnrollmentAlert } from '../components/Alert';
import { startZarinpalPayment, simulatePayment } from '../services/zarinpal';
import { useAlert } from '../hooks/useAlert';
import Seo from '../components/Seo';
import SeoHead from '../components/Seo/SeoHead';
import { buildCanonicalUrl } from '../utils/seo';

import { useAuth } from '../context/AuthContext';


const Checkout = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const { user } = useAuth();

    // دریافت اطلاعات دوره از state (اگر از صفحه قبل آمده باشد) یا مقدار اولیه null
    const [course, setCourse] = useState(state?.course || null);
    // اگر دوره در state نبود، لودینگ را فعال کن تا فچ شود
    const [loading, setLoading] = useState(!state?.course);

    // اگر دوره schedules نداشت، مستقیماً از step 2 شروع کن
    const [step, setStep] = useState(1); // 1: Schedule, 2: Review, 3: Payment, 4: Success
    const [paymentMethod, setPaymentMethod] = useState('gateway');
    const [paymentMode, setPaymentMode] = useState('test'); // 'test' or 'real'
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedScheduleId, setSelectedScheduleId] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [checkingEnrollment, setCheckingEnrollment] = useState(false);
    const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);

    const alert = useAlert();

    // اگر دوره در state نبود (مثلا کاربر لینک مستقیم زده)، آن را فچ کن
    useEffect(() => {
        if (!course) {
            const fetchCourse = async () => {
                try {
                    const result = await apiClient.get('/courses', {
                        showErrorAlert: true
                    });

                    if (result.success) {
                        const allCourses = result.data || [];
                        const foundCourse = allCourses.find(c => c.slug === slug);

                        if (foundCourse) {
                            // schedules همیشه خالی است در /courses endpoint
                            // برای checkout، اگر schedules خالی باشد، مرحله انتخاب زمان‌بندی را رد کن
                            if (!foundCourse.schedules || foundCourse.schedules.length === 0) {
                                foundCourse.schedules = [];
                            }

                            setCourse(foundCourse);
                        } else {
                            alert.showNotFoundError('دوره');
                            navigate('/');
                        }
                    }
                } finally {
                    setLoading(false);
                }
            };
            fetchCourse();
        }
    }, [slug, navigate, course]);

    // چک کردن وضعیت لاگین
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token && !loading) {
            alert.showWarning('لطفاً برای ثبت‌نام ابتدا وارد شوید');
            // میتوانید کاربر را به لاگین هدایت کنید
        }
    }, [loading, alert]);

    // بررسی وضعیت ثبت‌نام کاربر
    useEffect(() => {
        const checkEnrollment = async () => {
            const token = localStorage.getItem('token');
            if (!token || !course) return;

            setCheckingEnrollment(true);
            try {
                // بررسی ثبت‌نام از طریق API
                const result = await apiClient.get(`/courses/${course.id}/enrollment-status`, {
                    showErrorAlert: false
                });

                if (result.success) {
                    const enrolled = result.data?.isEnrolled || false;

                    if (enrolled) {
                        setIsEnrolled(true);
                        setShowDuplicateAlert(true);
                        // هدایت به صفحه پروفایل
                        setTimeout(() => {
                            navigate('/profile?tab=courses', { replace: true });
                        }, 3000);
                    }
                } else {
                    // اگر API موجود نیست، از روش دیگری استفاده کنیم
                    try {
                        const userCoursesResult = await apiClient.get('/user/courses', {
                            showErrorAlert: false
                        });

                        if (userCoursesResult.success) {
                            const userCourses = userCoursesResult.data || [];
                            const enrolled = userCourses.some(userCourse =>
                                userCourse.courseId === course.id ||
                                userCourse.course?.id === course.id ||
                                userCourse.id === course.id
                            );

                            if (enrolled) {
                                setIsEnrolled(true);
                                setShowDuplicateAlert(true);
                                setTimeout(() => {
                                    navigate('/profile?tab=courses', { replace: true });
                                }, 3000);
                            }
                        }
                    } catch (fallbackError) {
                        console.error('Error checking enrollment:', fallbackError);
                    }
                }
            } finally {
                setCheckingEnrollment(false);
            }
        };

        checkEnrollment();
    }, [course, navigate]);

    // اگر دوره schedules نداشت، مستقیماً به step 2 برو
    useEffect(() => {
        if (course && (!course.schedules || course.schedules.length === 0)) {
            if (step === 1) {
                setStep(2);
            }
        }
    }, [course, step]);

    // ✅ تابع اصلی پرداخت و ثبت‌نام
    const handlePayment = async () => {
        // 1. بررسی لاگین بودن
        if (!localStorage.getItem('token')) {
            return alert.showUnauthorizedError();
        }

        setIsProcessing(true);
        try {
            const price = Number(course.price);

            // اگر دوره رایگان است، مستقیماً ثبت‌نام کن
            if (price === 0) {
                await enrollUser();
                return;
            }

            // برای دوره‌های پولی، پرداخت انجام بده
            if (paymentMethod === 'gateway') {
                await handleGatewayPayment();
            } else if (paymentMethod === 'wallet') {
                alert.showError('کیف پول هنوز پیاده‌سازی نشده است');
                setIsProcessing(false);
            } else if (paymentMethod === 'manual') {
                await handleManualPayment();
            }

        } catch (error) {
            console.error("Payment Error:", error);
            setIsProcessing(false);
        }
    };

    // تابع پرداخت دستی
    const handleManualPayment = async () => {
        try {
            const price = Number(course.price);

            // ایجاد درخواست پرداخت دستی
            const result = await apiClient.post(`/payments/courses/${course.id}/purchase/manual`, {
                amount: price
            });

            if (result.success) {
                // هدایت به صفحه آپلود رسید
                navigate(`/payment/manual/${result.data.id}`, {
                    state: {
                        paymentRequest: result.data,
                        course: course
                    }
                });
            } else {
                throw new Error(result.message || 'خطا در ایجاد درخواست پرداخت دستی');
            }

        } catch (error) {
            console.error('Manual payment error:', error);
            alert.showError(error.response?.data?.message || error.message || 'خطا در ایجاد درخواست پرداخت دستی');
            throw error;
        }
    };

    // تابع پرداخت از طریق درگاه
    const handleGatewayPayment = async () => {
        try {
            const price = Number(course.price);
            const paymentData = {
                amount: price,
                description: `خرید دوره ${course.title}`,
                email: user?.email || '',
                mobile: user?.mobile || '',
                courseName: course.title,
                courseId: course.id,
                scheduleId: selectedScheduleId
            };

            // ذخیره اطلاعات پرداخت برای callback
            localStorage.setItem('pendingPayment', JSON.stringify(paymentData));

            if (paymentMode === 'test') {
                // حالت تست - شبیه‌سازی پرداخت
                const loadingId = alert.showLoading('در حال شبیه‌سازی پرداخت...');

                try {
                    const result = await simulatePayment(paymentData);
                    alert.dismiss(loadingId);

                    if (result.success) {
                        await enrollUser();
                        alert.showSuccess('پرداخت تستی موفق بود! 🎉');
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error) {
                    alert.dismiss(loadingId);
                    throw error;
                }
            } else {
                // حالت واقعی - اتصال به زرین‌پال
                const result = await startZarinpalPayment(paymentData);

                if (result.success) {
                    // هدایت به درگاه زرین‌پال
                    window.location.href = result.gatewayUrl;
                } else {
                    throw new Error('خطا در اتصال به درگاه پرداخت');
                }
            }

        } catch (error) {
            console.error('Gateway payment error:', error);
            throw error;
        }
    };

    // تابع ثبت‌نام کاربر
    const enrollUser = async () => {
        try {
            let result;
            if (selectedScheduleId) {
                // ثبت‌نام در زمان‌بندی خاص
                result = await apiClient.post(`/courses/${course.id}/schedules/${selectedScheduleId}/enroll`, {}, {
                    successMessage: 'ثبت‌نام با موفقیت انجام شد! 🎉'
                });
            } else {
                // ثبت‌نام عادی (برای دوره‌های بدون زمان‌بندی)
                result = await apiClient.post(`/courses/${course.id}/enroll`, {}, {
                    successMessage: 'ثبت‌نام با موفقیت انجام شد! 🎉'
                });
            }

            if (result.success) {
                // رفتن به مرحله موفقیت
                setStep(4);
                localStorage.removeItem('pendingPayment');
            } else {
                // اگر قبلا ثبت نام کرده باشد، پیام مناسب بده و برو مرحله بعد (چون موفق محسوب میشه)
                setShowDuplicateAlert(true);
                setStep(4);
            }

        } catch (error) {
            // Error handling is done automatically by apiClient
            console.error('Enrollment error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading || checkingEnrollment) return (
        <div className="min-h-screen flex items-center justify-center pt-20 bg-slate-50 dark:bg-slate-950">
            <div className="text-center">
                <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">
                    {loading ? 'در حال بارگذاری دوره...' : 'در حال بررسی وضعیت ثبت‌نام...'}
                </p>
            </div>
        </div>
    );

    if (!course) return null;
    const canonicalUrl = buildCanonicalUrl(`/checkout/${course.slug || course.id}`);

    // اگر کاربر قبلاً ثبت‌نام کرده، صفحه خاصی نمایش بده
    if (isEnrolled) {
        return (
            <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
                <Seo
                    title={`قبلاً ثبت‌نام شده | ${course.title}`}
                    description={`شما قبلاً در دوره ${course.title} ثبت‌نام کرده‌اید و می‌توانید از پنل کاربری به دوره دسترسی داشته باشید.`}
                    noIndex
                />

                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">شما قبلاً ثبت‌نام کرده‌اید!</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                            شما قبلاً در دوره <strong>{course.title}</strong> ثبت‌نام کرده‌اید. می‌توانید از پنل کاربری خود به دوره دسترسی داشته باشید.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button onClick={() => navigate('/profile?tab=courses')} variant="primary">
                                <BookOpen className="ml-2" size={18} />
                                مشاهده در پنل کاربری
                            </Button>
                            <Button onClick={() => navigate('/')} variant="outline">
                                بازگشت به صفحه اصلی
                            </Button>
                        </div>
                    </div>
                </div>
            </div >
        );
    }

    const price = Number(course.price);

    return (
        <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
            <SeoHead
                title={`تکمیل ثبت‌نام | ${course.title}`}
                description={`تکمیل ثبت‌نام دوره ${course.title} در آکادمی پردیس توس.`}
                canonical={canonicalUrl}
                noIndex
                noFollow
            />

            {/* Duplicate Enrollment Alert */}
            {
                showDuplicateAlert && (
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
                )
            }

            <div className="container mx-auto px-4 max-w-4xl">

                {/* Stepper Header */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${step >= 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-200 text-slate-500'}`}>
                            <span className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-full text-xs font-bold">1</span>
                            <span className="text-sm font-bold">زمان‌بندی</span>
                        </div>
                        <div className={`w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full ${step >= 2 ? 'bg-indigo-600' : ''}`}></div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${step >= 2 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                            <span className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-full text-xs font-bold">2</span>
                            <span className="text-sm font-bold">بازبینی</span>
                        </div>
                        <div className={`w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full ${step >= 3 ? 'bg-indigo-600' : ''}`}></div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${step >= 3 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                            <span className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-full text-xs font-bold">3</span>
                            <span className="text-sm font-bold">پرداخت</span>
                        </div>
                        <div className={`w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full ${step >= 4 ? 'bg-indigo-600' : ''}`}></div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${step >= 4 ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                            <span className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-full text-xs font-bold">4</span>
                            <span className="text-sm font-bold">پایان</span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Step 1: Schedule Selection */}
                        {step === 1 && (
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-right-8 duration-500">
                                <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <Clock className="text-indigo-500" /> انتخاب زمان‌بندی
                                </h2>

                                <div className="flex gap-4 mb-6">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                                        <img
                                            src={getImageUrl(course.thumbnail)}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.src = "https://placehold.co/600x400/1e1b4b/FFF?text=Error"}
                                        />
                                    </div>
                                    <div className="flex-1 py-1">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 line-clamp-2">{course.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">مدرس: {course.instructor?.fullName || course.instructor?.name || 'نامشخص'}</p>
                                        <p className="text-xs text-slate-400 mt-1">نوع دوره: {course.type || 'نامشخص'}</p>
                                        {course.location && (
                                            <p className="text-xs text-slate-400">محل برگزاری: {course.location}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Schedule Selector Component */}
                                <ScheduleSelector
                                    schedules={course.schedules || []}
                                    onScheduleSelect={setSelectedScheduleId}
                                    selectedScheduleId={selectedScheduleId}
                                    loading={loading}
                                />
                            </div>
                        )}

                        {/* Step 2: Review */}
                        {step === 2 && (
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-right-8 duration-500">
                                <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <ShoppingCart className="text-indigo-500" /> جزئیات سفارش
                                </h2>

                                <div className="flex gap-4 mb-6">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                                        <img
                                            src={getImageUrl(course.thumbnail)}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.src = "https://placehold.co/600x400/1e1b4b/FFF?text=Error"}
                                        />
                                    </div>
                                    <div className="flex-1 py-1">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 line-clamp-2">{course.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">مدرس: {course.instructor?.fullName || course.instructor?.name || 'نامشخص'}</p>

                                        {/* نمایش زمان‌بندی انتخاب شده */}
                                        {selectedScheduleId && course.schedules && (
                                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                                                زمان‌بندی: {course.schedules.find(s => s.id === selectedScheduleId)?.fullScheduleText || 'انتخاب شده'}
                                            </p>
                                        )}

                                        <div className="mt-auto pt-2">
                                            {price === 0 ? (
                                                <span className="text-emerald-500 font-black text-lg">رایگان</span>
                                            ) : (
                                                <span className="text-slate-800 dark:text-white font-black">{formatPrice(price)} <span className="text-xs font-medium text-slate-400">تومان</span></span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-center mb-3 text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">قیمت اصلی</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-200">{formatPrice(price)} تومان</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-3 text-sm text-emerald-500">
                                        <span>تخفیف</span>
                                        <span className="font-bold">0 تومان</span>
                                    </div>
                                    <div className="border-t border-slate-200 dark:border-slate-700 my-3"></div>
                                    <div className="flex justify-between items-center text-lg">
                                        <span className="font-black text-slate-800 dark:text-white">مبلغ قابل پرداخت</span>
                                        <span className="font-black text-indigo-600 dark:text-indigo-400">{formatPrice(price)} تومان</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment Method */}
                        {step === 3 && (
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-right-8 duration-500">
                                <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <CreditCard className="text-indigo-500" /> انتخاب روش پرداخت
                                </h2>

                                <div className="space-y-4">
                                    {/* Payment Method Selection */}
                                    <div className="space-y-3">
                                        <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'gateway' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-200'}`}>
                                            <input type="radio" name="payment" value="gateway" checked={paymentMethod === 'gateway'} onChange={() => setPaymentMethod('gateway')} className="w-5 h-5 accent-indigo-600" />
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><CreditCard size={24} className="text-indigo-600" /></div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white">پرداخت آنلاین (زرین‌پال)</p>
                                                <p className="text-xs text-slate-500">پرداخت با کلیه کارت‌های عضو شتاب</p>
                                            </div>
                                        </label>

                                        <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'wallet' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-200'}`}>
                                            <input type="radio" name="payment" value="wallet" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="w-5 h-5 accent-indigo-600" />
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><Wallet size={24} className="text-emerald-500" /></div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white">کیف پول حساب کاربری</p>
                                                <p className="text-xs text-slate-500">موجودی فعلی: ۰ تومان</p>
                                            </div>
                                        </label>

                                        <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'manual' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-orange-200'}`}>
                                            <input type="radio" name="payment" value="manual" checked={paymentMethod === 'manual'} onChange={() => setPaymentMethod('manual')} className="w-5 h-5 accent-orange-600" />
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><Receipt size={24} className="text-orange-500" /></div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white">پرداخت کارت به کارت</p>
                                                <p className="text-xs text-slate-500">واریز به حساب و آپلود رسید</p>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Payment Mode Selection (only for gateway) */}
                                    {paymentMethod === 'gateway' && (
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                                            <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-3 text-sm">حالت پرداخت:</h3>
                                            <div className="space-y-2">
                                                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMode === 'test' ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>
                                                    <input type="radio" name="paymentMode" value="test" checked={paymentMode === 'test'} onChange={() => setPaymentMode('test')} className="w-4 h-4 accent-amber-500" />
                                                    <div>
                                                        <p className="font-medium text-slate-800 dark:text-white text-sm">حالت تست (شبیه‌سازی)</p>
                                                        <p className="text-xs text-slate-500">برای تست بدون پرداخت واقعی</p>
                                                    </div>
                                                </label>
                                                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMode === 'real' ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>
                                                    <input type="radio" name="paymentMode" value="real" checked={paymentMode === 'real'} onChange={() => setPaymentMode('real')} className="w-4 h-4 accent-green-500" />
                                                    <div>
                                                        <p className="font-medium text-slate-800 dark:text-white text-sm">حالت واقعی (زرین‌پال)</p>
                                                        <p className="text-xs text-slate-500">اتصال به درگاه واقعی زرین‌پال</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Success */}
                        {step === 4 && (
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm text-center animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400 animate-bounce">
                                    <CheckCircle2 size={48} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">ثبت‌نام موفقیت‌آمیز بود!</h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                                    تبریک می‌گوییم! شما اکنون دانشجوی دوره <strong>{course.title}</strong> هستید. دسترسی شما به محتوای دوره فعال شد.
                                </p>
                                <div className="flex justify-center gap-4">
                                    {/* ✅ دکمه هدایت به تب دوره‌های من */}
                                    <Button onClick={() => navigate('/profile?tab=courses')} variant="outline">مشاهده در پنل کاربری</Button>
                                    <Button onClick={() => navigate(`/courses/${slug}`)}>شروع یادگیری</Button>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Sidebar Summary (Sticky) */}
                    {step < 4 && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-28 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-lg">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">خلاصه صورت‌حساب</h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                                        <span>مبلغ کل</span>
                                        <span>{formatPrice(price)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                                        <span>مالیات (۰٪)</span>
                                        <span>۰</span>
                                    </div>
                                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between font-black text-lg text-slate-800 dark:text-white">
                                        <span>مجموع</span>
                                        <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(price)} تومان</span>
                                    </div>
                                </div>

                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl mb-6">
                                    <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed flex items-start gap-2">
                                        <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                                        خرید شما شامل ضمانت بازگشت وجه ۷ روزه و پشتیبانی دائمی می‌باشد.
                                    </p>
                                </div>

                                {step === 1 ? (
                                    <Button
                                        onClick={() => setStep(2)}
                                        disabled={!selectedScheduleId && course.schedules && course.schedules.length > 0}
                                        className="w-full !py-3.5 !rounded-xl shadow-xl shadow-indigo-500/20"
                                    >
                                        ادامه به بازبینی <ChevronRight size={18} />
                                    </Button>
                                ) : step === 2 ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => setStep(1)} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <ArrowLeft size={20} />
                                        </button>
                                        <Button onClick={() => setStep(3)} className="flex-1 !py-3.5 !rounded-xl shadow-xl shadow-indigo-500/20">
                                            ادامه به پرداخت <ChevronRight size={18} />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={() => setStep(2)} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <ArrowLeft size={20} />
                                        </button>
                                        <Button onClick={handlePayment} disabled={isProcessing} className="flex-1 !py-3.5 !rounded-xl shadow-xl shadow-indigo-500/20">
                                            {isProcessing ? 'در حال اتصال...' : 'پرداخت و تکمیل خرید'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div >
    );
};
export default Checkout;
