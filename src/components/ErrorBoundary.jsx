import React from 'react';
import { AlertTriangle, RefreshCw, Home, Copy, Check } from 'lucide-react';
import { Button } from './UI';
import { copyErrorDetails } from '../utils/clipboard';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            copyStatus: 'idle' // 'idle', 'copying', 'copied'
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log error to console for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleCopyError = async () => {
        if (this.state.copyStatus !== 'idle' || !this.state.error) return;

        this.setState({ copyStatus: 'copying' });

        try {
            // ایجاد یک آبجکت خطای کامل برای کپی
            const errorObject = {
                message: this.state.error.message,
                stack: this.state.error.stack,
                componentStack: this.state.errorInfo?.componentStack,
                name: this.state.error.name,
                toString: () => this.state.error.toString()
            };

            const success = await copyErrorDetails(errorObject);

            if (success) {
                this.setState({ copyStatus: 'copied' });
                setTimeout(() => this.setState({ copyStatus: 'idle' }), 2000);
            } else {
                this.setState({ copyStatus: 'idle' });
            }
        } catch (error) {
            console.error('Failed to copy error details:', error);
            this.setState({ copyStatus: 'idle' });
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                    <div className="max-w-md w-full">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-lg text-center">
                            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 dark:text-red-400">
                                <AlertTriangle size={40} />
                            </div>

                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-4">
                                خطایی رخ داده است!
                            </h2>

                            <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                متأسفانه مشکلی در نمایش این صفحه پیش آمده است. لطفاً صفحه را تازه‌سازی کنید یا به صفحه اصلی بازگردید.
                            </p>

                            {/* Development mode: Show error details */}
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4 mb-6 text-left relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-bold text-red-800 dark:text-red-200">
                                            Error Details (Development Mode):
                                        </h3>
                                        <button
                                            onClick={this.handleCopyError}
                                            disabled={this.state.copyStatus !== 'idle'}
                                            className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors disabled:opacity-50 text-red-600 dark:text-red-400"
                                            title="کپی جزئیات کامل خطا"
                                        >
                                            {this.state.copyStatus === 'copied' ? (
                                                <Check size={16} className="text-green-500" />
                                            ) : this.state.copyStatus === 'copying' ? (
                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Copy size={16} />
                                            )}
                                        </button>
                                    </div>
                                    <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto max-h-32">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => window.location.reload()}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <RefreshCw size={18} className="ml-2" />
                                    تازه‌سازی
                                </Button>
                                <Button
                                    onClick={() => window.location.href = '/'}
                                    className="flex-1"
                                >
                                    <Home size={18} className="ml-2" />
                                    صفحه اصلی
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;