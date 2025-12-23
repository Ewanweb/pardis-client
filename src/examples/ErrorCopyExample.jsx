import React from 'react';
import { useAlert } from '../hooks/useAlert';
import { Button } from '../components/UI';

const ErrorCopyExample = () => {
    const alert = useAlert();

    const simulateNetworkError = () => {
        const mockError = {
            message: 'Network Error: Failed to fetch data',
            response: {
                status: 500,
                data: {
                    message: 'Internal Server Error',
                    errorCode: 'SERVER_ERROR_001',
                    errorDetails: {
                        timestamp: new Date().toISOString(),
                        path: '/api/courses',
                        method: 'GET'
                    }
                },
                headers: {
                    'content-type': 'application/json',
                    'x-request-id': 'req-123456789'
                }
            },
            config: {
                method: 'get',
                url: '/api/courses',
                data: null
            },
            stack: `Error: Network Error
    at XMLHttpRequest.handleError (axios.js:123)
    at XMLHttpRequest.dispatchEvent (EventTarget.js:456)
    at XMLHttpRequest.setReadyState (XMLHttpRequest.js:789)`
        };

        alert.showErrorWithDetails(
            'خطا در دریافت اطلاعات دوره‌ها',
            mockError,
            {
                title: 'خطای سرور',
                duration: 10000
            }
        );
    };

    const simulateValidationError = () => {
        const mockError = {
            message: 'Validation failed',
            response: {
                status: 422,
                data: {
                    message: 'The given data was invalid.',
                    errors: {
                        email: ['The email field is required.'],
                        password: ['The password must be at least 8 characters.']
                    }
                }
            },
            config: {
                method: 'post',
                url: '/api/auth/register',
                data: {
                    name: 'John Doe',
                    email: '',
                    password: '123'
                }
            }
        };

        alert.showErrorWithDetails(
            'خطای اعتبارسنجی در ثبت‌نام',
            mockError,
            {
                title: 'اطلاعات نامعتبر',
                duration: 8000
            }
        );
    };

    const simulateJavaScriptError = () => {
        const mockError = {
            name: 'TypeError',
            message: "Cannot read property 'map' of undefined",
            stack: `TypeError: Cannot read property 'map' of undefined
    at CourseList.render (CourseList.jsx:45:23)
    at ReactDOMComponent.render (ReactDOMComponent.js:234)
    at ReactCompositeComponent._renderValidatedComponent (ReactCompositeComponent.js:567)`
        };

        alert.showErrorWithDetails(
            'خطای JavaScript در رندر کامپوننت',
            mockError,
            {
                title: 'خطای برنامه‌نویسی',
                duration: 12000
            }
        );
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">
                تست دکمه کپی خطا
            </h2>

            <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold mb-2 text-slate-700 dark:text-slate-300">
                        خطای شبکه (Network Error)
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        شامل اطلاعات HTTP response، headers، و stack trace
                    </p>
                    <Button onClick={simulateNetworkError} variant="outline">
                        نمایش خطای شبکه
                    </Button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold mb-2 text-slate-700 dark:text-slate-300">
                        خطای اعتبارسنجی (Validation Error)
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        شامل جزئیات validation errors و request data
                    </p>
                    <Button onClick={simulateValidationError} variant="outline">
                        نمایش خطای اعتبارسنجی
                    </Button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold mb-2 text-slate-700 dark:text-slate-300">
                        خطای JavaScript (Runtime Error)
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        شامل stack trace و اطلاعات محیط اجرا
                    </p>
                    <Button onClick={simulateJavaScriptError} variant="outline">
                        نمایش خطای JavaScript
                    </Button>
                </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                    نحوه استفاده:
                </h3>
                <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>1. روی یکی از دکمه‌ها کلیک کنید</li>
                    <li>2. Alert خطا نمایش داده می‌شود</li>
                    <li>3. روی آیکون کپی (📋) کلیک کنید</li>
                    <li>4. جزئیات کامل خطا کپی می‌شود</li>
                    <li>5. می‌توانید در هر جایی paste کنید</li>
                </ol>
            </div>
        </div>
    );
};

export default ErrorCopyExample;