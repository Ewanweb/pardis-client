import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { PaymentStatus, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_STYLES, getStatusNumber } from '../utils/paymentStatus';

const STATUS_ICONS = {
    [PaymentStatus.DRAFT]: Clock,
    [PaymentStatus.PENDING_PAYMENT]: Clock,
    [PaymentStatus.AWAITING_ADMIN_APPROVAL]: AlertTriangle,
    [PaymentStatus.PAID]: CheckCircle2,
    [PaymentStatus.FAILED]: XCircle
};

export const PaymentStatusBadge = ({ status }) => {
    const numericStatus = getStatusNumber(status);
    const Icon = STATUS_ICONS[numericStatus] || Clock;
    const label = PAYMENT_STATUS_LABELS[numericStatus] || 'نامشخص';
    const className = PAYMENT_STATUS_STYLES[numericStatus] || PAYMENT_STATUS_STYLES[PaymentStatus.DRAFT];

    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${className}`}>
            <Icon size={12} />
            {label}
        </span>
    );
};