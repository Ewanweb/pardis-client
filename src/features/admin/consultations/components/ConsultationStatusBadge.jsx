import { Clock, Phone, CheckCircle2, XCircle } from 'lucide-react';

const statusConfig = {
    Pending: { // Pending
        label: 'در انتظار',
        color: 'amber',
        icon: Clock,
        bgClass: 'bg-amber-50 dark:bg-amber-900/20',
        textClass: 'text-amber-700 dark:text-amber-300',
        borderClass: 'border-amber-200 dark:border-amber-800'
    },
    Contacted: { // Contacted
        label: 'تماس گرفته شده',
        color: 'blue',
        icon: Phone,
        bgClass: 'bg-blue-50 dark:bg-blue-900/20',
        textClass: 'text-blue-700 dark:text-blue-300',
        borderClass: 'border-blue-200 dark:border-blue-800'
    },
    Completed: { // Completed
        label: 'تکمیل شده',
        color: 'emerald',
        icon: CheckCircle2,
        bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
        textClass: 'text-emerald-700 dark:text-emerald-300',
        borderClass: 'border-emerald-200 dark:border-emerald-800'
    },
    Cancelled: { // Cancelled
        label: 'لغو شده',
        color: 'red',
        icon: XCircle,
        bgClass: 'bg-red-50 dark:bg-red-900/20',
        textClass: 'text-red-700 dark:text-red-300',
        borderClass: 'border-red-200 dark:border-red-800'
    }
};

export const ConsultationStatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig[0];
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bgClass} ${config.textClass} ${config.borderClass}`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
};
