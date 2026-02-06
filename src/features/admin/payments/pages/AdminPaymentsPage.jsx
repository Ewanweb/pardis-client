import { useState } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { Button } from '../../../../components/UI';
import { APIErrorAlert } from '../../../../components/Alert';
import { Pagination } from '../../../../components/Pagination/Pagination';
import { useAdminPayments } from '../hooks/useAdminPayments';
import { AdminPaymentFilters } from '../components/AdminPaymentFilters';
import { AdminPaymentTable } from '../components/AdminPaymentTable';
import { ReceiptPreviewModal } from '../components/ReceiptPreviewModal';
import { PaymentStatusBadge } from '../components/PaymentStatusBadge';
import { formatPrice, formatDate } from '../../../../services/Libs';
import toast from 'react-hot-toast';

export const AdminPaymentsPage = () => {
    const {
        loading,
        payments,
        filters,
        stats,
        updateFilters,
        approvePayment,
        rejectPayment,
        refetch,
        error,
        pagination,
        updatePage,
        updatePageSize
    } = useAdminPayments();

    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receiptUrl, setReceiptUrl] = useState('');
    const [rejectReason, setRejectReason] = useState('');

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowDetailModal(true);
    };

    const handleViewReceipt = (url, payment) => {
        setReceiptUrl(url);
        setSelectedPayment(payment);
        setShowReceiptModal(true);
    };

    const handleReject = (paymentId) => {
        const payment = Array.isArray(payments) ? payments.find(p => p.id === paymentId) : null;
        if (payment) {
            setSelectedPayment(payment);
            setShowRejectModal(true);
        }
    };

    const handleRejectConfirm = async () => {
        if (!selectedPayment || !rejectReason.trim()) {
            toast.error("Please enter a rejection reason.");
            return;
        }

        await rejectPayment(selectedPayment.id, rejectReason);
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedPayment(null);
    };

    const exportPayments = () => {
        if (!Array.isArray(payments) || payments.length === 0) {
            toast.error("هیچ پرداختی برای دانلود وجود ندارد");
            return;
        }

        toast.success("Preparing payment export...");

        const csvHeader = [
            "Student",
            "OrderNumber",
            "TrackingCode",
            "Amount",
            "Status",
            "CreatedAt"
        ].join(",");
        const csvRows = payments.map(p =>
            `${p.studentName},${p.orderNumber},${p.trackingCode},${p.amount},${p.status},${formatDate(p.createdAt)}`
        );
        const csvContent = `data:text/csv;charset=utf-8,${csvHeader}\n${csvRows.join("\n")}`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `admin_payments_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">در حال بارگذاری پرداخت‌ها...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <APIErrorAlert
                    error={error}
                    onRetry={refetch}
                    onClose={() => { }}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-2">
                        همه پرداخت‌ها
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        مدیریت و نظارت بر تمام پرداخت‌های دستی سیستم
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <Button
                        variant="outline"
                        onClick={refetch}
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

            {/* Filters */}
            <AdminPaymentFilters
                filters={filters}
                onFiltersChange={updateFilters}
                stats={stats}
            />

            {/* Payments Table */}
            <AdminPaymentTable
                payments={payments}
                onApprove={approvePayment}
                onReject={handleReject}
                onViewDetails={handleViewDetails}
                onViewReceipt={handleViewReceipt}
            />

            {!loading && (
                <Pagination
                    page={pagination.page}
                    pageSize={pagination.pageSize}
                    totalCount={pagination.totalCount}
                    totalPages={pagination.totalPages}
                    hasNext={pagination.hasNext}
                    hasPrev={pagination.hasPrev}
                    onPageChange={updatePage}
                    onPageSizeChange={updatePageSize}
                />
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedPayment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                جزئیات پرداخت
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
                                    رسیدگی شده توسط
                                </label>
                                <p className="text-slate-800 dark:text-white font-bold mt-1">
                                    {selectedPayment.adminReviewerName}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    سفارش
                                </label>
                                <p className="text-slate-800 dark:text-white font-bold mt-1">
                                    {selectedPayment.orderNumber}
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
                                    <PaymentStatusBadge status={selectedPayment.status} />
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
                            {selectedPayment.trackingCode && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        کد پیگیری
                                    </label>
                                    <p className="text-slate-800 dark:text-white font-bold mt-1">
                                        {selectedPayment.trackingCode}
                                    </p>
                                </div>
                            )}
                            {selectedPayment.failureReason && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                    <p className="font-medium text-red-800 dark:text-red-200">دلیل رد:</p>
                                    <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                                        {selectedPayment.failureReason}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                            {selectedPayment.receiptImageUrl && (
                                <Button
                                    variant="outline"
                                    onClick={() => handleViewReceipt(selectedPayment.receiptImageUrl, selectedPayment)}
                                    className="flex-1"
                                >
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
                                onClick={handleRejectConfirm}
                                className="flex-1 !bg-red-600 hover:!bg-red-700"
                            >
                                رد پرداخت
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Preview Modal */}
            {showReceiptModal && selectedPayment && (
                <ReceiptPreviewModal
                    isOpen={showReceiptModal}
                    onClose={() => setShowReceiptModal(false)}
                    receiptUrl={receiptUrl}
                    paymentInfo={{
                        studentName: selectedPayment.studentName,
                        orderNumber: selectedPayment.orderNumber,
                        amount: selectedPayment.amount
                    }}
                />
            )}
        </div>
    );
};
