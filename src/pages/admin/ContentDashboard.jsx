import React, { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, Eye, EyeOff, Plus, Edit,
    Home, RefreshCw, Download, Upload, Settings,
    Image as ImageIcon, Play, Award, Clock, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Button, Badge } from '../../components/UI';
import ContentStats from '../../components/admin/ContentStats';
import toast, { Toaster } from 'react-hot-toast';

const ContentDashboard = () => {
    const [slides, setSlides] = useState([]);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [slidesResponse, storiesResponse] = await Promise.all([
                api.get('/api/HeroSlides?adminView=true&includeInactive=true&includeExpired=true'),
                api.get('/api/SuccessStories?adminView=true&includeInactive=true&includeExpired=true')
            ]);

            setSlides(slidesResponse.data?.data || []);
            setStories(storiesResponse.data?.data || []);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('خطا در بارگذاری داده‌ها');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadData();
        toast.success('داده‌ها به‌روزرسانی شد');
    };

    // آخرین آیتم‌های اضافه شده
    const recentSlides = slides
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 3);

    const recentStories = stories
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 3);

    // آیتم‌های منقضی شده یا نزدیک به انقضا
    const expiringSoon = [...slides, ...stories]
        .filter(item => !item.isPermanent && item.expiresAt)
        .filter(item => {
            const expiryDate = new Date(item.expiresAt);
            const now = new Date();
            const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
            return expiryDate <= threeDaysFromNow;
        })
        .sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt))
        .slice(0, 5);

    const QuickActionCard = ({ title, description, icon: Icon, color, to, onClick }) => (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg`}>
                    <Icon className={`text-${color}-600 dark:text-${color}-400`} size={20} />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-white">{title}</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{description}</p>
            {to ? (
                <Link to={to}>
                    <Button size="sm" className={`bg-${color}-500 hover:bg-${color}-600`}>
                        شروع
                    </Button>
                </Link>
            ) : (
                <Button size="sm" onClick={onClick} className={`bg-${color}-500 hover:bg-${color}-600`}>
                    اجرا
                </Button>
            )}
        </div>
    );

    const RecentItemCard = ({ item, type }) => {
        const isSlide = type === 'slide';
        const Icon = isSlide ? ImageIcon : (item.type === 'video' ? Play : Award);

        return (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className={`p-2 ${isSlide ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'} rounded-lg`}>
                    <Icon className={`${isSlide ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800 dark:text-white truncate">
                        {item.title || 'بدون عنوان'}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant={item.isActive ? 'success' : 'secondary'} size="sm">
                            {item.isActive ? 'فعال' : 'غیرفعال'}
                        </Badge>
                        {item.createdAt && (
                            <span className="text-xs text-slate-500">
                                {new Date(item.createdAt).toLocaleDateString('fa-IR')}
                            </span>
                        )}
                    </div>
                </div>
                <Link
                    to={isSlide ? `/admin/slides` : `/admin/stories`}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                >
                    <Edit size={14} className="text-slate-500" />
                </Link>
            </div>
        );
    };

    const ExpiringItemCard = ({ item, type }) => {
        const isSlide = type === 'slide';
        const expiryDate = new Date(item.expiresAt);
        const now = new Date();
        const isExpired = expiryDate < now;
        const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

        return (
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${isExpired
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                }`}>
                <div className={`p-2 ${isExpired
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-orange-100 dark:bg-orange-900/30'
                    } rounded-lg`}>
                    <Clock className={`${isExpired
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-orange-600 dark:text-orange-400'
                        }`} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800 dark:text-white truncate">
                        {item.title || 'بدون عنوان'}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant={isExpired ? 'destructive' : 'warning'} size="sm">
                            {isExpired ? 'منقضی شده' : `${daysUntilExpiry} روز مانده`}
                        </Badge>
                        <span className="text-xs text-slate-500">
                            {isSlide ? 'اسلاید' : 'استوری'}
                        </span>
                    </div>
                </div>
                <Link
                    to={isSlide ? `/admin/slides` : `/admin/stories`}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                >
                    <Edit size={14} className="text-slate-500" />
                </Link>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        داشبورد مدیریت محتوا
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        مدیریت اسلایدها و استوری‌های موفقیت
                    </p>
                    {lastUpdated && (
                        <p className="text-xs text-slate-500 mt-1">
                            آخرین به‌روزرسانی: {lastUpdated.toLocaleString('fa-IR')}
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => window.location.href = '/'}
                        icon={Home}
                        variant="outline"
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                        صفحه اصلی
                    </Button>
                    <Button onClick={handleRefresh} icon={RefreshCw} variant="outline" disabled={loading}>
                        {loading ? 'در حال بارگذاری...' : 'به‌روزرسانی'}
                    </Button>
                </div>
            </div>

            {/* آمار کلی */}
            <ContentStats slides={slides} stories={stories} />

            {/* عملیات سریع */}
            <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                    عملیات سریع
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickActionCard
                        title="اسلاید جدید"
                        description="ایجاد اسلاید جدید برای صفحه اصلی"
                        icon={Plus}
                        color="blue"
                        to="/admin/slides"
                    />
                    <QuickActionCard
                        title="استوری جدید"
                        description="اضافه کردن استوری موفقیت جدید"
                        icon={Plus}
                        color="purple"
                        to="/admin/stories"
                    />
                    <QuickActionCard
                        title="مدیریت اسلایدها"
                        description="ویرایش و مدیریت اسلایدهای موجود"
                        icon={Edit}
                        color="green"
                        to="/admin/slides"
                    />
                    <QuickActionCard
                        title="مدیریت استوری‌ها"
                        description="ویرایش و مدیریت استوری‌های موجود"
                        icon={Edit}
                        color="orange"
                        to="/admin/stories"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* آخرین اسلایدها */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                            آخرین اسلایدها
                        </h3>
                        <Link to="/admin/slides">
                            <Button size="sm" variant="outline">
                                مشاهده همه
                            </Button>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentSlides.length > 0 ? (
                            recentSlides.map(slide => (
                                <RecentItemCard key={slide.id} item={slide} type="slide" />
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <ImageIcon size={32} className="mx-auto text-slate-400 mb-2" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    هنوز اسلایدی اضافه نشده است
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* آخرین استوری‌ها */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                            آخرین استوری‌ها
                        </h3>
                        <Link to="/admin/stories">
                            <Button size="sm" variant="outline">
                                مشاهده همه
                            </Button>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentStories.length > 0 ? (
                            recentStories.map(story => (
                                <RecentItemCard key={story.id} item={story} type="story" />
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <Play size={32} className="mx-auto text-slate-400 mb-2" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    هنوز استوری‌ای اضافه نشده است
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* آیتم‌های منقضی شده یا نزدیک به انقضا */}
            {expiringSoon.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="text-orange-500" size={20} />
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                            محتوای منقضی شده یا نزدیک به انقضا
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {expiringSoon.map(item => (
                            <ExpiringItemCard
                                key={`${item.id}-${item.title ? 'slide' : 'story'}`}
                                item={item}
                                type={item.primaryActionLabel ? 'slide' : 'story'}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ابزارهای اضافی */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                    ابزارهای مدیریت
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="justify-start" disabled>
                        <Download size={16} className="ml-2" />
                        خروجی Excel (به زودی)
                    </Button>
                    <Button variant="outline" className="justify-start" disabled>
                        <Upload size={16} className="ml-2" />
                        ورودی گروهی (به زودی)
                    </Button>
                    <Button variant="outline" className="justify-start" disabled>
                        <Settings size={16} className="ml-2" />
                        تنظیمات پیشرفته (به زودی)
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ContentDashboard;