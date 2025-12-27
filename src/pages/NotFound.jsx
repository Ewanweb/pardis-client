import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeft, Search, BookOpen, Users, MessageCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '../components/UI';
import SeoHead from '../components/Seo/SeoHead';

const NotFound = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [countdown, setCountdown] = useState(10);
    const [isAutoRedirect, setIsAutoRedirect] = useState(true);

    // Auto redirect countdown
    useEffect(() => {
        if (!isAutoRedirect) return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate, isAutoRedirect]);

    const handleStopRedirect = () => {
        setIsAutoRedirect(false);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoBack = () => {
        window.history.length > 1 ? navigate(-1) : navigate('/');
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    const suggestedPages = [
        { name: 'صفحه اصلی', path: '/', icon: Home, description: 'بازگشت به صفحه اصلی' },
        { name: 'دوره‌ها', path: '/courses', icon: BookOpen, description: 'مشاهده تمام دوره‌ها' },
        { name: 'مدرسین', path: '/instructors', icon: Users, description: 'آشنایی با مدرسین' },
        { name: 'تماس با ما', path: '/contact', icon: MessageCircle, description: 'ارتباط با پشتیبانی' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-8">
            <SeoHead
                title="صفحه یافت نشد - 404"
                description="صفحه مورد نظر شما یافت نشد. به صفحه اصلی بازگردید یا از منوی پیشنهادی استفاده کنید."
                noIndex={true}
                noFollow={true}
            />

            <div className="max-w-4xl mx-auto text-center">
                {/* 404 Animation */}
                <div className="relative mb-8">
                    <div className="text-[12rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 leading-none select-none animate-pulse">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-slate-800 rounded-full shadow-2xl flex items-center justify-center animate-bounce">
                            <AlertTriangle size={48} className="text-amber-500" />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        صفحه یافت نشد!
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
                        متأسفانه صفحه‌ای که دنبال آن می‌گردید وجود ندارد.
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg inline-block">
                        مسیر: {location.pathname}
                    </p>
                </div>

                {/* Auto Redirect Counter */}
                {isAutoRedirect && (
                    <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <p className="text-blue-800 dark:text-blue-200 mb-2">
                            در {countdown} ثانیه به صفحه اصلی منتقل می‌شوید
                        </p>
                        <button
                            onClick={handleStopRedirect}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            توقف انتقال خودکار
                        </button>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center mb-12">
                    <Button
                        onClick={handleGoHome}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Home size={20} />
                        صفحه اصلی
                    </Button>

                    <Button
                        onClick={handleGoBack}
                        variant="secondary"
                        className="flex items-center gap-2 px-6 py-3"
                    >
                        <ArrowLeft size={20} />
                        بازگشت
                    </Button>

                    <Button
                        onClick={handleRefresh}
                        variant="outline"
                        className="flex items-center gap-2 px-6 py-3"
                    >
                        <RefreshCw size={20} />
                        تازه‌سازی
                    </Button>
                </div>

                {/* Suggested Pages */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-center gap-2">
                        <Search size={24} />
                        صفحات پیشنهادی
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suggestedPages.map((page, index) => (
                            <button
                                key={index}
                                onClick={() => navigate(page.path)}
                                className="group p-4 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 text-right"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                                        <page.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {page.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {page.description}
                                        </p>
                                    </div>
                                    <ArrowLeft size={16} className="text-slate-400 group-hover:text-indigo-500 group-hover:-translate-x-1 transition-all duration-300" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400 mb-2">
                        همچنان مشکل دارید؟
                    </p>
                    <button
                        onClick={() => navigate('/contact')}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                        با پشتیبانی تماس بگیرید
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;