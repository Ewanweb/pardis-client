import { Eye, Edit, Trash2, MessageCircle } from 'lucide-react';
import { Button } from '../../../../components/UI';
import { ConsultationStatusBadge } from './ConsultationStatusBadge';
import { formatDate } from '../../../../services/Libs';

export const ConsultationTable = ({ consultations, onViewDetails, onChangeStatus, onDelete }) => {
    const safeConsultations = Array.isArray(consultations) ? consultations : [];

    if (safeConsultations.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="p-12 text-center">
                    <MessageCircle className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={48} />
                    <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">درخواستی یافت نشد</h3>
                    <p className="text-slate-400 dark:text-slate-500">هیچ درخواست مشاوره‌ای با فیلترهای انتخاب شده موجود نیست</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">درخواست‌های مشاوره</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{safeConsultations.length} درخواست</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">متقاضی</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">دوره</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">وضعیت</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">تاریخ</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">عملیات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {safeConsultations.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-slate-800 dark:text-white">{c.fullName}</p>
                                    <p className="text-sm text-slate-500 dir-ltr text-right">{c.phoneNumber}</p>
                                    {c.email && <p className="text-xs text-slate-400 dir-ltr text-right">{c.email}</p>}
                                </td>
                                <td className="px-6 py-4">
                                    {c.courseName ? <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{c.courseName}</p> : <span className="text-xs text-slate-400">عمومی</span>}
                                </td>
                                <td className="px-6 py-4"><ConsultationStatusBadge status={c.status} /></td>
                                <td className="px-6 py-4 text-sm text-slate-500">{formatDate(c.createdAt)}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => onViewDetails(c)} className="!py-1.5 !px-2">
                                            <Eye size={12} className="ml-1" />جزئیات
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => onChangeStatus(c)} className="!py-1.5 !px-2 !text-blue-600 !border-blue-200 hover:!bg-blue-50">
                                            <Edit size={12} className="ml-1" />تغییر وضعیت
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => onDelete(c.id)} className="!py-1.5 !px-2 !text-red-600 !border-red-200 hover:!bg-red-50">
                                            <Trash2 size={12} />
                                        </Button>
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
