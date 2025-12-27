import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Mail, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from './UI';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
            copied: false
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
        };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log to console in development
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        // In production, you might want to log this to an error reporting service
        // logErrorToService(error, errorInfo);
    }

    handleRefresh = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleCopyError = () => {
        const errorDetails = `
Error ID: ${this.state.errorId}
Error: ${this.state.error?.toString()}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
        `.trim();

        navigator.clipboard.writeText(errorDetails).then(() => {
            this.setState({ copied: true });
            setTimeout(() => this.setState({ copied: false }), 2000);
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50/30 to-yellow-50/20 dark:from-slate-950 dark:via-red-950/20 dark:to-slate-950 flex items-center justify-center px-4 py-8">
                    <div className="max-w-2xl mx-auto text-center">
                        {/* Error Icon */}
                        <div className="relative mb-8">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                                <AlertTriangle size={40} className="text-white animate-bounce" />
                            </div>

                            {/* Error particles */}
                            <div className="absolute inset-0 pointer-events-none">
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-2 h-2 bg-red-400 rounded-full animate-ping opacity-40"
                                        style={{
                                            left: `${20 + (i * 12)}%`,
                                            top: `${30 + (i % 2) * 40}%`,
                                            animationDelay: `${i * 0.3}s`,
                                            animationDuration: '2s'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Error Message */}
                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
                                اوه! مشکلی پیش آمده
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                                متأسفانه خطای غیرمنتظره‌ای رخ داده است. تیم فنی ما در حال بررسی مسئله هستند.
                            </p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
                                <Bug size={16} />
                                کد خطا: {this.state.errorId}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4 justify-center mb-8">
                            <Button
                                onClick={this.handleRefresh}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <RefreshCw size={20} />
                                تازه‌سازی صفحه
                            </Button>

                            <Button
                                onClick={this.handleGoHome}
                                variant="secondary"
                                className="flex items-center gap-2 px-6 py-3"
                            >
                                <Home size={20} />
                                صفحه اصلی
                            </Button>
                        </div>

                        {/* Error Details (Development) */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800 mb-8 text-right">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                        جزئیات خطا (حالت توسعه)
                                    </h3>
                                    <button
                                        onClick={this.handleCopyError}
                                        className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm transition-colors"
                                    >
                                        {this.state.copied ? (
                                            <>
                                                <CheckCircle2 size={16} className="text-green-500" />
                                                کپی شد
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={16} />
                                                کپی
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-sm font-mono text-right overflow-auto max-h-40">
                                    <div className="text-red-600 dark:text-red-400 mb-2">
                                        <strong>خطا:</strong> {this.state.error.toString()}
                                    </div>
                                    {this.state.error.stack && (
                                        <div className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                            <strong>Stack Trace:</strong>
                                            {this.state.error.stack}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Contact Support */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                                نیاز به کمک دارید؟
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                اگر این مشکل ادامه دارد، لطفاً با تیم پشتیبانی تماس بگیرید و کد خطا را ارائه دهید.
                            </p>
                            <a
                                href="mailto:support@pardistous.ir?subject=خطای سیستم&body=کد خطا: ${this.state.errorId}"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors"
                            >
                                <Mail size={16} />
                                ارسال گزارش خطا
                            </a>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                آکادمی پردیس توس - تیم فنی در حال بررسی مسئله هستند
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;