import { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Calendar,
    TrendingUp,
    DollarSign,
    Users,
    BookOpen,
    Filter,
    BarChart3,
    PieChart,
    LineChart,
    RefreshCw
} from 'lucide-react';
import { Button } from '../../components/UI';
import { APIErrorAlert } from '../../components/Alert';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { api } from '../../services/api';
import { formatPrice, formatDate } from '../../services/Libs';
import toast from 'react-hot-toast';

const ReportCard = ({ title, description, icon: Icon, onGenerate, loading = false }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Icon size={24} />
            </div>
            <Button
                onClick={onGenerate}
                disabled={loading}
                size="sm"
                className="!py-2 !px-3"
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-1" />
                ) : (
                    <Download size={14} className="ml-1" />
                )}
                تولید
            </Button>
        </div>
        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
);

const MetricCard = ({ title, value, subtitle, trend, icon: Icon, color = 'indigo' }) => {
    const colorClasses = {
        indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
        amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
        red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{value}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{title}</p>
            {subtitle && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
            )}
        </div>
    );
};

const FinancialReports = () => {
    const { handleError, clearError } = useErrorHandler();

    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [reportLoading, setReportLoading] = useState({});
    const [dateRange, setDateRange] = useState('month');
    const [reportType, setReportType] = useState('revenue');

    const [metrics, setMetrics] = useState({
        totalRevenue: 0,
        monthlyGrowth: 0,
        totalStudents: 0,
        studentGrowth: 0,
        totalCourses: 0,
        courseGrowth: 0,
        avgOrderValue: 0,
        avgGrowth: 0
    });

    const reports = [
        {
            id: 'revenue',
            title: 'گزارش درآمد',
            description: 'گزارش کامل درآمدها بر اساس دوره‌ها، روش پرداخت و بازه زمانی',
            icon: DollarSign
        },
        {
            id: 'students',
            title: 'گزارش دانشجویان',
            description: 'آمار ثبت‌نام دانشجویان، دوره‌های محبوب و نرخ تکمیل',
            icon: Users
        },
        {
            id: 'courses',
            title: 'گزارش دوره‌ها',
            description: 'عملکرد دوره‌ها، درآمد هر دوره و میزان رضایت دانشجویان',
            icon: BookOpen
        },
        {
            id: 'payments',
            title: 'گزارش پرداخت‌ها',
            description: 'تحلیل روش‌های پرداخت، تراکنش‌های موفق و ناموفق',
            icon: FileText
        },
        {
            id: 'trends',
            title: 'گزارش روندها',
            description: 'تحلیل روندهای فروش، پیش‌بینی درآمد و الگوهای خرید',
            icon: TrendingUp
        },
        {
            id: 'comprehensive',
            title: 'گزارش جامع',
            description: 'گزارش کامل شامل تمام بخش‌های مالی و آماری سیستم',
            icon: BarChart3
        }
    ];

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const fetchReportData = async () => {
        setLoading(true);
        setApiError(null);

        try {
            // دریافت آمار مالی از API
            const response = await api.get(`/admin/accounting/stats?range=${dateRange}`);
            const statsData = response.data.data;

            // به‌روزرسانی metrics با داده‌های واقعی
            setMetrics({
                totalRevenue: statsData.totalRevenue || 0,
                monthlyGrowth: statsData.revenueChange || 0,
                totalStudents: statsData.activeStudents || 0,
                studentGrowth: statsData.studentChange || 0,
                totalCourses: statsData.totalCourses || 0,
                courseGrowth: statsData.courseChange || 0,
                avgOrderValue: statsData.averageOrderValue || 0,
                avgGrowth: statsData.avgOrderValueChange || 0
            });

            toast.success('داده‌های گزارش بارگذاری شد');
        } catch (error) {
            console.error('Error fetching report data:', error);
            setApiError(error);
            handleError(error, false);

            // در صورت خطا، داده‌های خالی نمایش بده
            setMetrics({
                totalRevenue: 0,
                monthlyGrowth: 0,
                totalStudents: 0,
                studentGrowth: 0,
                totalCourses: 0,
                courseGrowth: 0,
                avgOrderValue: 0,
                avgGrowth: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async (reportId) => {
        setReportLoading(prev => ({ ...prev, [reportId]: true }));

        try {
            // ارسال درخواست تولید گزارش به API
            const response = await api.post('/admin/reports/generate', {
                type: reportId,
                dateRange,
                format: 'pdf'
            });

            const reportData = response.data.data;

            if (reportData.downloadUrl) {
                // دانلود مستقیم فایل
                const link = document.createElement('a');
                link.href = reportData.downloadUrl;
                link.download = reportData.fileName || `${reportId}_report_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success(`گزارش ${reports.find(r => r.id === reportId)?.title} دانلود شد`);
            } else if (reportData.reportId) {
                // گزارش در حال پردازش است
                toast.success('گزارش در حال تهیه است. پس از آماده شدن اطلاع‌رسانی خواهید شد');

                // می‌توانید polling برای بررسی وضعیت گزارش اضافه کنید
                checkReportStatus(reportData.reportId);
            }

        } catch (error) {
            console.error('Error generating report:', error);
            handleError(error);
            toast.error('خطا در تولید گزارش');
        } finally {
            setReportLoading(prev => ({ ...prev, [reportId]: false }));
        }
    };

    // بررسی وضعیت گزارش (اختیاری)
    const checkReportStatus = async (reportId) => {
        try {
            const response = await api.get(`/admin/reports/${reportId}`);
            const report = response.data.data;

            if (report.status === 'completed' && report.downloadUrl) {
                const link = document.createElement('a');
                link.href = report.downloadUrl;
                link.download = report.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success('گزارش آماده شد و دانلود شد');
            } else if (report.status === 'processing') {
                // ادامه polling بعد از 5 ثانیه
                setTimeout(() => checkReportStatus(reportId), 5000);
            } else if (report.status === 'failed') {
                toast.error('خطا در تهیه گزارش');
            }
        } catch (error) {
            console.error('Error checking report status:', error);
        }
    };

    const exportAllData = async () => {
        try {
            toast.loading('در حال تهیه گزارش جامع...');

            // شبیه‌سازی export
            await new Promise(resolve => setTimeout(resolve, 3000));

            toast.success('گزارش جامع آماده دانلود است');

            // شبیه‌سازی دانلود
            const link = document.createElement('a');
            link.href = '#';
            link.download = `comprehensive_report_${new Date().toISOString().split('T')[0]}.xlsx`;
            link.click();

        } catch (error) {
            handleError(error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">در حال بارگذاری گزارش‌ها...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Error Alert */}
            {apiError && (
                <APIErrorAlert
                    error={apiError}
                    onRetry={() => {
                        setApiError(null);
                        clearError();
                        fetchReportData();
                    }}
                    onClose={() => {
                        setApiError(null);
                        clearError();
                    }}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-2">
                        گزارش‌های مالی
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        تولید و دانلود گزارش‌های تفصیلی مالی و آماری
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                        <option value="week">هفته گذشته</option>
                        <option value="month">ماه گذشته</option>
                        <option value="quarter">سه ماه گذشته</option>
                        <option value="year">سال گذشته</option>
                        <option value="all">همه زمان‌ها</option>
                    </select>
                    <Button
                        variant="outline"
                        onClick={fetchReportData}
                        className="!py-2.5"
                    >
                        <RefreshCw size={18} className="ml-2" />
                        به‌روزرسانی
                    </Button>
                    <Button
                        onClick={exportAllData}
                        className="!py-2.5"
                    >
                        <Download size={18} className="ml-2" />
                        دانلود جامع
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard
                    title="کل درآمد"
                    value={formatPrice(metrics.totalRevenue) + ' تومان'}
                    subtitle="نسبت به دوره قبل"
                    trend={metrics.monthlyGrowth}
                    icon={DollarSign}
                    color="emerald"
                />
                <MetricCard
                    title="تعداد دانشجویان"
                    value={metrics.totalStudents.toLocaleString()}
                    subtitle="دانشجوی فعال"
                    trend={metrics.studentGrowth}
                    icon={Users}
                    color="indigo"
                />
                <MetricCard
                    title="تعداد دوره‌ها"
                    value={metrics.totalCourses.toString()}
                    subtitle="دوره منتشر شده"
                    trend={metrics.courseGrowth}
                    icon={BookOpen}
                    color="amber"
                />
                <MetricCard
                    title="میانگین خرید"
                    value={formatPrice(metrics.avgOrderValue) + ' تومان'}
                    subtitle="به ازای هر دانشجو"
                    trend={metrics.avgGrowth}
                    icon={TrendingUp}
                    color="red"
                />
            </div>

            {/* Charts Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">
                            روند درآمد
                        </h3>
                        <LineChart className="text-slate-400" size={20} />
                    </div>
                    <div className="h-32 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <div className="text-center">
                            <LineChart size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-xs">نمودار خطی درآمد</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">
                            دوره‌های پرفروش
                        </h3>
                        <BarChart3 className="text-slate-400" size={20} />
                    </div>
                    <div className="h-32 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <div className="text-center">
                            <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-xs">نمودار ستونی فروش</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">
                            روش‌های پرداخت
                        </h3>
                        <PieChart className="text-slate-400" size={20} />
                    </div>
                    <div className="h-32 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <div className="text-center">
                            <PieChart size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-xs">نمودار دایره‌ای پرداخت</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Generation */}
            <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6">
                    تولید گزارش‌های تخصصی
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report) => (
                        <ReportCard
                            key={report.id}
                            title={report.title}
                            description={report.description}
                            icon={report.icon}
                            onGenerate={() => generateReport(report.id)}
                            loading={reportLoading[report.id]}
                        />
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">
                            عملیات سریع
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                            دسترسی سریع به پرکاربردترین گزارش‌ها
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => generateReport('revenue')}
                            disabled={reportLoading.revenue}
                            className="!py-2"
                        >
                            <DollarSign size={16} className="ml-2" />
                            گزارش درآمد
                        </Button>
                        <Button
                            onClick={() => generateReport('comprehensive')}
                            disabled={reportLoading.comprehensive}
                            className="!py-2"
                        >
                            <FileText size={16} className="ml-2" />
                            گزارش جامع
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialReports;