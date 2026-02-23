import { CheckCircle2, XCircle, Eye, Receipt, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../../components/UI';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { canApproveOrReject, getStatusNumber } from '../utils/paymentStatus';
import { formatPrice, formatDate } from '../../../../services/Libs';

export const AdminPaymentTable = ({
    payments,
    onApprove,
    onReject,
    onViewDetails,
    onViewReceipt
}) => {
    const [showCoursesModal, setShowCoursesModal] = useState(false);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [selectedPaymentInfo, setSelectedPaymentInfo] = useState(null);

    const handleViewCourses = (payment) => {
        console.log('Payment data:', payment);
        console.log('Course items:', payment.courseItems);
        setSelectedCourses(payment.courseItems || []);
        setSelectedPaymentInfo({
            studentName: payment.studentName,
            orderNumber: payment.orderNumber
        });
        setShowCoursesModal(true);
    };

    // Ensure payments is always an array
    const safePayments = Array.isArray(payments) ? payments : [];

    // Debug: log first payment to see structure
    if (safePayments.length > 0) {
        console.log('First payment sample:', safePayments[0]);
    }

    if (safePayments.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="p-12 text-center">
                    <Receipt className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={48} />
                    <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">
                        پرداختی یافت نشد
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500">
                        هیچ پرداختی با فیلترهای انتخاب شده موجود نیست
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    همه پرداخت‌ها
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {safePayments.length} پرداخت
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                دانشجو
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                دوره‌ها
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                سفارش
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
                        {safePayments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white">
                                            <Receipt size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">
                                                {payment.studentName}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                کد پیگیری: {payment.trackingCode}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {payment.courseItems && payment.courseItems.length > 0 ? (
                                            <>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    {payment.courseItems.length} دوره
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewCourses(payment)}
                                                    className="!py-1 !px-2 !text-xs"
                                                >
                                                    <BookOpen size={12} className="ml-1" />
                                                    مشاهده
                                                </Button>
                                            </>
                                        ) : (
                                            <span className="text-sm text-slate-400 dark:text-slate-500">-</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-medium text-slate-800 dark:text-white">
                                        {payment.orderNumber}
                                    </p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-bold text-slate-800 dark:text-white">
                                        {formatPrice(payment.amount)} تومان
                                    </p>
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
                                            onClick={() => onViewDetails(payment)}
                                            className="!py-1.5 !px-2"
                                        >
                                            <Eye size={12} className="ml-1" />
                                            جزئیات
                                        </Button>

                                        {canApproveOrReject(payment.status) && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onApprove(payment.id)}
                                                    className="!py-1.5 !px-2 !text-green-600 !border-green-200 hover:!bg-green-50"
                                                >
                                                    <CheckCircle2 size={12} className="ml-1" />
                                                    تایید
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onReject(payment.id)}
                                                    className="!py-1.5 !px-2 !text-red-600 !border-red-200 hover:!bg-red-50"
                                                >
                                                    <XCircle size={12} className="ml-1" />
                                                    رد
                                                </Button>
                                            </>
                                        )}

                                        {payment.receiptImageUrl && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onViewReceipt(payment.receiptImageUrl, payment)}
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

            {/* Courses Modal */}
            {showCoursesModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-100 dark:border-slate-800 shadow-xl max-h-[80vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <BookOpen size={24} className="text-blue-500" />
                                        دوره‌های سفارش
                                    </h3>
                                    {selectedPaymentInfo && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            دانشجو: {selectedPaymentInfo.studentName} | سفارش: {selectedPaymentInfo.orderNumber}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowCoursesModal(false)}
                                >
                                    بستن
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {selectedCourses.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedCourses.map((course, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow"
                                        >
                                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800 dark:text-white">
                                                    {course.courseTitle || 'نامشخص'}
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                    قیمت: {formatPrice(course.price)} تومان
                                                </p>
                                            </div>
                                            <BookOpen size={20} className="text-blue-500 flex-shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <BookOpen className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={48} />
                                    <p className="text-slate-500 dark:text-slate-400">
                                        هیچ دوره‌ای یافت نشد
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    تعداد کل: <span className="font-bold text-slate-800 dark:text-white">{selectedCourses.length}</span> دوره
                                </p>
                                <Button
                                    onClick={() => setShowCoursesModal(false)}
                                    variant="outline"
                                >
                                    بستن
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};