import React, { useEffect, useState } from 'react';
import { Users, BookOpen, TrendingUp, TrendingDown, DollarSign, Activity, Layers, Minus, Clock, UserPlus, Loader2, UserCheck } from 'lucide-react';
import { api } from '../../services/api';

const DashboardHome = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    // --- کامپوننت کارت آمار (Stat Card) ---
    const StatCard = ({ title, value, icon: Icon, color, trendValue, subtitle }) => {
        const isPositive = trendValue > 0;
        const isNegative = trendValue < 0;

        let trendColorClass = "text-slate-500 bg-slate-100 border-slate-200";
        let TrendIcon = Minus;
        let trendLabel = "بدون تغییر";

        if (isPositive) {
            trendColorClass = "text-emerald-600 bg-emerald-50 border-emerald-100";
            TrendIcon = TrendingUp;
            trendLabel = `+${trendValue}%`;
        } else if (isNegative) {
            trendColorClass = "text-rose-600 bg-rose-50 border-rose-100";
            TrendIcon = TrendingDown;
            trendLabel = `${trendValue}%`;
        }

        return (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ${color.replace('text-', 'bg-')}`}></div>

                <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className={`p-3 rounded-2xl ${color.replace('text-', 'bg-').replace('600', '50')} ${color} shadow-sm group-hover:scale-110 transition-transform`}>
                        <Icon size={24} />
                    </div>

                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border ${trendColorClass}`}>
                        {trendLabel} <TrendIcon size={14} />
                    </span>
                </div>

                <div className="relative z-10">
                    <h3 className="text-slate-400 text-sm font-bold mb-1">{title}</h3>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">
                        {Number(value).toLocaleString()}
                        {subtitle && <span className="text-xs text-slate-400 font-normal mr-1">{subtitle}</span>}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2">نسبت به ماه گذشته</p>
                </div>
            </div>
        );
    };

    // --- کامپوننت آیتم لیست فعالیت (Activity Item) ---
    const ActivityItem = ({ activity }) => {
        let Icon = Activity;
        let colorClass = "bg-slate-100 text-slate-500";

        switch (activity.type) {
            case 'course':
                Icon = BookOpen;
                colorClass = "bg-indigo-50 text-indigo-600";
                break;
            case 'category':
                Icon = Layers;
                colorClass = "bg-amber-50 text-amber-600";
                break;
            case 'user':
                Icon = UserPlus;
                colorClass = "bg-emerald-50 text-emerald-600";
                break;
            default:
                break;
        }

        return (
            <div className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors group">
                <div className="flex items-center gap-4">
                    {/* آیکون نوع فعالیت */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform ${colorClass}`}>
                        <Icon size={20} />
                    </div>

                    <div>
                        {/* عنوان فعالیت (مثلا: دوره جدید: لاراول) */}
                        <p className="font-bold text-slate-800 text-sm mb-1">{activity.title}</p>

                        {/* ✅ نمایش نام انجام دهنده کار (که از بک‌اند میاد) */}
                        <div className="flex items-center gap-1.5">
                            <UserCheck size={12} className="text-slate-400"/>
                            <p className="text-xs font-medium text-slate-500">
                                {activity.subtitle}
                            </p>
                        </div>
                    </div>
                </div>

                {/* زمان */}
                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100 flex items-center gap-1 self-start">
                    <Clock size={10} />
                    {new Date(activity.time).toLocaleDateString('fa-IR')}
                </span>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* بخش ۱: کارت‌های آماری */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="کل دانشجویان" value={stats?.stats.students || 0} icon={Users} color="text-blue-600" trendValue={stats?.stats.students_trend} />
                <StatCard title="دوره‌های فعال" value={stats?.stats.courses || 0} icon={BookOpen} color="text-violet-600" trendValue={stats?.stats.courses_trend} />
                <StatCard title="ارزش کل دوره‌ها" value={stats?.stats.revenue || 0} icon={DollarSign} color="text-emerald-600" subtitle="تومان" trendValue={stats?.stats.revenue_trend} />
                <StatCard title="دسته‌بندی‌ها" value={stats?.stats.categories || 0} icon={Layers} color="text-amber-600" trendValue={stats?.stats.categories_trend} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* بخش ۲: لاگ فعالیت‌های اخیر */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Activity className="text-indigo-500" size={20} />
                            فعالیت‌های اخیر سیستم
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {stats?.recent_activity?.length > 0 ? (
                            stats.recent_activity.map((activity) => (
                                <ActivityItem key={activity.id} activity={activity} />
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                    <Activity size={32} />
                                </div>
                                <p className="text-slate-400 text-sm">هنوز فعالیتی ثبت نشده است.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* بخش ۳: وضعیت سیستم */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                    <div>
                        <h3 className="text-xl font-black mb-2 relative z-10">وضعیت سیستم</h3>
                        <p className="text-indigo-100 text-sm mb-8 relative z-10">همه سرویس‌ها به درستی کار می‌کنند.</p>

                        <div className="space-y-3 relative z-10">
                            <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-colors cursor-default">
                                <span className="text-sm font-bold">دیتابیس</span>
                                <span className="text-xs font-black bg-emerald-400 text-emerald-900 px-2 py-0.5 rounded shadow-sm">متصل</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-colors cursor-default">
                                <span className="text-sm font-bold">آپلود فایل</span>
                                <span className="text-xs font-black bg-emerald-400 text-emerald-900 px-2 py-0.5 rounded shadow-sm">فعال</span>
                            </div>
                        </div>
                    </div>

                    <button className="w-full mt-8 py-3.5 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg relative z-10">
                        بررسی گزارش‌ها
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;