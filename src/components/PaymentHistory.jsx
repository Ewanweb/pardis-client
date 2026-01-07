import { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle2, AlertTriangle, Clock, Upload, Eye, Receipt, FileText } from 'lucide-react';
import { Button, Badge } from './UI';
import { apiClient } from '../services/api';
import { formatPrice, formatDate } from '../services/Libs';
import { APIErrorAlert } from './Alert';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        fetchPaymentHistory();
    }, []);

    const fetchPaymentHistory = async () => {
        try {
            const result = await apiClient.get('/me/payments', {
                showErrorAlert: false
            });

            if (result.success) {
                setPayments(result.data || []);
            } else {
                setPayments([]);
            }
        } catch (error) {
            console.error('Error fetching payment history:', error);
            setApiError(error);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status, requiresAction) => {
        if (requiresAction) {
            return <Badge color="amber" size="sm" className="flex items-center gap-1">
                <AlertTriangle size={12} />
                نیاز به اقدام
            </Badge>;
        }

        switch (status) {
            case 'Paid':
                return <Badge color="emerald" size="sm" className="flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    پرداخت شده
                </Badge>;
            case 'PendingPayment':
                return <Badge color="blue" size="sm" className="flex items-center gap-1">
                    <Clock size={12} />
                    در انتظار پرداخت
                </Badge>;
            case 'AwaitingReceiptUpload':
                return <Badge color="amber" size="sm" className="flex items-center gap-1">
                    <Upload size={12} />
                    آپلود رسید
                </Badge>;
            case 'AwaitingAdminApproval':
                return <Badge color="purple" size="sm" className="flex items-center gap-1">
                    <Clock size={12} />
                    در انتظار تایید
                </Badge>;
            case 'Failed':
                return <Badge color="red" size="sm" className="flex items-center gap-1">
                    <AlertTriangle size={12} />
                    ناموفق
                </Badge>;
            case 'Expired':
                return <Badge color="gray" size="sm" className="flex items-center gap-1">
                    <Clock size={12} />
                    منقضی شده
                </Badge>;
            default:
                return <Badge color="gray" size="sm">{status}</Badge>;
        }
    };

    const getOrderStatusBadge = (status) => {
        switch (status) {
            case 'Completed':
                return <Badge color="emerald" size="sm">تکمیل شده</Badge>;
            case 'PendingPayment':
                return <Badge color="blue" size="sm">در انتظار پرداخت</Badge>;
            case 'Cancelled':
                return <Badge color="red" size="sm">لغو شده</Badge>;
            default:
                return <Badge color="gray" size="sm">{status}</Badge>;
        }
    };

    const handleUploadReceipt = (paymentAttemptId) => {
        // Navigate to receipt upload page
        window.location.href = `/payment/manual/${paymentAttemptId}`;
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        ))}
                    </div>
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
                        fetchPaymentHistory();
                    }}
                    onClose={() => setApiError(null)}
                />
            )}

            {/* Header */}
            <div className="bg-gradient-to-br from-white via-slate-50/30 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20 backdrop-blur-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                        <CreditCard size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                            تاریخچه پرداخت‌ها
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            مشاهده تمام سفارش‌ها و پرداخت‌های شما
                        </p>
                    </div>
                </div>
            </div>

            {/* Payments List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                {payments.length === 0 ? (
                    <div className="text-center py-8">
                        <Receipt className="mx-auto text-slate-400 mb-4" size={48} />
                        <p className="text-slate-500 dark:text-slate-400">
                            هنوز هیچ پرداختی انجام نداده‌اید
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {payments.map((order) => (
                            <div
                                key={order.orderId}
                                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
                            >
                                {/* Order Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                            <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-800 dark:text-white">
                                                سفارش #{order.orderNumber}
                                            </h5>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {formatDate(order.createdAt)} • {order.courseCount} دوره
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        {getOrderStatusBadge(order.status)}
                                        <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                                            {formatPrice(order.totalAmount)} تومان
                                        </p>
                                    </div>
                                </div>

                                {/* Courses */}
                                <div className="mb-3">
                                    <div className="flex flex-wrap gap-2">
                                        {order.courses.slice(0, 3).map((course) => (
                                            <span
                                                key={course.courseId}
                                                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400"
                                            >
                                                {course.title}
                                            </span>
                                        ))}
                                        {order.courses.length > 3 && (
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                                                +{order.courses.length - 3} دوره دیگر
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Attempts */}
                                <div className="space-y-2">
                                    {order.paymentAttempts.map((attempt) => (
                                        <div
                                            key={attempt.paymentAttemptId}
                                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center">
                                                    <CreditCard size={12} className="text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                                                        {attempt.methodText}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        کد پیگیری: {attempt.trackingCode}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(attempt.status, attempt.requiresAction)}
                                                {attempt.requiresAction && attempt.status === 'AwaitingReceiptUpload' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUploadReceipt(attempt.paymentAttemptId)}
                                                        className="!bg-amber-600 hover:!bg-amber-700"
                                                    >
                                                        <Upload size={12} className="ml-1" />
                                                        آپلود رسید
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;