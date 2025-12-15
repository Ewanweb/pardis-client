import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    BookOpen,
    Calendar,
    CreditCard,
    PieChart,
    BarChart3,
    Download,
    Filter,
    Search,
    Eye,
    RefreshCw
} from 'lucide-react';
import { Button } from '../../components/UI';
import { APIErrorAlert } from '../../components/Alert';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { api } from '../../services/api';
import { formatPrice, formatDate } from '../../services/Libs';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, change, changeType, icon: Icon, color = 'indigo' }) => {
    const colorClasses = {
        indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
        amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
        red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon size={24} />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 text-sm font-bold ${changeType === 'increase' ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                        {changeType === 'increase' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {change}%
                    </div>
                )}
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{value}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
        </div>
    );
};

const TransactionRow = ({ transaction, onView }) => (
    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${transaction.status === 'completed' ? 'bg-emerald-500' :
                    transaction.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                    }`}>
                    <CreditCard size={16} />
                </div>
                <div>
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{transaction.id}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{transaction.type}</p>
                </div>
            </div>
        </td>
        <td className="px-6 py-4">
            <p className="font-bold text-slate-800 dark:text-white text-sm">{transaction.studentName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{transaction.courseName}</p>
        </td>
        <td className="px-6 py-4">
            <span className="font-black text-slate-800 dark:text-white">
                {formatPrice(transaction.amount)} تومان
            </span>
        </td>
        <td className="px-6 py-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${transaction.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                transaction.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                {transaction.status === 'completed' ? 'تکمیل شده' :
                    transaction.status === 'pending' ? 'در انتظار' : 'لغو شده'}
            </span>
        </td>
        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
            {formatDate(transaction.date)}
        </td>
        <td className="px-6 py-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onView(transaction)}
                className="!py-2 !px-3"
            >
                <Eye size={14} className="ml-1" />
                جزئیات
            </Button>
        </td>
    </tr>
);

const Accounting = () => {
    const navigate = useNavigate();
    const { handleError, clearError } = useErrorHandler();

    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalTransactions: 0,
        activeStudents: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showTransactionModal, setShowTransactionModal] = useState(false);

    // Mock data - در پروژه واقعی از API دریافت می‌شود
    const mockStats = {
        totalRevenue: 125000000,
        monthlyRevenue: 15000000,
        totalTransactions: 342,
        activeStudents: 156,
        revenueChange: 12.5,
        transactionChange: 8.3,
        studentChange: -2.1
    };

    const mockTransactions = [
        {
            id: 'TXN-001',
            studentName: 'علی احمدی',
            courseName: 'دوره React.js پیشرفته',
            amount: 2500000,
            status: 'completed',
            type: 'course_enrollment',
            date: '2024-12-14T10:30:00Z',
            paymentMethod: 'online',
            gateway: 'zarinpal'
        },
        {
            id: 'TXN-002',
            studentName: 'مریم کریمی',
            courseName: 'دوره Node.js مقدماتی',
            amount: 1800000,
            status: 'pending',
            type: 'course_enrollment',
            date: '2024-12-14T09:15:00Z',
            paymentMethod: 'online',
            gateway: 'zarinpal'
        },
        {
            id: 'TXN-003',
            studentName: 'حسن رضایی',
            courseName: 'دوره Python برای مبتدیان',
            amount: 2200000,
            status: 'completed',
            type: 'course_enrollment',
            date: '2024-12-13T16:45:00Z',
            paymentMethod: 'wallet',
            gateway: null
        },
        {
            id: 'TXN-004',
            studentName: 'فاطمه محمدی',
            courseName: 'دوره طراحی UI/UX',
            amount: 3000000,
            status: 'failed',
            type: 'course_enrollment',
            date: '2024-12-13T14:20:00Z',
            paymentMethod: 'online',
            gateway: 'zarinpal'
        },
        {
            id: 'TXN-005',
            studentName: 'امیر حسینی',
            courseName: 'دوره JavaScript پیشرفته',
            amount: 2800000,
            status: 'completed',
            type: 'course_enrollment',
            date: '2024-12-12T11:30:00Z',
            paymentMethod: 'online',
            gateway: 'zarinpal'
        }
    ];

    useEffect(() => {
        fetchAccountingData();
    }, []);

    useEffect(() => {
        filterTransactions();
    }, [transactions, searchTerm, statusFilter, dateRange]);

    const fetchAccountingData = async () => {
        setLoading(true);
        setApiError(null);

        try {
            // دریافت آمار حسابداری از API
            const [statsResponse, transactionsResponse] = await Promise.all([
                api.get('/admin/accounting/stats'),
                api.get('/admin/accounting/transactions?page=1&pageSize=50')
            ]);

            // پردازش آمار
            const statsData = statsResponse.data.data;
            setStats({
                totalRevenue: statsData.totalRevenue || 0,
                monthlyRevenue: statsData.monthlyRevenue || 0,
                totalTransactions: statsData.totalTransactions || 0,
                activeStudents: statsData.activeStudents || 0,
                revenueChange: statsData.revenueChange || 0,
                transactionChange: statsData.transactionChange || 0,
                studentChange: statsData.studentChange || 0
            });

            // پردازش تراکنش‌ها
            const transactionsData = transactionsResponse.data.data || [];
            const processedTransactions = transactionsData.map(t => ({
                id: t.transactionId || t.id,
                studentName: t.studentName || 'نامشخص',
                courseName: t.courseName || 'نامشخص',
                amount: t.amount || 0,
                status: getTransactionStatus(t.status),
                type: 'course_enrollment',
                date: t.createdAt || new Date().toISOString(),
                paymentMethod: getPaymentMethod(t.method),
                gateway: t.gateway || null,
                description: t.description || ''
            }));

            setTransactions(processedTransactions);
            toast.success('داده‌های حسابداری بارگذاری شد');
        } catch (error) {
            console.error('Error fetching accounting data:', error);
            setApiError(error);
            handleError(error, false);

            // در صورت خطا، از داده‌های نمونه استفاده کن
            setStats(mockStats);
            setTransactions(mockTransactions);
        } finally {
            setLoading(false);
        }
    };

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

    // تبدیل روش پرداخت عددی به متن
    const getPaymentMethod = (method) => {
        switch (method) {
            case 0: return 'online';
            case 1: return 'wallet';
            case 2: return 'cash';
            case 3: return 'bank_transfer';
            default: return 'online';
        }
    };

    const filterTransactions = () => {
        let filtered = [...transactions];

        // فیلتر جستجو
        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // فیلتر وضعیت
        if (statusFilter !== 'all') {
            filtered = filtered.filter(t => t.status === statusFilter);
        }

        // فیلتر تاریخ
        if (dateRange !== 'all') {
            const now = new Date();
            const filterDate = new Date();

            switch (dateRange) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
            }

            filtered = filtered.filter(t => new Date(t.date) >= filterDate);
        }

        setFilteredTransactions(filtered);
    };

    const handleViewTransaction = (transaction) => {
        setSelectedTransaction(transaction);
        setShowTransactionModal(true);
    };

    const exportTransactions = () => {
        // شبیه‌سازی export
        toast.success('گزارش در حال دانلود است...');

        // در پروژه واقعی، فایل CSV یا Excel تولید می‌شود
        const csvContent = "data:text/csv;charset=utf-8,"
            + "شناسه,نام دانشجو,نام دوره,مبلغ,وضعیت,تاریخ\n"
            + filteredTransactions.map(t =>
                `${t.id},${t.studentName},${t.courseName},${t.amount},${t.status},${formatDate(t.date)}`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">در حال بارگذاری داده‌های حسابداری...</p>
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
                        fetchAccountingData();
                    }}
                    onClose={() => {
                        setApiError(null);
                        clearError();
                    }}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">
                        حسابداری و مالی
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        مدیریت درآمدها، تراکنش‌ها و گزارش‌های مالی
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchAccountingData}
                        className="!py-2.5"
                    >
                        <RefreshCw size={18} className="ml-2" />
                        به‌روزرسانی
                    </Button>
                    <Button
                        onClick={exportTransactions}
                        className="!py-2.5"
                    >
                        <Download size={18} className="ml-2" />
                        دانلود گزارش
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="کل درآمد"
                    value={formatPrice(stats.totalRevenue) + ' تومان'}
                    change={stats.revenueChange}
                    changeType="increase"
                    icon={DollarSign}
                    color="emerald"
                />
                <StatCard
                    title="درآمد ماهانه"
                    value={formatPrice(stats.monthlyRevenue) + ' تومان'}
                    change={stats.revenueChange}
                    changeType="increase"
                    icon={TrendingUp}
                    color="indigo"
                />
                <StatCard
                    title="کل تراکنش‌ها"
                    value={stats.totalTransactions.toLocaleString()}
                    change={stats.transactionChange}
                    changeType="increase"
                    icon={CreditCard}
                    color="amber"
                />
                <StatCard
                    title="دانشجویان فعال"
                    value={stats.activeStudents.toLocaleString()}
                    change={Math.abs(stats.studentChange)}
                    changeType={stats.studentChange > 0 ? "increase" : "decrease"}
                    icon={Users}
                    color="red"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">
                            نمودار درآمد ماهانه
                        </h3>
                        <BarChart3 className="text-slate-400" size={20} />
                    </div>
                    <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <div className="text-center">
                            <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">نمودار درآمد ماهانه</p>
                            <p className="text-xs mt-1">در نسخه کامل پیاده‌سازی می‌شود</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">
                            توزیع روش‌های پرداخت
                        </h3>
                        <PieChart className="text-slate-400" size={20} />
                    </div>
                    <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <div className="text-center">
                            <PieChart size={48} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">نمودار دایره‌ای پرداخت‌ها</p>
                            <p className="text-xs mt-1">در نسخه کامل پیاده‌سازی می‌شود</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">
                            تراکنش‌های اخیر
                        </h3>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            {filteredTransactions.length} تراکنش
                        </span>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="جستجو در تراکنش‌ها..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        >
                            <option value="all">همه وضعیت‌ها</option>
                            <option value="completed">تکمیل شده</option>
                            <option value="pending">در انتظار</option>
                            <option value="failed">لغو شده</option>
                        </select>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        >
                            <option value="all">همه تاریخ‌ها</option>
                            <option value="today">امروز</option>
                            <option value="week">هفته گذشته</option>
                            <option value="month">ماه گذشته</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    تراکنش
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    دانشجو / دوره
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    مبلغ
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    وضعیت
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    تاریخ
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    عملیات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredTransactions.map((transaction) => (
                                <TransactionRow
                                    key={transaction.id}
                                    transaction={transaction}
                                    onView={handleViewTransaction}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredTransactions.length === 0 && (
                    <div className="p-12 text-center">
                        <CreditCard className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={48} />
                        <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">
                            تراکنشی یافت نشد
                        </h3>
                        <p className="text-slate-400 dark:text-slate-500">
                            با فیلترهای انتخاب شده تراکنشی موجود نیست
                        </p>
                    </div>
                )}
            </div>

            {/* Transaction Detail Modal */}
            {showTransactionModal && selectedTransaction && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-xl">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white">
                                جزئیات تراکنش
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    شناسه تراکنش
                                </label>
                                <p className="text-slate-800 dark:text-white font-bold mt-1">
                                    {selectedTransaction.id}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    نام دانشجو
                                </label>
                                <p className="text-slate-800 dark:text-white font-bold mt-1">
                                    {selectedTransaction.studentName}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    نام دوره
                                </label>
                                <p className="text-slate-800 dark:text-white font-bold mt-1">
                                    {selectedTransaction.courseName}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    مبلغ
                                </label>
                                <p className="text-slate-800 dark:text-white font-black text-lg mt-1">
                                    {formatPrice(selectedTransaction.amount)} تومان
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    روش پرداخت
                                </label>
                                <p className="text-slate-800 dark:text-white font-bold mt-1">
                                    {selectedTransaction.paymentMethod === 'online' ? 'آنلاین' : 'کیف پول'}
                                    {selectedTransaction.gateway && ` (${selectedTransaction.gateway})`}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    تاریخ
                                </label>
                                <p className="text-slate-800 dark:text-white font-bold mt-1">
                                    {formatDate(selectedTransaction.date)}
                                </p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                variant="outline"
                                onClick={() => setShowTransactionModal(false)}
                                className="w-full"
                            >
                                بستن
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Accounting;