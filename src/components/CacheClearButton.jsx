/**
 * 🧹 دکمه پاک کردن کش دستی - نسخه بهبود یافته
 * برای استفاده در صفحات admin یا تنظیمات
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Sparkles, Database, CheckCircle } from 'lucide-react';
import { cacheManager } from '../utils/cacheManager';
import { Button } from './UI';

const CacheClearButton = ({
    variant = "outline",
    size = "md",
    showSize = true,
    showIcon = true,
    showProgress = true,
    className = "",
    style = "modern" // modern, minimal, glass
}) => {
    const [isClearing, setIsClearing] = useState(false);
    const [cacheSize, setCacheSize] = useState(null);
    const [progress, setProgress] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);

    // محاسبه اندازه کش
    useEffect(() => {
        if (showSize) {
            cacheManager.getCacheSize().then(setCacheSize);
        }
    }, [showSize]);

    const handleClearCache = async () => {
        if (isClearing) return;

        const confirmed = window.confirm(
            "🧹 آیا مطمئن هستید که می‌خواهید تمام کش برنامه را پاک کنید؟\n\n" +
            "✨ این عمل باعث بهبود عملکرد و بارگذاری مجدد صفحه خواهد شد."
        );

        if (!confirmed) return;

        setIsClearing(true);
        setProgress(0);
        setIsSuccess(false);

        // انیمیشن پیشرفت
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + Math.random() * 15;
            });
        }, 100);

        try {
            await cacheManager.forceClearCache();
            setProgress(100);
            setIsSuccess(true);

            // نمایش پیام موفقیت قبل از reload
            setTimeout(() => {
                // Page will reload automatically
            }, 800);
        } catch (error) {
            console.error("Failed to clear cache:", error);
            clearInterval(progressInterval);
            alert("❌ خطا در پاک کردن کش. لطفاً دوباره تلاش کنید.");
            setIsClearing(false);
            setProgress(0);
        }
    };

    // استایل‌های مختلف دکمه
    const getButtonStyles = () => {
        const baseStyles = "relative overflow-hidden group transition-all duration-500";

        switch (style) {
            case "glass":
                return `${baseStyles} glass hover:glass-dark backdrop-blur-xl border-white/20 hover:border-white/30 shadow-xl hover:shadow-2xl`;

            case "minimal":
                return `${baseStyles} bg-transparent hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 border-2 border-red-200 dark:border-red-400/30 hover:border-red-300 dark:hover:border-red-300 text-red-600 dark:text-red-400`;

            default: // modern
                return `${baseStyles} bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 border border-red-400/20 hover:scale-105 active:scale-95`;
        }
    };

    const getIconColor = () => {
        switch (style) {
            case "glass":
            case "minimal":
                return "text-red-500 dark:text-red-400";
            default:
                return "text-white";
        }
    };

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <div className="flex items-center gap-3">
                <button
                    onClick={handleClearCache}
                    disabled={isClearing}
                    className={`
                        ${getButtonStyles()}
                        ${size === 'sm' ? 'px-4 py-2 text-sm rounded-lg' :
                            size === 'lg' ? 'px-8 py-4 text-lg rounded-2xl' :
                                'px-6 py-3 text-base rounded-xl'}
                        flex items-center gap-3 font-bold
                        disabled:opacity-70 disabled:cursor-not-allowed
                        focus:outline-none focus:ring-4 focus:ring-red-500/20
                        touch-friendly
                    `}
                    aria-label="پاک کردن کش برنامه"
                >
                    {/* آیکون */}
                    {showIcon && (
                        <div className="relative">
                            {isSuccess ? (
                                <CheckCircle className={`w-5 h-5 ${getIconColor()} animate-scale-in`} />
                            ) : isClearing ? (
                                <RefreshCw className={`w-5 h-5 ${getIconColor()} animate-spin`} />
                            ) : (
                                <div className="relative">
                                    <Trash2 className={`w-5 h-5 ${getIconColor()} group-hover:scale-110 transition-transform duration-300`} />
                                    <Sparkles className={`w-3 h-3 ${getIconColor()} absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300`} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* متن */}
                    <span className="relative">
                        {isSuccess ? "✨ پاک شد!" :
                            isClearing ? "در حال پاک کردن..." :
                                "🧹 پاک کردن کش"}
                    </span>

                    {/* افکت نور پس‌زمینه */}
                    {style === "modern" && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                    )}
                </button>

                {/* نمایش اندازه کش */}
                {showSize && cacheSize && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200/50 dark:border-slate-600/50 shadow-sm">
                        <Database className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            {cacheSize.kb} KB
                        </span>
                    </div>
                )}
            </div>

            {/* نوار پیشرفت */}
            {showProgress && isClearing && (
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden shadow-inner">
                    <div
                        className="h-full bg-gradient-to-r from-red-500 to-pink-600 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                    </div>
                </div>
            )}

            {/* پیام راهنما */}
            {!isClearing && (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    💡 پاک کردن کش باعث بهبود عملکرد برنامه می‌شود
                </p>
            )}
        </div>
    );
};

export default CacheClearButton;

// نمونه‌های استفاده:
// <CacheClearButton style="modern" size="md" showProgress={true} />
// <CacheClearButton style="glass" size="lg" showSize={true} />
// <CacheClearButton style="minimal" size="sm" showIcon={false} />