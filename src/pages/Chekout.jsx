import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // ✅ اضافه شدن useLocation
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Wallet, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { getImageUrl, formatPrice } from '../services/Libs';
import { Button } from '../components/UI';
import toast, { Toaster } from 'react-hot-toast';

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

    const [step, setStep] = useState(1); // 1: Review, 2: Payment, 3: Success
    const [paymentMethod, setPaymentMethod] = useState('gateway');
    const [isProcessing, setIsProcessing] = useState(false);

    // اگر دوره در state نبود (مثلا کاربر لینک مستقیم زده)، آن را فچ کن
    useEffect(() => {
        if (!course) {
            const fetchCourse = async () => {
                try {
                    const response = await api.get('/courses');
                    const allCourses = response.data?.data || response.data || [];
                    const foundCourse = allCourses.find(c => c.slug === slug);

                    if (foundCourse) {
                        setCourse(foundCourse);
                    } else {
                        toast.error('دوره یافت نشد');
                        navigate('/');
                    }
                } catch (error) {
                    console.error(error);
                    toast.error('خطا در دریافت اطلاعات');
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
            toast('لطفاً برای ثبت‌نام ابتدا وارد شوید', { icon: '🔒' });
            // میتوانید کاربر را به لاگین هدایت کنید
        }
    }, [loading]);

    // ✅ تابع اصلی پرداخت و ثبت‌نام
    const handlePayment = async () => {
        // 1. بررسی لاگین بودن
        if (!localStorage.getItem('token')) {
            return toast.error('لطفاً ابتدا وارد شوید');
        }

        setIsProcessing(true);
        try {
            // شبیه‌سازی تاخیر درگاه بانکی (برای UX بهتر)
            await new Promise(r => setTimeout(r, 2000));

            // 2. ✅ ارسال درخواست ثبت‌نام به سرور
            // این درخواست رکورد UserCourse را در دیتابیس می‌سازد
            await api.post(`/courses/${course.id}/enroll`);

            // 3. رفتن به مرحله موفقیت
            setStep(3);
            toast.success('ثبت‌نام با موفقیت انجام شد! 🎉');

        } catch (error) {
            console.error("Enrollment Error:", error);

            // مدیریت خطاها
            if (error.response && (error.response.status === 400 || error.response.status === 409)) {
                // اگر قبلا ثبت نام کرده باشد، پیام مناسب بده و برو مرحله بعد (چون موفق محسوب میشه)
                toast.success('شما قبلاً در این دوره عضو بودید.');
                setStep(3);
            } else {
                toast.error('خطا در پرداخت یا ثبت‌نام. لطفا مجدد تلاش کنید.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center pt-20 bg-slate-50 dark:bg-slate-950">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
    );

    if (!course) return null;

    const price = Number(course.price);

    return (
        <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
            <Toaster position="top-center" />
            <Helmet>
                <title>تکمیل ثبت‌نام | {course.title}</title>
            </Helmet>

            <div className="container mx-auto px-4 max-w-4xl">

                {/* Stepper Header */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${step >= 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-200 text-slate-500'}`}>
                            <span className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-full text-xs font-bold">1</span>
                            <span className="text-sm font-bold">بازبینی</span>
                        </div>
                        <div className={`w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full ${step >= 2 ? 'bg-indigo-600' : ''}`}></div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${step >= 2 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                            <span className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-full text-xs font-bold">2</span>
                            <span className="text-sm font-bold">پرداخت</span>
                        </div>
                        <div className={`w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full ${step >= 3 ? 'bg-indigo-600' : ''}`}></div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${step >= 3 ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                            <span className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-full text-xs font-bold">3</span>
                            <span className="text-sm font-bold">پایان</span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Step 1: Review */}
                        {step === 1 && (
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

                                        {/* نمایش زمان‌بندی */}
                                        {course.schedules && course.schedules.length > 0 && (
                                            <p className="text-xs text-slate-400 mt-1">
                                                زمان‌بندی: {course.schedules[0].fullScheduleText}
                                                {course.schedules.length > 1 && ` و ${course.schedules.length - 1} زمان دیگر`}
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

                        {/* Step 2: Payment Method */}
                        {step === 2 && (
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-right-8 duration-500">
                                <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <CreditCard className="text-indigo-500" /> انتخاب روش پرداخت
                                </h2>

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
                                </div>
                            </div>
                        )}

                        {/* Step 3: Success */}
                        {step === 3 && (
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
                    {step < 3 && (
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
                                    <Button onClick={() => setStep(2)} className="w-full !py-3.5 !rounded-xl shadow-xl shadow-indigo-500/20">
                                        ادامه جهت پرداخت <ChevronRight size={18} />
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={() => setStep(1)} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
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
        </div>
    );
};
export default Checkout;