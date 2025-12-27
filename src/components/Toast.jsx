import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({
    id,
    type = 'info',
    title,
    message,
    duration = 5000,
    onClose,
    position = 'top-right',
    showProgress = true
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        // Show animation
        const showTimer = setTimeout(() => setIsVisible(true), 100);

        // Progress bar animation
        if (showProgress && duration > 0) {
            const progressTimer = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev - (100 / (duration / 100));
                    return newProgress <= 0 ? 0 : newProgress;
                });
            }, 100);

            // Auto close
            const closeTimer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => {
                clearTimeout(showTimer);
                clearInterval(progressTimer);
                clearTimeout(closeTimer);
            };
        }

        return () => clearTimeout(showTimer);
    }, [duration, showProgress]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose?.(id), 300);
    };

    const getTypeConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: CheckCircle2,
                    bgColor: 'bg-green-50 dark:bg-green-900/20',
                    borderColor: 'border-green-200 dark:border-green-800',
                    iconColor: 'text-green-500',
                    titleColor: 'text-green-800 dark:text-green-200',
                    messageColor: 'text-green-700 dark:text-green-300',
                    progressColor: 'bg-green-500'
                };
            case 'error':
                return {
                    icon: AlertCircle,
                    bgColor: 'bg-red-50 dark:bg-red-900/20',
                    borderColor: 'border-red-200 dark:border-red-800',
                    iconColor: 'text-red-500',
                    titleColor: 'text-red-800 dark:text-red-200',
                    messageColor: 'text-red-700 dark:text-red-300',
                    progressColor: 'bg-red-500'
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
                    borderColor: 'border-yellow-200 dark:border-yellow-800',
                    iconColor: 'text-yellow-500',
                    titleColor: 'text-yellow-800 dark:text-yellow-200',
                    messageColor: 'text-yellow-700 dark:text-yellow-300',
                    progressColor: 'bg-yellow-500'
                };
            default: // info
                return {
                    icon: Info,
                    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                    borderColor: 'border-blue-200 dark:border-blue-800',
                    iconColor: 'text-blue-500',
                    titleColor: 'text-blue-800 dark:text-blue-200',
                    messageColor: 'text-blue-700 dark:text-blue-300',
                    progressColor: 'bg-blue-500'
                };
        }
    };

    const config = getTypeConfig();
    const Icon = config.icon;

    const getPositionClasses = () => {
        const base = 'fixed z-50 pointer-events-auto';
        switch (position) {
            case 'top-left':
                return `${base} top-4 left-4`;
            case 'top-center':
                return `${base} top-4 left-1/2 transform -translate-x-1/2`;
            case 'top-right':
                return `${base} top-4 right-4`;
            case 'bottom-left':
                return `${base} bottom-4 left-4`;
            case 'bottom-center':
                return `${base} bottom-4 left-1/2 transform -translate-x-1/2`;
            case 'bottom-right':
                return `${base} bottom-4 right-4`;
            default:
                return `${base} top-4 right-4`;
        }
    };

    return (
        <div className={getPositionClasses()}>
            <div className={`
                max-w-sm w-full shadow-lg rounded-xl border backdrop-blur-sm
                ${config.bgColor} ${config.borderColor}
                transform transition-all duration-300 ease-out
                ${isVisible
                    ? 'translate-x-0 opacity-100 scale-100'
                    : 'translate-x-full opacity-0 scale-95'
                }
            `}>
                {/* Progress Bar */}
                {showProgress && duration > 0 && (
                    <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-t-xl overflow-hidden">
                        <div
                            className={`h-full ${config.progressColor} transition-all duration-100 ease-linear`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                <div className="p-4">
                    <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                            <Icon size={20} className={config.iconColor} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {title && (
                                <h4 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
                                    {title}
                                </h4>
                            )}
                            {message && (
                                <p className={`text-sm ${config.messageColor} leading-relaxed`}>
                                    {message}
                                </p>
                            )}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X size={16} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Toast Container Component
export const ToastContainer = ({ toasts = [], onRemove }) => {
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    style={{
                        transform: `translateY(${index * 80}px)`,
                        zIndex: 50 - index
                    }}
                >
                    <Toast
                        {...toast}
                        onClose={onRemove}
                    />
                </div>
            ))}
        </div>
    );
};

export default Toast;