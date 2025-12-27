import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Users, Award, Sparkles } from 'lucide-react';

const LoadingScreen = ({ message = "در حال بارگذاری...", showProgress = false, progress = 0 }) => {
    const [currentIcon, setCurrentIcon] = useState(0);
    const [dots, setDots] = useState('');

    const icons = [
        { Icon: GraduationCap, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
        { Icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
        { Icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        { Icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
        { Icon: Sparkles, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/30' }
    ];

    // Rotate icons
    useEffect(() => {
        const iconInterval = setInterval(() => {
            setCurrentIcon(prev => (prev + 1) % icons.length);
        }, 800);

        return () => clearInterval(iconInterval);
    }, [icons.length]);

    // Animate dots
    useEffect(() => {
        const dotsInterval = setInterval(() => {
            setDots(prev => {
                if (prev === '...') return '';
                return prev + '.';
            });
        }, 500);

        return () => clearInterval(dotsInterval);
    }, []);

    const currentIconData = icons[currentIcon];

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center z-50">
            <div className="text-center">
                {/* Animated Icon */}
                <div className="relative mb-8">
                    <div className={`w-24 h-24 mx-auto ${currentIconData.bg} rounded-full flex items-center justify-center mb-4 animate-pulse`}>
                        <currentIconData.Icon
                            size={40}
                            className={`${currentIconData.color} animate-bounce`}
                        />
                    </div>

                    {/* Floating particles */}
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-indigo-400 rounded-full animate-ping opacity-30"
                                style={{
                                    left: `${20 + (i * 12)}%`,
                                    top: `${30 + (i % 2) * 40}%`,
                                    animationDelay: `${i * 0.2}s`,
                                    animationDuration: '2s'
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Loading Text */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        آکادمی پردیس توس
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 min-h-[1.5rem]">
                        {message}{dots}
                    </p>
                </div>

                {/* Progress Bar */}
                {showProgress && (
                    <div className="w-64 mx-auto mb-4">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                            />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                            {Math.round(progress)}%
                        </p>
                    </div>
                )}

                {/* Animated Spinner */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 rounded-full animate-spin">
                            <div className="absolute inset-0 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"
                                style={{ animationDuration: '1s' }} />
                        </div>
                    </div>
                </div>

                {/* Motivational Text */}
                <div className="mt-8 max-w-md mx-auto">
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                        "یادگیری سرمایه‌گذاری در آینده است"
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;