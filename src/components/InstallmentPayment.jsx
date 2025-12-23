import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle2, AlertTriangle, Clock, DollarSign, Receipt, Download, Eye } from 'lucide-react';
import { Button, Badge } from './UI';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatPrice, formatDate } from '../services/Libs';
import { APIErrorAlert } from './Alert';
import toast from 'react-hot-toast';
const InstallmentPayment = ({ enrollmentId, courseName, onPaymentSuccess }) => {
    const { user } = useAuth();
    const [enrollment, setEnrollment] = useState(null);
    const [installments, setInstallments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [selectedInstallment, setSelectedInstallment] = useState(null);
    useEffect(() => {
        fetchEnrollmentDetails();
    }, [enrollmentId]);
    const fetchEnrollmentDetails = async () => {
        try {
            // Try to fetch enrollment installments from API
            const response = await api.get(`/admin/Payments/enrollments/student/${enrollmentId}`);
            const enrollmentData = response.data?.data || response.data;
            if (enrollmentData) {
                setEnrollment(enrollmentData);
                setInstallments(Array.isArray(enrollmentData.installments) ? enrollmentData.installments : []);
            } else {
                // No enrollment data found
                setEnrollment(null);
                setInstallments([]);
            }
        } catch (error) {
            console.error('Error fetching enrollment details:', error);
            setApiError(error);
            // در صورت خطا، داده‌های خالی نمایش بده
            setEnrollment(null);
            setInstallments([]);
        } finally {
            setLoading(false);
        }
    };
    const handlePayInstallment = async (installmentId, amount) => {
        setPaymentLoading(true);
        try {
            // Payment endpoint doesn't exist yet in backend
            toast.error('پرداخت آنلاین هنوز پیاده‌سازی نشده است');
        } catch (error) {
            const message = error.response?.data?.message || 'خطا در پردازش پرداخت';
            toast.error(message);
        } finally {
            setPaymentLoading(false);
        }
    };
    const getInstallmentStatusBadge = (installment) => {
        const now = new Date();
        const dueDate = new Date(installment.dueDate);
        if (installment.status === 'Paid') {
            return <Badge color="emerald" size="sm" className="flex items-center gap-1">
                <CheckCircle2 size={12} />
                پرداخت شده
            </Badge>;
        } else if (installment.status === 'Partial') {
            return <Badge color="amber" size="sm" className="flex items-center gap-1">
                <Clock size={12} />
                پرداخت جزئی
            </Badge>;
        } else if (now > dueDate) {
            return <Badge color="red" size="sm" className="flex items-center gap-1">
                <AlertTriangle size={12} />
                معوق
            </Badge>;
        } else {
            return <Badge color="blue" size="sm" className="flex items-center gap-1">
                <Calendar size={12} />
                در انتظار پرداخت
            </Badge>;
        }
    };
    const calculateProgress = () => {
        if (!enrollment) return 0;
        return Math.round((enrollment.paidAmount / enrollment.totalAmount) * 100);
    };
    const getRemainingAmount = (installment) => {
        return installment.amount - (installment.paidAmount || 0);
    };
    const getOverdueDays = (dueDate) => {
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = now - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
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
    if (!enrollment) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
                <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                    خطا در بارگذاری اطلاعات
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                    اطلاعات ثبت‌نام یافت نشد
                </p>
            </div>
        );
    }
    const progress = calculateProgress();
    const totalOverdue = installments
        .filter(i => i.status !== 'Paid' && new Date() > new Date(i.dueDate))
        .reduce((sum, i) => sum + getRemainingAmount(i), 0);
    return (
        <div className="space-y-6">
            {/* Error Alert */}
            {apiError && (
                <APIErrorAlert
                    error={apiError}
                    onRetry={() => {
                        setApiError(null);
                        fetchEnrollmentDetails();
                    }}
                    onClose={() => setApiError(null)}
                />
            )}
            {/* Header */}
            <div className="bg-gradient-to-br from-white via-slate-50/30 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                پرداخت قسطی
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {courseName}
                            </p>
                        </div>
                    </div>
                    {totalOverdue > 0 && (
                        <Badge color="red" className="flex items-center gap-1">
                            <AlertTriangle size={12} />
                            معوقات: {formatPrice(totalOverdue)}
                        </Badge>
                    )}
                </div>
                {/* Payment Progress */}
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">پیشرفت پرداخت</span>
                        <span className="font-bold text-slate-800 dark:text-white">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>پرداخت شده: {formatPrice(enrollment.paidAmount)}</span>
                        <span>کل مبلغ: {formatPrice(enrollment.totalAmount)}</span>
                    </div>
                </div>
            </div>
            {/* Installments List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Receipt size={20} />
                    لیست اقساط ({installments.length})
                </h4>
                {installments.length === 0 ? (
                    <div className="text-center py-8">
                        <Receipt className="mx-auto text-slate-400 mb-4" size={48} />
                        <p className="text-slate-500 dark:text-slate-400">
                            هیچ قسطی تعریف نشده است
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Array.isArray(installments) && installments.map((installment) => {
                            const remainingAmount = getRemainingAmount(installment);
                            const overdueDays = getOverdueDays(installment.dueDate);
                            const isOverdue = installment.status !== 'Paid' && overdueDays > 0;
                            return (
                                <div
                                    key={installment.id}
                                    className={`p-4 rounded-xl border transition-all ${isOverdue
                                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                        : installment.status === 'Paid'
                                            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                                            : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${installment.status === 'Paid'
                                                ? 'bg-emerald-500'
                                                : isOverdue
                                                    ? 'bg-red-500'
                                                    : 'bg-slate-500'
                                                }`}>
                                                {installment.installmentNumber}
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-slate-800 dark:text-white">
                                                    قسط {installment.installmentNumber}
                                                </h5>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    سررسید: {formatDate(installment.dueDate)}
                                                    {isOverdue && (
                                                        <span className="text-red-600 dark:text-red-400 mr-2">
                                                            ({overdueDays} روز معوق)
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        {getInstallmentStatusBadge(installment)}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                        <div>
                                            <span className="text-slate-500 dark:text-slate-400">مبلغ قسط:</span>
                                            <p className="font-bold text-slate-800 dark:text-white">
                                                {formatPrice(installment.amount)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 dark:text-slate-400">پرداخت شده:</span>
                                            <p className="font-bold text-emerald-600 dark:text-emerald-400">
                                                {formatPrice(installment.paidAmount || 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 dark:text-slate-400">باقی‌مانده:</span>
                                            <p className="font-bold text-red-600 dark:text-red-400">
                                                {formatPrice(remainingAmount)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 dark:text-slate-400">وضعیت:</span>
                                            <p className="font-bold">
                                                {installment.status === 'Paid' ? 'تسویه شده' :
                                                    installment.status === 'Partial' ? 'پرداخت جزئی' : 'در انتظار'}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Payment Progress for this installment */}
                                    {installment.status !== 'Paid' && installment.paidAmount > 0 && (
                                        <div className="mb-4">
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full"
                                                    style={{ width: `${(installment.paidAmount / installment.amount) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Actions */}
                                    {remainingAmount > 0 && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handlePayInstallment(installment.id, remainingAmount)}
                                                disabled={paymentLoading}
                                                className={isOverdue ? '!bg-red-600 hover:!bg-red-700' : ''}
                                            >
                                                {paymentLoading ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-1"></div>
                                                ) : (
                                                    <CreditCard size={14} className="ml-1" />
                                                )}
                                                پرداخت {isOverdue ? 'فوری' : 'قسط'}
                                            </Button>
                                            {remainingAmount !== installment.amount && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        const customAmount = prompt(
                                                            `مبلغ دلخواه (حداکثر ${formatPrice(remainingAmount)}):`
                                                        );
                                                        if (customAmount && parseInt(customAmount) > 0 && parseInt(customAmount) <= remainingAmount) {
                                                            handlePayInstallment(installment.id, parseInt(customAmount));
                                                        }
                                                    }}
                                                >
                                                    <DollarSign size={14} className="ml-1" />
                                                    پرداخت جزئی
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    // TODO: Generate installment receipt
                                                    toast.success('رسید در حال تولید است...');
                                                }}
                                            >
                                                <Download size={14} className="ml-1" />
                                                رسید
                                            </Button>
                                        </div>
                                    )}
                                    {installment.status === 'Paid' && (
                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
                                            <CheckCircle2 size={16} />
                                            <span>این قسط به طور کامل پرداخت شده است</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {/* Summary */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <h5 className="font-bold text-slate-800 dark:text-white mb-3">خلاصه پرداخت</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-slate-500 dark:text-slate-400">کل مبلغ:</span>
                        <p className="font-bold text-slate-800 dark:text-white">
                            {formatPrice(enrollment.totalAmount)}
                        </p>
                    </div>
                    <div>
                        <span className="text-slate-500 dark:text-slate-400">پرداخت شده:</span>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatPrice(enrollment.paidAmount)}
                        </p>
                    </div>
                    <div>
                        <span className="text-slate-500 dark:text-slate-400">باقی‌مانده:</span>
                        <p className="font-bold text-red-600 dark:text-red-400">
                            {formatPrice(enrollment.totalAmount - enrollment.paidAmount)}
                        </p>
                    </div>
                    <div>
                        <span className="text-slate-500 dark:text-slate-400">معوقات:</span>
                        <p className="font-bold text-red-600 dark:text-red-400">
                            {formatPrice(totalOverdue)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default InstallmentPayment;