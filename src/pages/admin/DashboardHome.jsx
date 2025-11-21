import React from 'react';
import { Users, BookOpen, Award, Clock, TrendingUp, DollarSign, Activity, ChevronLeft } from 'lucide-react';

const DashboardHome = () => {
    // کامپوننت کارت آمار (داخلی)
    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ${color.replace('text-', 'bg-')}`}></div>

            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-2xl ${color.replace('text-', 'bg-').replace('600', '50')} ${color} shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                        {trend} <TrendingUp size={12} />
                    </span>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-slate-400 text-sm font-bold mb-1">{title}</h3>
                <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* بخش آمار کلی */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="کل دانشجویان"
                    value="۲,۴۵۰"
                    icon={Users}
                    color="text-blue-600"
                    trend="+۱۲٪"
                />
                <StatCard
                    title="دوره‌های فعال"
                    value="۴۵"
                    icon={BookOpen}
                    color="text-violet-600"
                    trend="+۵"
                />
                <StatCard
                    title="درآمد این ماه"
                    value="۸۵ م"
                    icon={DollarSign}
                    color="text-emerald-600"
                    trend="+۱۸٪"
                />
                <StatCard
                    title="ساعات آموزش"
                    value="۱۲۰"
                    icon={Clock}
                    color="text-amber-600"
                />
            </div>

            {/* بخش دو ستونه پایین */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* فعالیت‌های اخیر (بزرگتر) */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Activity className="text-indigo-500" size={20} />
                            فعالیت‌های اخیر
                        </h3>
                        <button className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">
                            مشاهده همه
                        </button>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs shadow-sm group-hover:scale-110 transition-transform">
                                        <Users size={16} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">کاربر جدید ثبت نام کرد</p>
                                        <p className="text-xs text-slate-400 mt-0.5">علی محمدی در دوره لاراول</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">
                                    ۲ دقیقه پیش
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* دسترسی سریع (کوچکتر) */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                    {/* Decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                    <h3 className="text-xl font-black mb-2 relative z-10">پنل مدیریت</h3>
                    <p className="text-indigo-100 text-sm mb-8 relative z-10">وضعیت سیستم پایدار است و همه سرویس‌ها فعال هستند.</p>

                    <div className="space-y-3 relative z-10">
                        <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                            <span className="text-sm font-bold">فضای سرور</span>
                            <span className="text-xs font-black bg-white text-indigo-600 px-2 py-0.5 rounded">45%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                            <span className="text-sm font-bold">پهنای باند</span>
                            <span className="text-xs font-black bg-emerald-400 text-emerald-900 px-2 py-0.5 rounded">خوب</span>
                        </div>
                    </div>

                    <button className="w-full mt-8 py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg">
                        بررسی گزارش‌ها
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;