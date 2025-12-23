import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Home, Copy, Check } from 'lucide-react';
import { Button } from './UI';
import { copyErrorDetails } from '../utils/clipboard';

const ErrorPage = ({
    error = null,
    title = 'خطایی رخ داده است!',
    message = 'متأسفانه مشکلی در نمایش این صفحه پیش آمده است. لطفاً صفحه را تازه‌سازی کنید یا به صفحه اصلی بازگردید.',
    showRefresh = true,
    showHome = true,
    showErrorDetails = process.env.NODE_ENV === 'development',
    onRefresh = () => window.location.reload(),
    onHome = () => window.location.href = '/',
    className = ''
}) => {
    const [copyStatus, setCopyStatus] = useState('idle'); // 'idle', 'copying', 'copied'

    const handleCopyError = async () => {
        if (copyStatus !== 'idle' || !error) return;

        setCopyStatus('copying');

        try {
            const success = await copyErrorDetails(error);

            if (success) {
                setCopyStatus('copied');
                setTimeout(() => setCopyStatus('idle'), 2000);
            } else {
                setCopyStatus('idle');
            }
        } catch (err) {
            console.error('Failed to copy error details:', err);
            setCopyStatus('idle');
        }
    };

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 ${className}`}>
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-lg text-center">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 dark:text-red-400">
                        <AlertTriangle size={40} />
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-4">
                        {title}
                    </h2>

                    <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                        {message}
                    </p>

                    {/* Error details section */}
                    {showErrorDetails && error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4 mb-6 text-left relative">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-red-800 dark:text-red-200">
                                    Error Details (Development Mode):
                                </h3>
                                <button
                                    onClick={handleCopyError}
                                    disabled={copyStatus !== 'idle'}
                                    className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors disabled:opacity-50 text-red-600 dark:text-red-400"
                                    title="کپی جزئیات کامل خطا"
                                >
                                    {copyStatus === 'copied' ? (
                                        <Check size={16} className="text-green-500" />
                                    ) : copyStatus === 'copying' ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Copy size={16} />
                                    )}
                                </button>
                            </div>
                            <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto max-h-32">
                                {typeof error === 'string' ? error : (
                                    error.stack || error.message || error.toString()
                                )}
                            </pre>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        {showRefresh && (
                            <Button
                                onClick={onRefresh}
                                variant="outline"
                                className="flex-1"
                            >
                                <RefreshCw size={18} className="ml-2" />
                                تازه‌سازی
                            </Button>
                        )}
                        {showHome && (
                            <Button
                                onClick={onHome}
                                className="flex-1"
                            >
                                <Home size={18} className="ml-2" />
                                صفحه اصلی
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;