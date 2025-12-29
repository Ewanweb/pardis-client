import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Clock, Eye, Receipt, AlertTriangle, Search } from 'lucide-react';
import { Button } from '../UI';
import { api } from '../../services/api';
import { formatPrice, formatDate } from '../../services/Libs';
import toast from 'react-hot-toast';

const ManualPaymentStatusBadge = ({ status }) => {
    const statusConfig = {
        0: { // PendingReceipt
            label: 'در انتظار آپلود رسید',
            className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
            icon: Clock
        },
        1: { // PendingApproval
            label: 'در انتظار تایید',
            className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
            icon: Clock
        },
        2: { // Approved
            label: 'تایید شده',
            className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
            icon: CheckCircle2
        },
        3: { // Rejected
            label: 'رد شده',
            className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
            icon: XCircle
        }
    };

    const config = statusConfig[status] || statusConfig[0];
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${config.className}`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
};

const ManualPaymentManagement = () => {
    const [loading, setLoading] = useState(true);
    const [manualPayments, setManualPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const fetchManualPayments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/payments/admin/manual');
            const data = response.data?.data || response.data || [];
            setManualPayments(data);
        } catch (error) {
            console.error('Error fetching manual payments:', error);
            toast.error('خطا در دریافت پرداخت‌های دستی');
            setManualPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const filterPayments = useCallback(() => {
        let filtered = [...manualPayments];

        // فیلتر جستجو
        if (searchTerm) {
            filtered = filtered.filter(payment =>
                payment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.id?.toString().includes(searchTerm)
            );
        }

        // فیلتر وضعیت
        if (statusFilter !== 'all') {
            const statusValue = parseInt(statusFilter);
            filtered = filtered.filter(payment => payment.status === statusValue);
        }

        setFilteredPayments(filtered);
    }, [manualPayments, searchTerm, statusFilter]);

    useEffect(() => {
        fetchManualPayments();
    }, []);

    useEffect(() => {
        filterPayments();
    }, [filterPayments]);

    const approvePayment = async (paymentId) => {
        try {
            const response = await api.post(`/payments/admin/manual/${paymentId}/review`, {
                isApproved: true
            });

            if (response.data.success) {
                toast.success('پرداخت با موفقیت تایید شد');
                fetchManualPayments();
            }
        } catch (error) {
            console.error('Error approving payment:', error);
            toast.error(error.response?.data?.message || 'خطا در تایید پرداخت');
        }
    };

    const rejectPayment = async () => {
        if (!rejectReason.trim()) {
            toast.error('لطفاً دلیل رد را وارد کنید');
            return;
        }

        try {
            const response = await api.post(`/payments/admin/manual/${selectedPayment.id}/review`, {
                isApproved: false,
                rejectReason: rejectReason
            });

            if (response.data.success) {
                toast.success('پرداخت رد شد');
                setShowRejectModal(false);
                setRejectReason('');
                setSelectedPayment(null);
                fetchManualPayments();
            }
        } catch (error) {
            console.error('Error rejecting payment:', error);
            toast.error(error.response?.data?.message || 'خطا در رد پرداخت');
        }
    };

    const viewReceipt = (receiptUrl) => {
        if (receiptUrl) {
            window.open(receiptUrl, '_blank');
        } else {
            toast.error('رسید موجود نیست');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="جستجو در پرداخت‌های دستی..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    >
                        <option value="all">همه وضعیت‌ها</option>
                        <option value="0">در انتظار آپلود رسید</option>
                        <option value="1">در انتظار تایید</option>
                        <option value="2">تایید شده</option>
                        <option value="3">رد شده</option>
                    </select>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                        <div className="text-slate-600 dark:text-slate-400">
                            کل: <span className="font-bold text-slate-800 dark:text-white">{filteredPayments.length}</span>
                        </div>
                        <div className="text-blue-600 dark:text-blue-400">
                            در انتظار: <span className="font-bold">{filteredPayments.filter(p => p.status === 1).length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Manual Payments Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        پرداخت‌های دستی
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {filteredPayments.length} درخواست پرداخت
                    </p>
                </div>

                {filteredPayments.length === 0 ? (
                    <div className="p-12 text-center">
                        <Receipt className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={48} />
                        <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">
                            پرداخت دستی یافت نشد
                        </h3>
                        <p className="text-slate-400 dark:text-slate-500">
                            هیچ درخواست پرداخت دستی موجود نیست
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
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
                                        وضعیت
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        تاریخ ایجاد
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        عملیات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white">
                                                    {payment.studentName}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    ID: {payment.studentId}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-800 dark:text-white">
                                                {payment.courseName}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800 dark:text-white">
                                                {formatPrice(payment.amount)} تومان
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <ManualPaymentStatusBadge status={payment.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            {formatDate(payment.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedPayment(payment);
                                                        setShowDetailModal(true);
                                                    }}
                                                    className="!py-1.5 !px-2"
                                                >
                                                    <Eye size={12} className="ml-1" />
                                                    جزئیات
                                                </Button>

                                                {payment.status === 1 && ( // PendingApproval
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => approvePayment(payment.id)}
                                                            className="!py-1.5 !px-2 !text-green-600 !border-green-200 hover:!bg-green-50"
                                                        >
                                                            <CheckCircle2 size={12} className="ml-1" />
                                                            تایید
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedPayment(payment);
                                                                setShowRejectModal(true);
                                                            }}
                                                            className="!py-1.5 !px-2 !text-red-600 !border-red-200 hover:!bg-red-50"
                                                        >
                                                            <XCircle size={12} className="ml-1" />
                                                            رد
                                                        </Button>
                                                    </>
                                                )}

                                                {payment.receiptFileUrl && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => viewReceipt(payment.receiptFileUrl)}
                                                        className="!py-1.5 !px-2 !text-blue-600 !border-blue-200 hover:!bg-blue-50"
                                                    >
                                                        <Receipt size={12} className="ml-1" />
                                                        رسید
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedPayment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                جزئیات پرداخت دستی
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    دانشجو
                                </label>
                                <p className="text-slate-800 dark:text-white font-bold mt-1">
                                    {selectedPayment.studentName}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    دوره
                                </label>
                                <p className="text-slate-800 dark:text-white font-bold mt-1">
                                    {selectedPayment.courseName}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    مبلغ
                                </label>
                                <p className="text-slate-800 dark:text-white font-bold text-lg mt-1">
                                    {formatPrice(selectedPayment.amount)} تومان
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    وضعیت
                                </label>
                                <div className="mt-2">
                                    <ManualPaymentStatusBadge status={selectedPayment.status} />
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
                            {selectedPayment.receiptUploadedAt && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        تاریخ آپلود رسید
                                    </label>
                                    <p className="text-slate-800 dark:text-white font-bold mt-1">
                                        {formatDate(selectedPayment.receiptUploadedAt)}
                                    </p>
                                </div>
                            )}
                            {selectedPayment.adminReviewedAt && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        تاریخ بررسی
                                    </label>
                                    <p className="text-slate-800 dark:text-white font-bold mt-1">
                                        {formatDate(selectedPayment.adminReviewedAt)}
                                    </p>
                                    {selectedPayment.adminReviewerName && (
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                                            توسط: {selectedPayment.adminReviewerName}
                                        </p>
                                    )}
                                </div>
                            )}
                            {selectedPayment.rejectReason && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle size={20} className="text-red-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-red-800 dark:text-red-200">دلیل رد:</p>
                                            <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                                                {selectedPayment.rejectReason}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                            {selectedPayment.receiptFileUrl && (
                                <Button
                                    variant="outline"
                                    onClick={() => viewReceipt(selectedPayment.receiptFileUrl)}
                                    className="flex-1"
                                >
                                    <Receipt size={16} className="ml-2" />
                                    مشاهده رسید
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => setShowDetailModal(false)}
                                className="flex-1"
                            >
                                بستن
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedPayment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-xl">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                رد پرداخت
                            </h3>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                لطفاً دلیل رد پرداخت را وارد کنید:
                            </p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="دلیل رد پرداخت..."
                                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                rows={4}
                            />
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                }}
                                className="flex-1"
                            >
                                انصراف
                            </Button>
                            <Button
                                onClick={rejectPayment}
                                className="flex-1 !bg-red-600 hover:!bg-red-700"
                            >
                                رد پرداخت
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManualPaymentManagement;