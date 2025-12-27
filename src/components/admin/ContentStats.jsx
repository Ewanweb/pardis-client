import React from 'react';
import { BarChart3, TrendingUp, Eye, EyeOff, Clock, Calendar } from 'lucide-react';

const ContentStats = ({ slides = [], stories = [] }) => {
    // محاسبه آمار اسلایدها
    const slideStats = {
        total: slides.length,
        active: slides.filter(s => s.isActive).length,
        inactive: slides.filter(s => !s.isActive).length,
        permanent: slides.filter(s => s.isPermanent).length,
        temporary: slides.filter(s => !s.isPermanent).length,
        expired: slides.filter(s => !s.isPermanent && s.expiresAt && new Date(s.expiresAt) < new Date()).length
    };

    // محاسبه آمار استوری‌ها
    const storyStats = {
        total: stories.length,
        active: stories.filter(s => s.isActive).length,
        inactive: stories.filter(s => !s.isActive).length,
        success: stories.filter(s => s.type === 'success').length,
        video: stories.filter(s => s.type === 'video').length,
        testimonial: stories.filter(s => s.type === 'testimonial').length,
        permanent: stories.filter(s => s.isPermanent).length,
        temporary: stories.filter(s => !s.isPermanent).length,
        expired: stories.filter(s => !s.isPermanent && s.expiresAt && new Date(s.expiresAt) < new Date()).length
    };

    const StatCard = ({ title, value, icon: Icon, color = 'blue', description }) => (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
                    <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
                    {description && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{description}</p>
                    )}
                </div>
                <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg`}>
                    <Icon className={`text-${color}-600 dark:text-${color}-400`} size={24} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* آمار کلی */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                    آمار کلی محتوا
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="کل اسلایدها"
                        value={slideStats.total}
                        icon={BarChart3}
                        color="blue"
                        description={`${slideStats.active} فعال، ${slideStats.inactive} غیرفعال`}
                    />
                    <StatCard
                        title="کل استوری‌ها"
                        value={storyStats.total}
                        icon={TrendingUp}
                        color="purple"
                        description={`${storyStats.active} فعال، ${storyStats.inactive} غیرفعال`}
                    />
                    <StatCard
                        title="محتوای فعال"
                        value={slideStats.active + storyStats.active}
                        icon={Eye}
                        color="green"
                        description="اسلایدها + استوری‌ها"
                    />
                    <StatCard
                        title="محتوای غیرفعال"
                        value={slideStats.inactive + storyStats.inactive}
                        icon={EyeOff}
                        color="red"
                        description="اسلایدها + استوری‌ها"
                    />
                </div>
            </div>

            {/* آمار تفصیلی اسلایدها */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                    آمار اسلایدهای اصلی
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="اسلایدهای دائمی"
                        value={slideStats.permanent}
                        icon={Calendar}
                        color="blue"
                        description="بدون تاریخ انقضا"
                    />
                    <StatCard
                        title="اسلایدهای موقت"
                        value={slideStats.temporary}
                        icon={Clock}
                        color="orange"
                        description="با تاریخ انقضا"
                    />
                    <StatCard
                        title="اسلایدهای منقضی"
                        value={slideStats.expired}
                        icon={Clock}
                        color="red"
                        description="تاریخ انقضا گذشته"
                    />
                    <StatCard
                        title="نرخ فعال بودن"
                        value={slideStats.total > 0 ? Math.round((slideStats.active / slideStats.total) * 100) : 0}
                        icon={TrendingUp}
                        color="green"
                        description={`${slideStats.active} از ${slideStats.total}`}
                    />
                </div>
            </div>

            {/* آمار تفصیلی استوری‌ها */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                    آمار استوری‌های موفقیت
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard
                        title="استوری‌های موفقیت"
                        value={storyStats.success}
                        icon={TrendingUp}
                        color="green"
                        description="نوع success"
                    />
                    <StatCard
                        title="استوری‌های ویدیویی"
                        value={storyStats.video}
                        icon={BarChart3}
                        color="red"
                        description="نوع video"
                    />
                    <StatCard
                        title="نظرات و تجربیات"
                        value={storyStats.testimonial}
                        icon={Eye}
                        color="blue"
                        description="نوع testimonial"
                    />
                    <StatCard
                        title="استوری‌های موقت"
                        value={storyStats.temporary}
                        icon={Clock}
                        color="orange"
                        description="با تاریخ انقضا"
                    />
                    <StatCard
                        title="استوری‌های منقضی"
                        value={storyStats.expired}
                        icon={Clock}
                        color="red"
                        description="تاریخ انقضا گذشته"
                    />
                </div>
            </div>

            {/* نمودار ترکیبی */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                    خلاصه وضعیت محتوا
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* نمودار اسلایدها */}
                    <div>
                        <h4 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-3">
                            وضعیت اسلایدها
                        </h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">فعال</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${slideStats.total > 0 ? (slideStats.active / slideStats.total) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                                        {slideStats.active}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">غیرفعال</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                        <div
                                            className="bg-red-500 h-2 rounded-full"
                                            style={{ width: `${slideStats.total > 0 ? (slideStats.inactive / slideStats.total) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                                        {slideStats.inactive}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* نمودار استوری‌ها */}
                    <div>
                        <h4 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-3">
                            وضعیت استوری‌ها
                        </h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">فعال</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${storyStats.total > 0 ? (storyStats.active / storyStats.total) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                                        {storyStats.active}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">غیرفعال</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                        <div
                                            className="bg-red-500 h-2 rounded-full"
                                            style={{ width: `${storyStats.total > 0 ? (storyStats.inactive / storyStats.total) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                                        {storyStats.inactive}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentStats;