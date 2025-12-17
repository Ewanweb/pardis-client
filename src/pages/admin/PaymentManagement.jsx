import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Wallet,
    RefreshCw,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    Download,
    AlertTriangle,
    DollarSign,
    TrendingUp,
    Users,
    Calendar
} from 'lucide-react';
import { Button } from '../../components/UI';
import { APIErrorAlert } from '../../components/Alert';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { api } from '../../services/api';
import { formatPrice, formatDate } from '../../services/Libs';
import toast from 'react-hot-toast';

const PaymentStatusBadge = ({ status }) => {
    const statusConfig = {
        completed: {
            label: 'تکمیل شده',
            className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
            icon: CheckCircle2
        },
        pending: {
            label: 'در انتظار',
            className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
            icon: Clock
        },
        failed: {
            label: 'ناموفق',
            className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
            icon: XCircle
        },
        refunded: {
            label: 'بازگشت داده شده',
            className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
            icon: RefreshCw
        }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${config.className}`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
};

const PaymentMethodBadge = ({ method, gateway }) => {
    const methodConfig = {
        online: {
            label: 'آنلاین',
            className: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
            icon: CreditCard
        },
        wallet: {
            label: 'کیف پول',
            className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
            icon: Wallet
        }
    };

    const config = methodConfig[method] || methodConfig.online;
    const Icon = config.icon;

    return (
        <div className="flex flex-col gap-1">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${config.className}`}>
                <Icon size={12} />
                {config.label}
            </span>
            {gateway && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                    {gateway}
                </span>
            )}
        </div>
    );
};

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
                        <TrendingUp size={16} className={changeType === 'decrease' ? 'rotate-180' : ''} />
                        {change}%
                    </div>
                )}
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{value}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
        </div>
    );
};

