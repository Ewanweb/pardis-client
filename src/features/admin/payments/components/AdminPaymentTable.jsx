import { CheckCircle2, XCircle, Eye, Receipt } from 'lucide-react';
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
    if (payments.length === 0) {
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
                    {payments.length} پرداخت
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
                        {payments.map((payment) => (
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
        </div>
    );
};