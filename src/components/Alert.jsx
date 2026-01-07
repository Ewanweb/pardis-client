import { useState } from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X, AlertTriangle, Copy, Check } from 'lucide-react';
import { copyErrorDetails } from '../utils/clipboard';

const Alert = ({
    type = 'info',
    title,
    message,
    onClose,
    closable = true,
    className = '',
    actions = null,
    icon = null,
    errorObject = null
}) => {
    const types = {
        success: {
            bgClass: 'bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20',
            borderClass: 'border-secondary-200 dark:border-secondary-800/50',
            iconClass: 'text-secondary-600 dark:text-secondary-400',
            titleClass: 'text-secondary-800 dark:text-secondary-200',
            messageClass: 'text-secondary-700 dark:text-secondary-300',
            defaultIcon: CheckCircle2
        },
        error: {
            bgClass: 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
            borderClass: 'border-red-200 dark:border-red-800/50',
            iconClass: 'text-red-600 dark:text-red-400',
            titleClass: 'text-red-800 dark:text-red-200',
            messageClass: 'text-red-700 dark:text-red-300',
            defaultIcon: XCircle
        },
        warning: {
            bgClass: 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',
            borderClass: 'border-amber-200 dark:border-amber-800/50',
            iconClass: 'text-amber-600 dark:text-amber-400',
            titleClass: 'text-amber-800 dark:text-amber-200',
            messageClass: 'text-amber-700 dark:text-amber-300',
            defaultIcon: AlertTriangle
        },
        info: {
            bgClass: 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20',
            borderClass: 'border-primary-200 dark:border-primary-800/50',
            iconClass: 'text-primary-600 dark:text-primary-400',
            titleClass: 'text-primary-800 dark:text-primary-200',
            messageClass: 'text-primary-700 dark:text-primary-300',
            defaultIcon: Info
        }
    };

    const config = types[type] || types.info;
    const IconComponent = icon || config.defaultIcon;

    const [copyStatus, setCopyStatus] = useState('idle'); // 'idle', 'copying', 'copied'

    const handleCopyError = async () => {
        if (copyStatus !== 'idle' || !errorObject) return;

        setCopyStatus('copying');

        try {
            const success = await copyErrorDetails(errorObject);

            if (success) {
                setCopyStatus('copied');
                setTimeout(() => setCopyStatus('idle'), 2000);
            } else {
                setCopyStatus('idle');
            }
        } catch (error) {
            setCopyStatus('idle');
        }
    };

    return (
        <div className={`relative p-6 rounded-2xl border backdrop-blur-sm shadow-lg animate-in fade-in slide-in-from-top-4 duration-500 ${config.bgClass} ${config.borderClass} ${className}`}>
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 ${config.iconClass}`}>
                    <IconComponent size={24} strokeWidth={2.5} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {title && (
                        <h3 className={`text-lg font-bold mb-2 ${config.titleClass}`}>
                            {title}
                        </h3>
                    )}
                    {message && (
                        <div className={`text-sm leading-relaxed ${config.messageClass}`}>
                            {typeof message === 'string' ? (
                                <p>{message}</p>
                            ) : (
                                message
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    {actions && (
                        <div className="mt-4 flex items-center gap-3">
                            {actions}
                        </div>
                    )}
                </div>

                {/* Close Button */}
                {closable && onClose && (
                    <button
                        onClick={onClose}
                        className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${config.iconClass}`}
                    >
                        <X size={18} />
                    </button>
                )}

                {/* Copy Error Button (فقط برای خطاها) */}
                {type === 'error' && errorObject && (
                    <button
                        onClick={handleCopyError}
                        disabled={copyStatus !== 'idle'}
                        className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50 ${config.iconClass}`}
                        title="کپی جزئیات کامل خطا"
                    >
                        {copyStatus === 'copied' ? (
                            <Check size={18} className="text-green-500" />
                        ) : copyStatus === 'copying' ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Copy size={18} />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

// کامپوننت Alert برای خطاهای API
export const APIErrorAlert = ({ error, onRetry, onClose, className = '' }) => {
    const getErrorInfo = (error) => {
        if (!error) return { title: 'خطای نامشخص', message: 'خطایی رخ داده است.' };

        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        switch (status) {
            case 400:
                return {
                    title: 'درخواست نامعتبر',
                    message: message || 'اطلاعات ارسالی صحیح نیست. لطفاً دوباره تلاش کنید.'
                };
            case 401:
                return {
                    title: 'عدم احراز هویت',
                    message: 'لطفاً وارد حساب کاربری خود شوید.'
                };
            case 403:
                return {
                    title: 'عدم دسترسی',
                    message: 'شما اجازه دسترسی به این بخش را ندارید.'
                };
            case 404:
                return {
                    title: 'یافت نشد',
                    message: message || 'اطلاعات مورد نظر یافت نشد.'
                };
            case 409:
                return {
                    title: 'تداخل اطلاعات',
                    message: message || 'شما قبلاً این عمل را انجام داده‌اید.'
                };
            case 422:
                return {
                    title: 'اطلاعات نامعتبر',
                    message: message || 'لطفاً اطلاعات را بررسی کرده و دوباره تلاش کنید.'
                };
            case 500:
                return {
                    title: 'خطای سرور',
                    message: 'مشکلی در سرور رخ داده است. لطفاً بعداً تلاش کنید.'
                };
            default:
                return {
                    title: 'خطای اتصال',
                    message: message || 'مشکلی در اتصال به سرور رخ داده است.'
                };
        }
    };

    const { title, message } = getErrorInfo(error);

    const actions = (
        <div className="flex gap-2">
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
                >
                    تلاش مجدد
                </button>
            )}
        </div>
    );

    return (
        <Alert
            type="error"
            title={title}
            message={message}
            onClose={onClose}
            actions={onRetry ? actions : null}
            className={className}
            errorObject={error}
        />
    );
};

// کامپوننت Alert برای ثبت‌نام تکراری
export const DuplicateEnrollmentAlert = ({ courseName, onViewProfile, onClose, className = '' }) => {
    const actions = (
        <div className="flex gap-2">
            <button
                onClick={onViewProfile}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
            >
                مشاهده در پنل کاربری
            </button>
        </div>
    );

    return (
        <Alert
            type="warning"
            title="قبلاً ثبت‌نام کرده‌اید"
            message={
                <div>
                    <p className="mb-2">
                        شما قبلاً در دوره <strong>{courseName}</strong> ثبت‌نام کرده‌اید.
                    </p>
                    <p>
                        می‌توانید از پنل کاربری خود به محتوای دوره دسترسی داشته باشید.
                    </p>
                </div>
            }
            onClose={onClose}
            actions={actions}
            className={className}
        />
    );
};

export default Alert;