const PaymentRow = ({ payment, onView, onRefund }) => (
    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${payment.status === 'completed' ? 'bg-emerald-500' :
                    payment.status === 'pending' ? 'bg-amber-500' :
                        payment.status === 'refunded' ? 'bg-blue-500' : 'bg-red-500'
                    }`}>
                    {payment.method === 'online' ? <CreditCard size={16} /> : <Wallet size={16} />}
                </div>
                <div>
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{payment.transactionId}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{payment.referenceId}</p>
                </div>
            </div>
        </td>
        <td className="px-6 py-4">
            <p className="font-bold text-slate-800 dark:text-white text-sm">{payment.studentName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{payment.studentEmail}</p>
        </td>
        <td className="px-6 py-4">
            <p className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">{payment.courseName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{payment.courseCategory}</p>
        </td>
        <td className="px-6 py-4">
            <span className="font-black text-slate-800 dark:text-white">
                {formatPrice(payment.amount)} تومان
            </span>
        </td>
        <td className="px-6 py-4">
            <PaymentMethodBadge method={payment.method} gateway={payment.gateway} />
        </td>
        <td className="px-6 py-4">
            <PaymentStatusBadge status={payment.status} />
        </td>
        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
            {formatDate(payment.createdAt)}
        </td>
        <td className="px-6 py-4">
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(payment)}
                    className="!py-1.5 !px-2"
                >
                    <Eye size={12} className="ml-1" />
                    جزئیات
                </Button>
                {payment.status === 'completed' && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRefund(payment)}
                        className="!py-1.5 !px-2 !text-red-600 !border-red-200 hover:!bg-red-50"
                    >
                        <RefreshCw size={12} className="ml-1" />
                        بازگشت
                    </Button>
                )}
            </div>
        </td>
    </tr>
);

const PaymentManagement = () => {
    const { handleError, clearError } = useErrorHandler();

    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundReason, setRefundReason] = useState('');

    const [stats, setStats] = useState({
        totalPayments: 0,
        successfulPayments: 0,
        totalAmount: 0,
        successRate: 0
    });



    useEffect(() => {
        fetchPayments();
    }, []);

    useEffect(() => {
        filterPayments();
    }, [payments, searchTerm, statusFilter, methodFilter, dateRange]);

    const fetchPayments = async () => {
        setLoading(true);
        setApiError(null);

        try {
            // دریافت لیست تراکنش‌ها از API
            const response = await api.get('/admin/accounting/transactions?page=1&pageSize=100');
            const transactionsData = response.data.data || [];

            // تبدیل داده‌های API به فرمت مورد نیاز
            const processedPayments = transactionsData.map(t => ({
                id: t.id || t.transactionId,
                transactionId: t.transactionId || t.id,
                studentName: t.studentName || 'نامشخص',
                studentEmail: t.studentEmail || '',
                courseName: t.courseName || 'نامشخص',
                amount: t.amount || 0,
                status: getTransactionStatus(t.status),
                method: getPaymentMethod(t.method),
                gateway: t.gateway || null,
                gatewayTransactionId: t.gatewayTransactionId || null,
                date: t.createdAt || new Date().toISOString(),
                description: t.description || '',
                refundReason: t.refundReason || null,
                refundedAt: t.refundedAt || null,
                refundAmount: t.refundAmount || 0
            }));

            setPayments(processedPayments);

            // محاسبه آمار
            const totalPayments = processedPayments.length;
            const successfulPayments = processedPayments.filter(p => p.status === 'completed').length;
            const totalAmount = processedPayments
                .filter(p => p.status === 'completed')
                .reduce((sum, p) => sum + p.amount, 0);
            const successRate = totalPayments > 0 ? (successfulPayments / totalPayments * 100) : 0;

            setStats({
                totalPayments,
                successfulPayments,
                totalAmount,
                successRate: Math.round(successRate * 10) / 10
            });

            toast.success('اطلاعات پرداخت‌ها بارگذاری شد');
        } catch (error) {
            console.error('Error fetching payments:', error);
            setApiError(error);
            handleError(error, false);

            // در صورت خطا، داده‌های خالی نمایش بده
            setPayments([]);
            setStats({
                totalPayments: 0,
                successfulPayments: 0,
                totalAmount: 0,
                successRate: 0
            });
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

    const filterPayments = () => {
        let filtered = [...payments];

        // فیلتر جستجو
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // فیلتر وضعیت
        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        // فیلتر روش پرداخت
        if (methodFilter !== 'all') {
            filtered = filtered.filter(p => p.method === methodFilter);
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

            filtered = filtered.filter(p => new Date(p.createdAt) >= filterDate);
        }

        setFilteredPayments(filtered);
    };

    const handleViewPayment = (payment) => {
        setSelectedPayment(payment);
        setShowPaymentModal(true);
    };

    const handleRefundPayment = (payment) => {
        setSelectedPayment(payment);
        setShowRefundModal(true);
    };

    const processRefund = async () => {
        if (!refundReason.trim()) {
            toast.error('لطفاً دلیل بازگشت وجه را وارد کنید');
            return;
        }

        try {
            // ارسال درخواست بازگشت وجه به API
            await api.post(`/admin/accounting/transactions/${selectedPayment.id}/refund`, {
                reason: refundReason.trim(),
                refundAmount: selectedPayment.amount
            });

            // به‌روزرسانی وضعیت پرداخت در state محلی
            setPayments(prev => prev.map(p =>
                p.id === selectedPayment.id
                    ? {
                        ...p,
                        status: 'refunded',
                        refundedAt: new Date().toISOString(),
                        refundReason: refundReason.trim(),
                        refundAmount: selectedPayment.amount
                    }
                    : p
            ));

            toast.success('بازگشت وجه با موفقیت انجام شد');
            setShowRefundModal(false);
            setRefundReason('');

            // به‌روزرسانی آمار
            fetchPayments();

        } catch (error) {
            console.error('Error processing refund:', error);
            handleError(error);
            toast.error('خطا در پردازش بازگشت وجه');
        }
    };

    const exportPayments = () => {
        toast.success('گزارش پرداخت‌ها در حال دانلود است...');

        const csvContent = "data:text/csv;charset=utf-8,"
            + "شناسه تراکنش,نام دانشجو,نام دوره,مبلغ,روش پرداخت,وضعیت,تاریخ\n"
            + filteredPayments.map(p =>
                `${p.transactionId},${p.studentName},${p.courseName},${p.amount},${p.method},${p.status},${formatDate(p.createdAt)}`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `payments_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">در حال بارگذاری پرداخت‌ها...</p>
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
                        fetchPayments();
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
                        مدیریت پرداخت‌ها
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        مدیریت و نظارت بر تمام تراکنش‌های مالی سیستم
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchPayments}
                        className="!py-2.5"
                    >
                        <RefreshCw size={18} className="ml-2" />
                        به‌روزرسانی
                    </Button>
                    <Button
                        onClick={exportPayments}
                        className="!py-2.5"
                    >
                        <Download size={18} className="ml-2" />
                        دانلود گزارش
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                    title="کل پرداخت‌ها"
                    value={stats.totalPayments.toLocaleString()}
                    icon={CreditCard}
                    color="indigo"
                />
                <StatCard
                    title="پرداخت‌های موفق"
                    value={stats.successfulPayments.toLocaleString()}
                    icon={CheckCircle2}
                    color="emerald"
                />
                <StatCard
                    title="کل مبلغ دریافتی"
                    value={formatPrice(stats.totalAmount) + ' تومان'}
                    icon={DollarSign}
                    color="amber"
                />
                <StatCard
                    title="نرخ موفقیت"
                    value={stats.successRate + '%'}
                    icon={TrendingUp}
                    color="emerald"
                />
            </div>

            {/* Payments Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">
                            لیست پرداخت‌ها
                        </h3>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            {filteredPayments.length} پرداخت
                        </span>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="جستجو..."
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
                            <option value="failed">ناموفق</option>
                            <option value="refunded">بازگشت داده شده</option>
                        </select>
                        <select
                            value={methodFilter}
                            onChange={(e) => setMethodFilter(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        >
                            <option value="all">همه روش‌ها</option>
                            <option value="online">آنلاین</option>
                            <option value="wallet">کیف پول</option>
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
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setMethodFilter('all');
                                setDateRange('all');
                            }}
                            className="!py-2.5"
                        >
                            <Filter size={18} className="ml-2" />
                            پاک کردن فیلتر
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    شناسه تراکنش
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    دانشجو
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    دوره
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    مبلغ
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    روش پرداخت
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
                            {filteredPayments.map((payment) => (
                                <PaymentRow
                                    key={payment.id}
                                    payment={payment}
                                    onView={handleViewPayment}
                                    onRefund={handleRefundPayment}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredPayments.length === 0 && (
                    <div className="p-12 text-center">
                        <CreditCard className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={48} />
                        <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">
                            پرداختی یافت نشد
                        </h3>
                        <p className="text-slate-400 dark:text-slate-500">
                            با فیلترهای انتخاب شده پرداختی موجود نیست
                        </p>
                    </div>
                )}
            </div>

            {/* Payment Detail Modal */}
            {showPaymentModal && selectedPayment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white">
                                جزئیات پرداخت
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        شناسه تراکنش
                                    </label>
                                    <p className="text-slate-800 dark:text-white font-bold mt-1">
                                        {selectedPayment.transactionId}
                                    </p>
                                </div>
                                {selectedPayment.referenceId && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            شناسه مرجع
                                        </label>
                                        <p className="text-slate-800 dark:text-white font-bold mt-1">
                                            {selectedPayment.referenceId}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    دانشجو
                                </label>
                                <p className="text-slate-800 dark:text-white font-bold mt-1">
                                    {selectedPayment.studentName}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    {selectedPayment.studentEmail}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    دوره
                                </label>
                                <p className="text-slate-800 dark:text-white font-bold mt-1">
                                    {selectedPayment.courseName}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    {selectedPayment.courseCategory}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    مبلغ
                                </label>
                                <p className="text-slate-800 dark:text-white font-black text-lg mt-1">
                                    {formatPrice(selectedPayment.amount)} تومان
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        روش پرداخت
                                    </label>
                                    <div className="mt-2">
                                        <PaymentMethodBadge
                                            method={selectedPayment.method}
                                            gateway={selectedPayment.gateway}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        وضعیت
                                    </label>
                                    <div className="mt-2">
                                        <PaymentStatusBadge status={selectedPayment.status} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    تاریخ ایجاد
                                </label>
                                <p className="text-slate-800 dark:text-white font-bold mt-1">
                                    {formatDate(selectedPayment.createdAt)}
                                </p>
                            </div>
                            {selectedPayment.completedAt && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        تاریخ تکمیل
                                    </label>
                                    <p className="text-slate-800 dark:text-white font-bold mt-1">
                                        {formatDate(selectedPayment.completedAt)}
                                    </p>
                                </div>
                            )}
                            {selectedPayment.refundedAt && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        تاریخ بازگشت وجه
                                    </label>
                                    <p className="text-slate-800 dark:text-white font-bold mt-1">
                                        {formatDate(selectedPayment.refundedAt)}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                            {selectedPayment.status === 'completed' && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        handleRefundPayment(selectedPayment);
                                    }}
                                    className="flex-1 !text-red-600 !border-red-200 hover:!bg-red-50"
                                >
                                    <RefreshCw size={16} className="ml-2" />
                                    بازگشت وجه
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => setShowPaymentModal(false)}
                                className="flex-1"
                            >
                                بستن
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Refund Modal */}
            {showRefundModal && selectedPayment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-xl">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                                    <AlertTriangle size={20} />
                                </div>
                                <h3 className="text-lg font-black text-slate-800 dark:text-white">
                                    بازگشت وجه
                                </h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4">
                                <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                                    آیا از بازگشت وجه پرداخت <strong>{selectedPayment.transactionId}</strong>
                                    به مبلغ <strong>{formatPrice(selectedPayment.amount)} تومان</strong> اطمینان دارید؟
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    دلیل بازگشت وجه *
                                </label>
                                <textarea
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    placeholder="دلیل بازگشت وجه را وارد کنید..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowRefundModal(false);
                                    setRefundReason('');
                                }}
                                className="flex-1"
                            >
                                انصراف
                            </Button>
                            <Button
                                onClick={processRefund}
                                disabled={!refundReason.trim()}
                                className="flex-1 !bg-red-600 hover:!bg-red-700"
                            >
                                <RefreshCw size={16} className="ml-2" />
                                تأیید بازگشت وجه
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentManagement;