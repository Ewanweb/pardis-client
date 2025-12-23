import React, { useState } from 'react';
import { ErrorPage, ErrorDisplay, Alert } from '../components';
import { Button } from '../components/UI';

const ErrorTestPage = () => {
    const [showErrorPage, setShowErrorPage] = useState(false);
    const [apiError, setApiError] = useState(null);

    // شبیه‌سازی خطای API
    const simulateAPIError = () => {
        const error = {
            message: 'Network Error: Unable to connect to server',
            response: {
                status: 500,
                data: {
                    message: 'Internal Server Error',
                    error: 'Database connection failed'
                }
            },
            config: {
                method: 'POST',
                url: '/api/courses',
                data: { name: 'React Course' }
            },
            stack: `Error: Network Error
    at createError (http://localhost:3000/static/js/bundle.js:1234:15)
    at settle (http://localhost:3000/static/js/bundle.js:5678:12)
    at XMLHttpRequest.handleLoad (http://localhost:3000/static/js/bundle.js:9012:7)`
        };
        setApiError(error);
    };

    // شبیه‌سازی خطای React Component
    const simulateComponentError = () => {
        const error = {
            message: 'Cannot read property \'map\' of undefined',
            name: 'TypeError',
            stack: `TypeError: Cannot read property 'map' of undefined
    at CourseList (http://localhost:3000/static/js/bundle.js:2345:20)
    at renderWithHooks (http://localhost:3000/static/js/bundle.js:6789:18)
    at updateFunctionComponent (http://localhost:3000/static/js/bundle.js:3456:20)`,
            componentStack: `
    in CourseList (at App.js:45)
    in div (at App.js:40)
    in Router (at App.js:35)
    in App (at index.js:10)`
        };
        setShowErrorPage(error);
    };

    if (showErrorPage) {
        return (
            <ErrorPage
                error={showErrorPage}
                title="خطا در کامپوننت React"
                message="یک خطای JavaScript در کامپوننت رخ داده است."
                onRefresh={() => setShowErrorPage(false)}
                onHome={() => setShowErrorPage(false)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-8">
                    تست کامپوننت‌های خطا
                </h1>

                <div className="space-y-8">
                    {/* دکمه‌های تست */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                            شبیه‌سازی خطاها
                        </h2>
                        <div className="flex gap-4">
                            <Button onClick={simulateAPIError}>
                                خطای API
                            </Button>
                            <Button onClick={simulateComponentError} variant="outline">
                                خطای React Component
                            </Button>
                            <Button
                                onClick={() => setApiError(null)}
                                variant="ghost"
                                disabled={!apiError}
                            >
                                پاک کردن خطاها
                            </Button>
                        </div>
                    </div>

                    {/* نمایش خطای API با ErrorDisplay */}
                    {apiError && (
                        <ErrorDisplay
                            error={apiError}
                            title="خطا در بارگذاری دوره‌ها"
                            className="mb-6"
                        />
                    )}

                    {/* نمایش خطای API با Alert */}
                    {apiError && (
                        <Alert
                            type="error"
                            title="خطا در ارتباط با سرور"
                            message="امکان دریافت اطلاعات دوره‌ها وجود ندارد. لطفاً اتصال اینترنت خود را بررسی کنید."
                            errorObject={apiError}
                            onClose={() => setApiError(null)}
                        />
                    )}

                    {/* راهنمای استفاده */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-4">
                            راهنمای استفاده از دکمه کپی
                        </h3>
                        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                            <p>• در حالت Development، جزئیات کامل خطا نمایش داده می‌شود</p>
                            <p>• دکمه کپی در کنار جزئیات خطا قرار دارد</p>
                            <p>• با کلیک روی دکمه کپی، تمام اطلاعات خطا کپی می‌شود شامل:</p>
                            <ul className="list-disc list-inside mr-4 space-y-1">
                                <li>زمان وقوع خطا</li>
                                <li>URL صفحه</li>
                                <li>پیام خطا</li>
                                <li>Stack trace</li>
                                <li>اطلاعات HTTP (در صورت وجود)</li>
                                <li>اطلاعات مرورگر</li>
                            </ul>
                            <p>• پس از کپی موفق، آیکون تیک سبز نمایش داده می‌شود</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorTestPage;