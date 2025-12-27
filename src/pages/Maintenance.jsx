import React, { useState, useEffect } from 'react';
import { Wrench, Clock, RefreshCw, Mail, Phone, MessageCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/UI';
import SeoHead from '../components/Seo/SeoHead';

const Maintenance = ({
    estimatedTime = "2 ساعت",
    reason = "بهبود عملکرد سیستم",
    showCountdown = false,
    endTime = null
}) => {
    const [timeRemaining, setTimeRemaining] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Countdown timer
    useEffect(() => {
        if (!showCountdown || !endTime) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(endTime).getTime();
            const distance = end - now;

            if (distance < 0) {
                setTimeRemaining('تعمیرات تمام شده است');
                clearInterval(timer);
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeRemaining(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(timer);
    }, [showCountdown, endTime]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    const maintenanceSteps = [
        { step: "بررسی سیستم", status: "completed", icon: CheckCircle2 },
        { step: "بهینه‌سازی دیتابیس", status: "in-progress", icon: Clock },
        { step: "به‌روزرسانی سرور", status: "pending", icon: AlertTriangle },
        { step: "تست نهایی", status: "pending", icon: AlertTriangle }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-8">
            <SeoHead
                title="سایت در حال تعمیر - آکادمی پردیس توس"
                description="سایت آکادمی پردیس توس به‌طور موقت در حال تعمیر و بهبود است. لطفاً کمی صبر کنید."
                noIndex={true}
                noFollow={true}
            />

            <div className="max-w-4xl mx-auto text-center">
                {/* Maintenance Animation */}
                <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                        <Wrench size={48} className="text-white animate-bounce" />
                    </div>

                    {/* Floating tools */}
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-3 h-3 bg-orange-400 rounded-full animate-ping opacity-40"
                                style={{
                                    left: `${15 + (i * 10)}%`,
                                    top: `${20 + (i % 3) * 20}%`,
                                    animationDelay: `${i * 0.3}s`,
                                    animationDuration: '3s'
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Main Message */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                        سایت در حال تعمیر است
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-4">
                        ما در حال بهبود سیستم برای ارائه خدمات بهتر به شما هستیم
                    </p>
                    <p className="text-lg text-orange-600 dark:text-orange-400 font-semibold">
                        دلیل: {reason}
                    </p>
                </div>

                {/* Countdown Timer */}
                {showCountdown && timeRemaining && (
                    <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Clock size={24} className="text-orange-500" />
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                زمان باقی‌مانده
                            </h3>
                        </div>
                        <div className="text-3xl font-mono font-bold text-orange-600 dark:text-orange-400">
                            {timeRemaining}
                        </div>
                    </div>
                )}

                {/* Estimated Time */}
                {!showCountdown && (
                    <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                        <p className="text-orange-800 dark:text-orange-200">
                            <Clock size={20} className="inline ml-2" />
                            زمان تخمینی تعمیرات: <strong>{estimatedTime}</strong>
                        </p>
                    </div>
                )}

                {/* Progress Steps */}
                <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                        مراحل تعمیرات
                    </h3>

                    <div className="space-y-4">
                        {maintenanceSteps.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                        item.status === 'in-progress' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                            'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                                    }`}>
                                    <item.icon size={16} />
                                </div>
                                <span className={`flex-1 text-right ${item.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                                        item.status === 'in-progress' ? 'text-orange-600 dark:text-orange-400' :
                                            'text-slate-500 dark:text-slate-400'
                                    }`}>
                                    {item.step}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                        item.status === 'in-progress' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                            'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                    }`}>
                                    {item.status === 'completed' ? 'تمام' :
                                        item.status === 'in-progress' ? 'در حال انجام' : 'در انتظار'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center mb-8">
                    <Button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                        {isRefreshing ? 'در حال بررسی...' : 'بررسی مجدد'}
                    </Button>
                </div>

                {/* Contact Information */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                        نیاز به کمک دارید؟
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href="mailto:support@pardistous.ir"
                            className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
                        >
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Mail size={20} />
                            </div>
                            <div className="text-right">
                                <h4 className="font-semibold text-slate-900 dark:text-white">ایمیل</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">support@pardistous.ir</p>
                            </div>
                        </a>

                        <a
                            href="tel:+982112345678"
                            className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300"
                        >
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400">
                                <Phone size={20} />
                            </div>
                            <div className="text-right">
                                <h4 className="font-semibold text-slate-900 dark:text-white">تلفن</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">021-12345678</p>
                            </div>
                        </a>

                        <a
                            href="https://t.me/pardistous"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300"
                        >
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <MessageCircle size={20} />
                            </div>
                            <div className="text-right">
                                <h4 className="font-semibold text-slate-900 dark:text-white">تلگرام</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">@pardistous</p>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Footer Message */}
                <div className="mt-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400">
                        از صبر و شکیبایی شما متشکریم. به زودی با خدمات بهتر در خدمت شما خواهیم بود.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Maintenance;