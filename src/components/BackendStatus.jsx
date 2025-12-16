import React from 'react';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from './UI';

const BackendStatus = ({ feature, status = 'pending', message }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'available':
                return {
                    icon: CheckCircle2,
                    color: 'emerald',
                    text: 'فعال'
                };
            case 'pending':
                return {
                    icon: Clock,
                    color: 'amber',
                    text: 'در حال توسعه'
                };
            case 'error':
                return {
                    icon: AlertTriangle,
                    color: 'red',
                    text: 'خطا'
                };
            default:
                return {
                    icon: Clock,
                    color: 'slate',
                    text: 'نامشخص'
                };
        }
    };

    const config = getStatusConfig();
    const IconComponent = config.icon;

    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-800 dark:text-white">{feature}</h4>
                <Badge color={config.color} size="sm" className="flex items-center gap-1">
                    <IconComponent size={12} />
                    {config.text}
                </Badge>
            </div>
            {message && (
                <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
            )}
        </div>
    );
};

export default BackendStatus;