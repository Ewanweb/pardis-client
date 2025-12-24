/**
 * 🎨 صفحه نمایش انواع مختلف دکمه پاک کردن کش
 * برای تست و نمایش طراحی‌های مختلف
 */

import React from 'react';
import CacheClearButton from './CacheClearButton';
import { Card } from './UI';

const CacheClearButtonDemo = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* هدر */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-4">
                        🧹 دکمه پاک کردن کش
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        نمایش انواع مختلف طراحی دکمه پاک کردن کش با استایل‌های متنوع و زیبا
                    </p>
                </div>

                {/* استایل Modern */}
                <Card className="p-8" gradient={true}>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                        ✨ استایل Modern
                        <span className="text-sm bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full font-bold">
                            پیشنهادی
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300">اندازه کوچک</h3>
                            <CacheClearButton
                                style="modern"
                                size="sm"
                                showSize={true}
                                showProgress={true}
                            />
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300">اندازه متوسط</h3>
                            <CacheClearButton
                                style="modern"
                                size="md"
                                showSize={true}
                                showProgress={true}
                            />
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300">اندازه بزرگ</h3>
                            <CacheClearButton
                                style="modern"
                                size="lg"
                                showSize={true}
                                showProgress={true}
                            />
                        </div>
                    </div>
                </Card>

                {/* استایل Glass */}
                <Card className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                        🌟 استایل Glass
                        <span className="text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full font-bold">
                            شیشه‌ای
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300">با نمایش اندازه</h3>
                            <CacheClearButton
                                style="glass"
                                size="md"
                                showSize={true}
                                showProgress={true}
                            />
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300">بدون نمایش اندازه</h3>
                            <CacheClearButton
                                style="glass"
                                size="md"
                                showSize={false}
                                showProgress={true}
                            />
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300">بدون آیکون</h3>
                            <CacheClearButton
                                style="glass"
                                size="md"
                                showIcon={false}
                                showProgress={true}
                            />
                        </div>
                    </div>
                </Card>

                {/* استایل Minimal */}
                <Card className="p-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                        🎯 استایل Minimal
                        <span className="text-sm bg-gradient-to-r from-slate-500 to-slate-600 text-white px-3 py-1 rounded-full font-bold">
                            ساده
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300">حالت پیش‌فرض</h3>
                            <CacheClearButton
                                style="minimal"
                                size="md"
                                showSize={true}
                                showProgress={true}
                            />
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300">بدون پیشرفت</h3>
                            <CacheClearButton
                                style="minimal"
                                size="md"
                                showSize={true}
                                showProgress={false}
                            />
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300">فقط متن</h3>
                            <CacheClearButton
                                style="minimal"
                                size="md"
                                showIcon={false}
                                showSize={false}
                                showProgress={false}
                            />
                        </div>
                    </div>
                </Card>

                {/* مقایسه در پس‌زمینه‌های مختلف */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* پس‌زمینه روشن */}
                    <Card className="p-6 bg-white">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">☀️ پس‌زمینه روشن</h3>
                        <div className="space-y-4">
                            <CacheClearButton style="modern" size="sm" showSize={true} />
                            <CacheClearButton style="glass" size="sm" showSize={true} />
                            <CacheClearButton style="minimal" size="sm" showSize={true} />
                        </div>
                    </Card>

                    {/* پس‌زمینه تیره */}
                    <Card className="p-6 bg-slate-800">
                        <h3 className="text-lg font-bold text-white mb-4">🌙 پس‌زمینه تیره</h3>
                        <div className="space-y-4">
                            <CacheClearButton style="modern" size="sm" showSize={true} />
                            <CacheClearButton style="glass" size="sm" showSize={true} />
                            <CacheClearButton style="minimal" size="sm" showSize={true} />
                        </div>
                    </Card>
                </div>

                {/* راهنمای استفاده */}
                <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
                        📖 راهنمای استفاده
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-3">
                                ویژگی‌های جدید:
                            </h3>
                            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    نوار پیشرفت انیمیشن‌دار
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    نمایش اندازه کش
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    سه استایل مختلف
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    پشتیبانی از تم تیره
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    انیمیشن‌های نرم
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-3">
                                نحوه استفاده:
                            </h3>
                            <div className="bg-slate-800 dark:bg-slate-900 rounded-lg p-4 text-sm">
                                <code className="text-green-400">
                                    {`<CacheClearButton 
  style="modern" 
  size="md" 
  showSize={true} 
  showProgress={true}
/>`}
                                </code>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CacheClearButtonDemo;