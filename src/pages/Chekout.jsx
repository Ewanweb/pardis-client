import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // ✅ اضافه شدن useLocation
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Wallet, ChevronRight } from 'lucide-react';
import { api, SERVER_URL } from '../services/api';
import { Button } from '../components/UI';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${SERVER_URL}${cleanPath}`;
};

const Checkout = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation(); // ✅ دریافت state
    const { user } = useAuth();

    const [course, setCourse] = useState(state?.course || null); // ✅ استفاده اولیه از state
    const [loading, setLoading] = useState(!state?.course); // اگر state بود، لودینگ نداریم
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('gateway');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // فقط اگر دوره در state نبود (رفرش صفحه)، از سرور بگیر
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

    // چک کردن لاگین
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token && !loading) {
            // ذخیره آدرس فعلی برای بازگشت بعد از لاگین
            // navigate('/login', { state: { from: `/checkout/${slug}` } });
            // فعلا فقط هشدار:
            toast('لطفاً برای خرید وارد شوید', { icon: '🔒' });
        }
    }, [loading, navigate, slug]);

    const handlePayment = async () => {
        if (!localStorage.getItem('token')) {
            return toast.error('لطفاً ابتدا وارد شوید');
        }

        setIsProcessing(true);
        try {
            // شبیه‌سازی پرداخت
            await new Promise(r => setTimeout(r, 2000));
            setStep(3);
            toast.success('ثبت‌نام با موفقیت انجام شد! 🎉');
        } catch (error) {
            toast.error('خطا در پرداخت');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;
    if (!course) return null;

    const price = Number(course.price);

    return (
        <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
            <Helmet>
                <title>تکمیل خرید: {course.title}</title>
            </Helmet>

            <div className="container mx-auto px-4 max-w-4xl">

                {/* Stepper */}
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
                                    <ShoppingCart className="text-indigo-500"/> جزئیات سفارش
                                </h2>

                                <div className="flex gap-4 mb-6">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                                        <img src={getImageUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 py-1">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 line-clamp-2">{course.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">مدرس: {course.instructor?.fullName || course.instructor?.name || 'نامشخص'}</p>
                                        <div className="mt-auto pt-2">
                                            <span className="text-slate-800 dark:text-white font-black">{price.toLocaleString()} <span className="text-xs font-medium text-slate-400">تومان</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Payment Method */}
                        {step === 2 && (
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-right-8 duration-500">
                                <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <CreditCard className="text-indigo-500"/> انتخاب روش پرداخت
                                </h2>

                                <div className="space-y-3">
                                    <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'gateway' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-200'}`}>
                                        <input type="radio" name="payment" value="gateway" checked={paymentMethod === 'gateway'} onChange={() => setPaymentMethod('gateway')} className="w-5 h-5 accent-indigo-600" />
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><CreditCard size={24} className="text-indigo-600"/></div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">پرداخت آنلاین (زرین‌پال)</p>
                                            <p className="text-xs text-slate-500">پرداخت با کلیه کارت‌های عضو شتاب</p>
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
                                    تبریک می‌گوییم! شما اکنون دانشجوی دوره <strong>{course.title}</strong> هستید.
                                </p>
                                <div className="flex justify-center gap-4">
                                    <Button onClick={() => navigate('/profile')} variant="outline">مشاهده در پنل کاربری</Button>
                                    <Button onClick={() => navigate(`/courses/${slug}`)}>شروع یادگیری</Button>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Sidebar Summary */}
                    {step < 3 && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-28 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-lg">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">خلاصه صورت‌حساب</h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                                        <span>مبلغ کل</span>
                                        <span>{price.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between font-black text-lg text-slate-800 dark:text-white">
                                        <span>مجموع</span>
                                        <span className="text-indigo-600 dark:text-indigo-400">{price.toLocaleString()} تومان</span>
                                    </div>
                                </div>

                                {step === 1 ? (
                                    <Button onClick={() => setStep(2)} className="w-full !py-3.5 !rounded-xl shadow-xl shadow-indigo-500/20">
                                        ادامه جهت پرداخت <ChevronRight size={18}/>
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={() => setStep(1)} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <ArrowLeft size={20}/>
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