import { useEffect, useState } from 'react';
import { Users, BookOpen, TrendingUp, TrendingDown, DollarSign, Activity, Layers, Minus, Clock, UserPlus, Loader2, UserCheck, CreditCard, FileText, PieChart } from 'lucide-react';
import { api } from '../../services/api';
import { formatPrice, formatDate } from '../../services/Libs';
import { useAuth } from '../../context/AuthContext';

const DashboardHome = () => {
    const [stats, setStats] = useState({
        stats: {
            students: 0,
            students_trend: 0,
            courses: 0,
            courses_trend: 0,
            revenue: 0,
            revenue_trend: 0,
            categories: 0,
            categories_trend: 0
        },
        recent_activity: []
    });
    const [financialStats, setFinancialStats] = useState({
        dailyRevenue: 0,
        successfulTransactions: 0,
        successRate: 0,
        recentTransactions: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // دریافت آمار کلی داشبورد
                const dashboardResponse = await api.get('/Dashboard');
                setStats(dashboardResponse.data);

                // دریافت آمار مالی
                const financialResponse = await api.get('/admin/accounting/stats');
                const financialData = financialResponse.data.data;

                // دریافت تراکنش‌های اخیر
                const transactionsResponse = await api.get('/admin/accounting/transactions?page=1&pageSize=5');
                const recentTransactions = transactionsResponse.data.data || [];

                // محاسبه آمار مالی روزانه
                const today = new Date();
                const todayTransactions = recentTransactions.filter(t => {
                    const transactionDate = new Date(t.createdAt);
                    return transactionDate.toDateString() === today.toDateString();
                });

                const dailyRevenue = todayTransactions
                    .filter(t => t.status === 1) // فقط تراکنش‌های موفق
                    .reduce((sum, t) => sum + (t.amount || 0), 0);

                const successfulTransactions = todayTransactions.filter(t => t.status === 1).length;
                const totalTransactions = todayTransactions.length;
                const successRate = totalTransactions > 0 ? Math.round((successfulTransactions / totalTransactions) * 100) : 0;

                setFinancialStats({
                    dailyRevenue,
                    successfulTransactions,
                    successRate,
                    recentTransactions: recentTransactions.slice(0, 5).map(t => ({
                        id: t.transactionId || t.id,
                        studentName: t.studentName || 'نامشخص',
                        courseName: t.courseName || 'نامشخص',
                        amount: t.amount || 0,
                        status: getTransactionStatus(t.status),
                        date: t.createdAt || new Date().toISOString(),
                        gateway: t.gateway || null
                    }))
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                // در صورت خطا، از داده‌های پیش‌فرض استفاده کن
                setStats({
                    stats: {
                        students: 0,
                        students_trend: 0,
                        courses: 0,
                        courses_trend: 0,
                        revenue: 0,
                        revenue_trend: 0,
                        categories: 0,
                        categories_trend: 0
                    },
                    recent_activity: []
                });
                setFinancialStats({
                    dailyRevenue: 0,
                    successfulTransactions: 0,
                    successRate: 0,
                    recentTransactions: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // تبدیل وضعیت عددی به متن
    const getTransactionStatus = (status) => {
        switch (status) {
            case 0: return 'pending';
            case 1: return 'completed';
            case 2: return 'failed';
            case 3: return 'refunded';
            case 4: return 'cancelled';
            default: return 'pending';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="animate-spin text-primary-600 dark:text-primary-400" size={40} />
            </div>
        );
    }

    // --- کامپوننت کارت آمار (Stat Card) ---
    const StatCard = ({ title, value, icon: Icon, color, trendValue, subtitle }) => {
        const isPositive = trendValue > 0;
        const isNegative = trendValue < 0;

        // رنگ‌های حالت خنثی (تاریک/روشن)
        let trendColorClass = "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
        let TrendIcon = Minus;
        let trendLabel = "بدون تغییر";

        if (isPositive) {
            trendColorClass = "text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/30 border-secondary-100 dark:border-secondary-800";
            TrendIcon = TrendingUp;
            trendLabel = `+${trendValue}%`;
        } else if (isNegative) {
            trendColorClass = "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800";
            TrendIcon = TrendingDown;
            trendLabel = `${trendValue}%`;
        }

        // استخراج کلاس رنگی برای پس‌زمینه آیکون در حالت روشن
        // در حالت دارک، کمی شفاف‌ترش می‌کنیم
        const iconBgColor = color.replace('text-', 'bg-').replace('600', '50');

        return (
            <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 lg:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                {/* افکت نور پس‌زمینه */}
                <div className={`absolute -right-4 -top-4 sm:-right-6 sm:-top-6 w-16 h-16 sm:w-24 sm:h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ${color.replace('text-', 'bg-')}`}></div>

                <div className="flex items-start justify-between mb-3 sm:mb-4 relative z-10">
                    <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl ${iconBgColor} dark:bg-slate-800 ${color} dark:text-slate-200 shadow-sm group-hover:scale-110 transition-transform`}>
                        {/* نکته: رنگ آیکون در حالت دارک کمی روشن‌تر می‌شود */}
                        <Icon size={window.innerWidth >= 640 ? 24 : 20} className="dark:text-white" />
                    </div>

                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border ${trendColorClass}`}>
                        {trendLabel} <TrendIcon size={12} />
                    </span>
                </div>

                <div className="relative z-10">
                    <h3 className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-bold mb-1">{title}</h3>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                        {formatPrice(value)}
                        {subtitle && <span className="text-xs text-slate-400 dark:text-slate-500 font-normal mr-1">{subtitle}</span>}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 sm:mt-2">نسبت به ماه گذشته</p>
                </div>
            </div>
        );
    };

    // --- کامپوننت آیتم لیست فعالیت (Activity Item) ---
    const ActivityItem = ({ activity }) => {
        let Icon = Activity;
        let colorClass = "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400";

        switch (activity.type) {
            case 'course':
                Icon = BookOpen;
                colorClass = "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400";
                break;
            case 'category':
                Icon = Layers;
                colorClass = "bg-secondary-50 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400";
                break;
            case 'user':
                Icon = UserPlus;
                colorClass = "bg-secondary-50 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400";
                break;
            default:
                break;
        }

        return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors group gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform flex-shrink-0 ${colorClass}`}>
                        <Icon size={window.innerWidth >= 640 ? 20 : 18} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1 truncate">{activity.title}</p>
                        <div className="flex items-center gap-1.5">
                            <UserCheck size={12} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                                {activity.subtitle}
                            </p>
                        </div>
                    </div>
                </div>

                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center gap-1 self-start sm:self-center flex-shrink-0">
                    <Clock size={10} />
                    {formatDate(activity.time)}
                </span>
            </div>
        );
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* بخش ۱: کارت‌های آماری */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <StatCard title="کل دانشجویان" value={stats?.stats?.students || 0} icon={Users} color="text-blue-600" trendValue={stats?.stats?.students_trend || 0} />
                <StatCard title="دوره‌های فعال" value={stats?.stats?.courses || 0} icon={BookOpen} color="text-violet-600" trendValue={stats?.stats?.courses_trend || 0} />
                <StatCard title="ارزش کل دوره‌ها" value={stats?.stats?.revenue || 0} icon={DollarSign} color="text-emerald-600" subtitle="تومان" trendValue={stats?.stats?.revenue_trend || 0} />
                <StatCard title="دسته‌بندی‌ها" value={stats?.stats?.categories || 0} icon={Layers} color="text-amber-600" trendValue={stats?.stats?.categories_trend || 0} />
            </div>

            {/* بخش حسابداری */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
                    <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <DollarSign className="text-emerald-500 dark:text-emerald-400" size={20} />
                        خلاصه مالی
                    </h3>
                    <button className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-3 py-1 rounded-lg transition-colors">
                        مشاهده کامل
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* درآمد امروز */}
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-4 sm:p-6 border border-emerald-100 dark:border-emerald-800/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                                <DollarSign size={window.innerWidth >= 640 ? 24 : 20} />
                            </div>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-200 mb-1">
                            {formatPrice(financialStats.dailyRevenue)} تومان
                        </h4>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">درآمد امروز</p>
                    </div>

                    {/* تراکنش‌های موفق */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-4 sm:p-6 border border-blue-100 dark:border-blue-800/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                <CreditCard size={window.innerWidth >= 640 ? 24 : 20} />
                            </div>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-black text-blue-800 dark:text-blue-200 mb-1">
                            {financialStats.successfulTransactions}
                        </h4>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">تراکنش موفق امروز</p>
                    </div>

                    {/* نرخ موفقیت */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-4 sm:p-6 border border-purple-100 dark:border-purple-800/50 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                                <PieChart size={window.innerWidth >= 640 ? 24 : 20} />
                            </div>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-black text-purple-800 dark:text-purple-200 mb-1">
                            {financialStats.successRate}%
                        </h4>
                        <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">نرخ موفقیت پرداخت</p>
                    </div>
                </div>

                {/* تراکنش‌های اخیر */}
                <div className="mt-6">
                    <h4 className="text-base sm:text-lg font-black text-slate-800 dark:text-white mb-4">تراکنش‌های اخیر</h4>
                    <div className="space-y-3">
                        {financialStats.recentTransactions.length > 0 ? (
                            financialStats.recentTransactions.map((transaction) => (
                                <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${transaction.status === 'completed' ? 'bg-emerald-500' :
                                            transaction.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                                            }`}>
                                            <CreditCard size={16} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-slate-800 dark:text-white text-sm truncate">{transaction.studentName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{transaction.courseName}</p>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right flex-shrink-0">
                                        <p className="font-black text-slate-800 dark:text-white text-sm">
                                            {formatPrice(transaction.amount)} تومان
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {formatDate(transaction.date)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 sm:py-8">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300 dark:text-slate-600">
                                    <CreditCard size={window.innerWidth >= 640 ? 32 : 24} />
                                </div>
                                <p className="text-slate-400 dark:text-slate-500 text-sm">هیچ تراکنشی یافت نشد</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* بخش ۲: لاگ فعالیت‌های اخیر */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
                        <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <Activity className="text-indigo-500 dark:text-indigo-400" size={20} />
                            فعالیت‌های اخیر سیستم
                        </h3>
                        <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1 rounded-lg transition-colors">
                            مشاهده همه
                        </button>
                    </div>

                    <div className="space-y-3">
                        {stats?.recent_activity?.length > 0 ? (
                            stats.recent_activity.map((activity) => (
                                <ActivityItem key={activity.id} activity={activity} />
                            ))
                        ) : (
                            <div className="text-center py-8 sm:py-10">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300 dark:text-slate-600">
                                    <Activity size={window.innerWidth >= 640 ? 32 : 24} />
                                </div>
                                <p className="text-slate-400 dark:text-slate-500 text-sm">هنوز فعالیتی ثبت نشده است.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* بخش ۳: وضعیت سیستم */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-900 dark:to-violet-950 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 text-white shadow-xl shadow-indigo-500/20 dark:shadow-none relative overflow-hidden flex flex-col justify-between min-h-[300px] sm:min-h-[400px]">
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-black/10 rounded-full -ml-8 sm:-ml-10 -mb-8 sm:-mb-10 blur-2xl"></div>

                    <div>
                        <h3 className="text-lg sm:text-xl font-black mb-2 relative z-10">وضعیت سیستم</h3>
                        <p className="text-indigo-100 dark:text-indigo-300 text-sm mb-6 sm:mb-8 relative z-10">همه سرویس‌ها به درستی کار می‌کنند.</p>

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

                    <div className="space-y-4 relative z-10 mt-6">
                        <button className="w-full py-3 sm:py-3.5 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 rounded-xl font-bold text-sm hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors shadow-lg">
                            بررسی گزارش‌ها
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;