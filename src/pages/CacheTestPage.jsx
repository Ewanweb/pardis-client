/**
 * 🎨 صفحه تست دکمه پاک کردن کش
 * برای نمایش طراحی زیبا در محیط واقعی
 */

import React from 'react';
import CacheClearButton from '../components/CacheClearButton';
import { Card } from '../components/UI';

const CacheTestPage = () => {
    return (
        <div className="min-h-screen bg-app p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* هدر زیبا */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-indigo-500/25 mb-6">
                        <span className="text-2xl">🧹</span>
                        <h1 className="text-2xl font-black">دکمه پاک کردن کش</h1>
                    </div>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        طراحی زیبا و مناسب تم فارسی شما
                    </p>
                </div>

                {/* نمایش در کارت‌های مختلف */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* استایل Modern */}
                    <Card className="p-6 text-center" hover={true}>
                        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg shadow-red-500/25">
                            ✨
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                            استایل Modern
                        </h3>
                        <CacheClearButton
                            style="modern"
                            size="md"
                            showSize={true}
                            showProgress={true}
                        />
                    </Card>

                    {/* استایل Glass */}
                    <Card className="p-6 text-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20" hover={true}>
                        <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl mx-auto mb-4">
                            🌟
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                            استایل Glass
                        </h3>
                        <CacheClearButton
                            style="glass"
                            size="md"
                            showSize={true}
                            showProgress={true}
                        />
                    </Card>

                    {/* استایل Minimal */}
                    <Card className="p-6 text-center" hover={true}>
                        <div className="w-16 h-16 border-2 border-red-200 dark:border-red-400/30 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 text-2xl mx-auto mb-4">
                            🎯
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                            استایل Minimal
                        </h3>
                        <CacheClearButton
                            style="minimal"
                            size="md"
                            showSize={true}
                            showProgress={true}
                        />
                    </Card>
                </div>

                {/* نمایش در اندازه‌های مختلف */}
                <Card className="p-8" gradient={true}>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">
                        اندازه‌های مختلف
                    </h2>
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">کوچک</p>
                            <CacheClearButton style="modern" size="sm" showSize={true} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">متوسط</p>
                            <CacheClearButton style="modern" size="md" showSize={true} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">بزرگ</p>
                            <CacheClearButton style="modern" size="lg" showSize={true} />
                        </div>
                    </div>
                </Card>

                {/* نمایش در پس‌زمینه‌های مختلف */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* پس‌زمینه روشن */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            ☀️ پس‌زمینه روشن
                        </h3>
                        <div className="space-y-4">
                            <CacheClearButton style="modern" size="sm" showSize={true} />
                            <CacheClearButton style="glass" size="sm" showSize={true} />
                            <CacheClearButton style="minimal" size="sm" showSize={true} />
                        </div>
                    </div>

                    {/* پس‌زمینه گرادیانت */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-2xl text-white shadow-xl">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            🌙 پس‌زمینه گرادیانت
                        </h3>
                        <div className="space-y-4">
                            <CacheClearButton style="modern" size="sm" showSize={true} />
                            <CacheClearButton style="glass" size="sm" showSize={true} />
                            <CacheClearButton style="minimal" size="sm" showSize={true} />
                        </div>
                    </div>
                </div>

                {/* راهنمای استفاده */}
                <Card className="p-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                        📖 ویژگی‌های جدید
                        <span className="text-sm bg-emerald-500 text-white px-3 py-1 rounded-full">
                            بهبود یافته
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-4">
                                ✨ ویژگی‌های طراحی:
                            </h3>
                            <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    نوار پیشرفت انیمیشن‌دار
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    نمایش اندازه کش با آیکون
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    انیمیشن جرقه در hover
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    حالت موفقیت با تیک
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    سه استایل مختلف
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-4">
                                🎨 سازگاری با تم:
                            </h3>
                            <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    رنگ‌های فارسی اصیل
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    پشتیبانی کامل از تم تیره
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    طراحی ریسپانسیو
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    دوستدار لمس موبایل
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    متن و ایموجی فارسی
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CacheTestPage;