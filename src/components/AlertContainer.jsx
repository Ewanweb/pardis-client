import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Copy, Check } from 'lucide-react';
import AlertService from '../services/AlertService';
import { ALERT_TYPES, ALERT_ICONS } from '../services/AlertTypes';
import { copyErrorDetails } from '../utils/clipboard';

const AlertContainer = () => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        // Subscribe به Alert Service
        const unsubscribe = AlertService.subscribe((action, data) => {
            switch (action) {
                case 'show':
                    setAlerts(prev => [...prev, data]);
                    break;
                case 'dismiss':
                    setAlerts(prev => prev.filter(alert => alert.id !== data));
                    break;
                case 'dismissAll':
                    setAlerts([]);
                    break;
            }
        });

        // بارگذاری Alert های موجود
        setAlerts(AlertService.getActiveAlerts());

        return unsubscribe;
    }, []);

    if (alerts.length === 0) return null;

    return createPortal(
        <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
            {alerts.map(alert => (
                <AlertItem
                    key={alert.id}
                    alert={alert}
                    onDismiss={() => AlertService.dismiss(alert.id)}
                />
            ))}
        </div>,
        document.body
    );
};

const AlertItem = ({ alert, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [copyStatus, setCopyStatus] = useState('idle'); // 'idle', 'copying', 'copied'

    useEffect(() => {
        // Animation ورود
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setIsLeaving(true);
        setTimeout(onDismiss, 300); // مدت زمان animation خروج
    };

    const handleCopyError = async () => {
        if (copyStatus !== 'idle') return;

        setCopyStatus('copying');

        try {
            const success = await copyErrorDetails(alert.errorObject || alert);

            if (success) {
                setCopyStatus('copied');
                // نمایش پیام موفقیت
                AlertService.success('جزئیات خطا کپی شد', { duration: 2000 });

                // بازگشت به حالت عادی بعد از 2 ثانیه
                setTimeout(() => setCopyStatus('idle'), 2000);
            } else {
                setCopyStatus('idle');
                AlertService.error('خطا در کپی کردن');
            }
        } catch (error) {
            setCopyStatus('idle');
            AlertService.error('خطا در کپی کردن');
        }
    };

    const getAlertStyles = () => {
        const baseStyles = "transform transition-all duration-300 ease-in-out";
        const visibilityStyles = isVisible && !isLeaving
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-full opacity-0 scale-95";

        const typeStyles = {
            [ALERT_TYPES.SUCCESS]: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
            [ALERT_TYPES.ERROR]: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
            [ALERT_TYPES.WARNING]: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200",
            [ALERT_TYPES.INFO]: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200"
        };

        return `${baseStyles} ${visibilityStyles} ${typeStyles[alert.type] || typeStyles[ALERT_TYPES.INFO]}`;
    };

    const getIcon = () => {
        const iconProps = { size: 20, className: "shrink-0" };

        switch (alert.type) {
            case ALERT_TYPES.SUCCESS:
                return <CheckCircle2 {...iconProps} className="text-green-600 dark:text-green-400" />;
            case ALERT_TYPES.ERROR:
                return <XCircle {...iconProps} className="text-red-600 dark:text-red-400" />;
            case ALERT_TYPES.WARNING:
                return <AlertTriangle {...iconProps} className="text-yellow-600 dark:text-yellow-400" />;
            case ALERT_TYPES.INFO:
                return <Info {...iconProps} className="text-blue-600 dark:text-blue-400" />;
            default:
                return <Info {...iconProps} />;
        }
    };

    return (
        <div className={`${getAlertStyles()} bg-white dark:bg-slate-800 rounded-xl border shadow-lg p-4 max-w-sm w-full`}>
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="mt-0.5">
                    {alert.icon || getIcon()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {alert.title && (
                        <h4 className="font-semibold text-sm mb-1 text-slate-900 dark:text-slate-100">
                            {alert.title}
                        </h4>
                    )}
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {alert.message}
                    </p>

                    {/* Actions */}
                    {alert.actions && alert.actions.length > 0 && (
                        <div className="flex gap-2 mt-3">
                            {alert.actions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        action.action();
                                        handleDismiss();
                                    }}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Close Button */}
                {alert.closable && (
                    <button
                        onClick={handleDismiss}
                        className="shrink-0 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        aria-label="بستن"
                    >
                        <X size={16} />
                    </button>
                )}

                {/* Copy Error Button (فقط برای خطاها) */}
                {alert.type === ALERT_TYPES.ERROR && (
                    <button
                        onClick={handleCopyError}
                        disabled={copyStatus !== 'idle'}
                        className="shrink-0 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
                        aria-label="کپی جزئیات خطا"
                        title="کپی جزئیات کامل خطا"
                    >
                        {copyStatus === 'copied' ? (
                            <Check size={16} className="text-green-500" />
                        ) : copyStatus === 'copying' ? (
                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Copy size={16} />
                        )}
                    </button>
                )}
            </div>

            {/* Progress Bar (برای Alert های موقت) */}
            {!alert.persistent && alert.duration > 0 && (
                <div className="mt-3 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-current opacity-30 rounded-full animate-progress"
                        style={{
                            animationDuration: `${alert.duration}ms`,
                            animationTimingFunction: 'linear'
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default AlertContainer;