import { useState } from 'react';
import { Phone, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '../../../../components/UI';

const STATUS_OPTIONS = [
    { value: 0, label: 'در انتظار', icon: Clock, colorClass: 'amber' },
    { value: 1, label: 'تماس گرفته شده', icon: Phone, colorClass: 'blue' },
    { value: 2, label: 'تکمیل شده', icon: CheckCircle2, colorClass: 'green' },
    { value: 3, label: 'لغو شده', icon: XCircle, colorClass: 'red' }
];

export const StatusUpdateModal = ({ consultation, onClose, onUpdate }) => {
    const [selectedStatus, setSelectedStatus] = useState(consultation.status);
    const [adminNotes, setAdminNotes] = useState(consultation.adminNotes || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onUpdate(consultation.id, selectedStatus, adminNotes || null);
            onClose();
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClasses = (option, isSelected) => {
        const baseClasses = 'p-4 rounded-xl border-2 transition-all';
        if (isSelected) {
            const colorMap = {
                amber: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
                blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
                green: 'border-green-500 bg-green-50 dark:bg-green-900/20',
                red: 'border-red-500 bg-red-50 dark:bg-red-900/20'
            };
            return `${baseClasses} ${colorMap[option.colorClass]}`;
        }
        return `${baseClasses} border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600`;
    };

    const getIconClasses = (option, isSelected) => {
        if (isSelected) {
            const colorMap = {
                amber: 'text-amber-600 dark:text-amber-400',
                blue: 'text-blue-600 dark:text-blue-400',
                green: 'text-green-600 dark:text-green-400',
                red: 'text-red-600 dark:text-red-400'
            };
            return colorMap[option.colorClass];
        }
        return 'text-slate-400';
    };

    const getTextClasses = (option, isSelected) => {
        if (isSelected) {
            const colorMap = {
                amber: 'text-amber-700 dark:text-amber-300',
                blue: 'text-blue-700 dark:text-blue-300',
                green: 'text-green-700 dark:text-green-300',
                red: 'text-red-700 dark:text-red-300'
            };
            return `text-sm font-bold ${colorMap[option.colorClass]}`;
        }
        return 'text-sm font-bold text-slate-600 dark:text-slate-400';
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-100 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">تغییر وضعیت درخواست</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        درخواست: {consultation.fullName}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                            وضعیت جدید
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {STATUS_OPTIONS.map((option) => {
                                const Icon = option.icon;
                                const isSelected = selectedStatus === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setSelectedStatus(option.value)}
                                        className={getStatusClasses(option, isSelected)}
                                    >
                                        <Icon
                                            size={24}
                                            className={`mx-auto mb-2 ${getIconClasses(option, isSelected)}`}
                                        />
                                        <p className={getTextClasses(option, isSelected)}>
                                            {option.label}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            یادداشت ادمین (اختیاری)
                        </label>
                        <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="یادداشت‌های خود را در مورد این درخواست وارد کنید..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={loading}
                        >
                            انصراف
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={loading}
                        >
                            {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
