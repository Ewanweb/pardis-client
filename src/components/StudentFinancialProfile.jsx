import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Calendar, CheckCircle2, AlertTriangle, Clock, TrendingUp, User, BookOpen, Receipt, FileText, Eye, Download } from 'lucide-react';
import { Button, Badge } from './UI';
import { api } from '../services/api';
import { formatPrice, formatDate } from '../services/Libs';
import { APIErrorAlert } from './Alert';
import toast from 'react-hot-toast';

const StudentFinancialProfile = ({ studentId, studentName, onClose }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');

    useEffect(() => {
        fetchStudentProfile();
    }, [studentId]);

    const fetchStudentProfile = async () => {
        try {
            // Use the correct endpoint from Swagger documentation
            const response = await api.get(`/admin/Students/${studentId}/profile`);
            setProfile(response.data?.data);
        } catch (error) {
            console.error('Error fetching student profile:', error);
            setApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (enrollmentId, amount) => {
        if (!amount || amount <= 0) {
            toast.error('مبلغ پرداخت نامعتبر است');
            return;
        }

        try {
            // Payment recording endpoint - will be implemented in backend
            console.log('Payment recording not yet implemented in backend');
            toast.error('ثبت پرداخت هنوز پیاده‌سازی نشده است');
            setShowPaymentForm(false);
            setPaymentAmount('');
            setSelectedEnrollment(null);
        } catch (error) {
            const message = error.response?.data?.message || 'خطا در ثبت پرداخت';
            toast.error(message);
        }
    };

    const getPaymentStatusBadge = (status) => {
        const statusConfig = {
            Paid: { color: 'emerald', text: 'پرداخت شده', icon: CheckCircle2 },
            Partial: { color: 'amber', text: 'پرداخت جزئی', icon: Clock },
            Pending: { color: 'red', text: 'در انتظار پرداخت', icon: AlertTriangle },
            Overdue: { color: 'red', text: 'معوق', icon: AlertTriangle }
        };

        const config = statusConfig[status] || statusConfig.Pending;
        const IconComponent = config.icon;

        return (
            <Badge color={config.color} size="sm" className="flex items-center gap-1">
                <IconComponent size={12} />
                {config.text}
            </Badge>
        );
    };

    const getEnrollmentStatusBadge = (status) => {
        const statusConfig = {
            Active: { color: 'emerald', text: 'فعال' },
            Completed: { color: 'blue', text: 'تکمیل شده' },
            Suspended: { color: 'amber', text: 'تعلیق' },
            Cancelled: { color: 'red', text: 'لغو شده' }
        };

        const config = statusConfig[status] || statusConfig.Active;
        return <Badge color={config.color} size="sm">{config.text}</Badge>;
    };

    const calculateProgress = (paidAmount, totalAmount) => {
        if (totalAmount === 0) return 100;
        return Math.round((paidAmount / totalAmount) * 100);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 w-full max-w-md text-center">
                    <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                        خطا در بارگذاری اطلاعات
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        اطلاعات مالی دانشجو یافت نشد
                    </p>
                    <Button onClick={onClose} variant="outline">
                        بستن
                    </Button>
                </div>
            </div>
        );
    }

    const totalEnrolled = profile.enrollments?.length || 0;
    const totalRevenue = profile.enrollments?.reduce((sum, e) => sum + (e.paidAmount || 0), 0) || 0;
    const totalDebt = profile.enrollments?.reduce((sum, e) => sum + (e.totalAmount - e.paidAmount), 0) || 0;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                {/* Error Alert */}
                {apiError && (
                    <div className="p-4">
                        <APIErrorAlert
                            error={apiError}
                            onRetry={() => {
                                setApiError(null);
                                fetchStudentProfile();
                            }}
                            onClose={() => setApiError(null)}
                        />
                    </div>
                )}

                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                {profile.student?.fullName?.charAt(0) || 'د'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                    پروفایل مالی دانشجو
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {profile.student?.fullName || studentName}
                                </p>
                            </div>
                        </div>
                        <Button onClick={onClose} variant="outline" size="sm">
                            بستن
                        </Button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400">دوره‌های ثبت‌نام</p>
                                    <p className="text-lg font-black text-blue-800 dark:text-blue-200">{totalEnrolled}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">کل پرداخت‌ها</p>
                                    <p className="text-lg font-black text-emerald-800 dark:text-emerald-200">{formatPrice(totalRevenue)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white">
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-red-600 dark:text-red-400">بدهی باقی‌مانده</p>
                                    <p className="text-lg font-black text-red-800 dark:text-red-200">{formatPrice(totalDebt)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                                    <Receipt size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400">درصد پرداخت</p>
                                    <p className="text-lg font-black text-purple-800 dark:text-purple-200">
                                        {totalRevenue + totalDebt > 0 ? Math.round((totalRevenue / (totalRevenue + totalDebt)) * 100) : 0}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Student Info */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                            <User size={20} />
                            اطلاعات دانشجو
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-slate-500 dark:text-slate-400">نام و نام خانوادگی:</span>
                                <p className="font-bold text-slate-800 dark:text-white">{profile.student?.fullName || 'نامشخص'}</p>
                            </div>
                            <div>
                                <span className="text-slate-500 dark:text-slate-400">ایمیل:</span>
                                <p className="font-bold text-slate-800 dark:text-white">{profile.student?.email || 'نامشخص'}</p>
                            </div>
                            <div>
                                <span className="text-slate-500 dark:text-slate-400">شماره تماس:</span>
                                <p className="font-bold text-slate-800 dark:text-white">{profile.student?.phoneNumber || 'نامشخص'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Enrollments */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <BookOpen size={20} />
                            دوره‌های ثبت‌نام شده ({totalEnrolled})
                        </h3>

                        {profile.enrollments?.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <BookOpen className="mx-auto text-slate-400 mb-4" size={48} />
                                <p className="text-slate-500 dark:text-slate-400">
                                    هیچ دوره‌ای ثبت‌نام نشده است
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Array.isArray(profile.enrollments) && profile.enrollments.map((enrollment) => {
                                    const progress = calculateProgress(enrollment.paidAmount, enrollment.totalAmount);
                                    const remainingAmount = enrollment.totalAmount - enrollment.paidAmount;

                                    return (
                                        <div key={enrollment.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                                                        {enrollment.course?.title || 'دوره نامشخص'}
                                                    </h4>
                                                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                                        <span>تاریخ ثبت‌نام: {formatDate(enrollment.enrollmentDate)}</span>
                                                        {getEnrollmentStatusBadge(enrollment.enrollmentStatus)}
                                                        {getPaymentStatusBadge(enrollment.paymentStatus)}
                                                    </div>
                                                </div>

                                                <div className="text-left">
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">مبلغ کل</p>
                                                    <p className="text-lg font-bold text-slate-800 dark:text-white">
                                                        {formatPrice(enrollment.totalAmount)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Payment Progress */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-slate-600 dark:text-slate-400">پیشرفت پرداخت</span>
                                                    <span className="font-bold text-slate-800 dark:text-white">{progress}%</span>
                                                </div>
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between text-xs mt-1 text-slate-500 dark:text-slate-400">
                                                    <span>پرداخت شده: {formatPrice(enrollment.paidAmount)}</span>
                                                    <span>باقی‌مانده: {formatPrice(remainingAmount)}</span>
                                                </div>
                                            </div>

                                            {/* Installments */}
                                            {enrollment.installments && enrollment.installments.length > 0 && (
                                                <div className="space-y-2">
                                                    <h5 className="font-bold text-slate-700 dark:text-slate-300 text-sm">اقساط:</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                        {Array.isArray(enrollment.installments) && enrollment.installments.map((installment) => (
                                                            <div
                                                                key={installment.id}
                                                                className={`p-3 rounded-lg border text-sm ${installment.status === 'Paid'
                                                                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                                                                    : installment.status === 'Overdue'
                                                                        ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                                                        : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                                                                    }`}
                                                            >
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="font-bold">قسط {installment.installmentNumber}</span>
                                                                    {getPaymentStatusBadge(installment.status)}
                                                                </div>
                                                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                                                    <p>مبلغ: {formatPrice(installment.amount)}</p>
                                                                    <p>سررسید: {formatDate(installment.dueDate)}</p>
                                                                    {installment.paidAmount > 0 && (
                                                                        <p>پرداخت شده: {formatPrice(installment.paidAmount)}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            {remainingAmount > 0 && (
                                                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedEnrollment(enrollment);
                                                            setPaymentAmount(remainingAmount.toString());
                                                            setShowPaymentForm(true);
                                                        }}
                                                    >
                                                        <CreditCard size={16} className="ml-1" />
                                                        ثبت پرداخت
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            // TODO: Generate payment report
                                                            toast.success('گزارش در حال تولید است...');
                                                        }}
                                                    >
                                                        <FileText size={16} className="ml-1" />
                                                        گزارش پرداخت
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Form Modal */}
                {showPaymentForm && selectedEnrollment && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                                ثبت پرداخت جدید
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                دوره: {selectedEnrollment.course?.title}
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        مبلغ پرداخت (تومان)
                                    </label>
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        placeholder="مبلغ را وارد کنید"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        min="1"
                                        max={selectedEnrollment.totalAmount - selectedEnrollment.paidAmount}
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        حداکثر: {formatPrice(selectedEnrollment.totalAmount - selectedEnrollment.paidAmount)}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => handlePayment(selectedEnrollment.id, paymentAmount)}
                                        className="flex-1"
                                    >
                                        <CreditCard size={16} className="ml-1" />
                                        ثبت پرداخت
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowPaymentForm(false);
                                            setSelectedEnrollment(null);
                                            setPaymentAmount('');
                                        }}
                                        className="flex-1"
                                    >
                                        انصراف
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentFinancialProfile;