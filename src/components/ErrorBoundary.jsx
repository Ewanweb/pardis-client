import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './UI';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
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
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4 mb-6 text-left">
                                    <h3 className="text-sm font-bold text-red-800 dark:text-red-200 mb-2">
                                        Error Details (Development Mode):
                                    </h3>
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