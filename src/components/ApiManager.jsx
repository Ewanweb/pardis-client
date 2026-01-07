import { useState } from 'react';
import { Settings, Globe, TestTube, Info, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { ApiManager } from '../services/api';
import { Button } from './UI';
import { useAlert } from '../hooks/useAlert';

/**
 * کامپوننت مدیریت API - نمایش و تغییر تنظیمات API
 */
const ApiManagerComponent = () => {
    const [apiUrl, setApiUrl] = useState('');
    const [timeout, setTimeout] = useState('');
    const [config, setConfig] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const alert = useAlert();

    // دریافت تنظیمات فعلی
    const handleGetConfig = () => {
        const currentConfig = ApiManager.getConfig();
        setConfig(currentConfig);
        ApiManager.showInfo(); // نمایش در console
        alert.showSuccess('تنظیمات در console نمایش داده شد');
    };

    // تغییر آدرس API
    const handleChangeApiUrl = () => {
        if (!apiUrl.trim()) {
            alert.showValidationError('آدرس API را وارد کنید');
            return;
        }

        try {
            ApiManager.setApiUrl(apiUrl.trim());
            setConfig(ApiManager.getConfig());
            alert.showSuccess('آدرس API با موفقیت تغییر کرد!');
            setApiUrl('');
        } catch (error) {
            alert.showError('خطا در تغییر آدرس API');
        }
    };

    // تغییر timeout
    const handleChangeTimeout = () => {
        const timeoutValue = parseInt(timeout);
        if (!timeoutValue || timeoutValue < 1000) {
            alert.showValidationError('timeout باید حداقل 1000 میلی‌ثانیه باشد');
            return;
        }

        try {
            ApiManager.setTimeout(timeoutValue);
            setConfig(ApiManager.getConfig());
            alert.showSuccess(`Timeout به ${timeoutValue}ms تغییر کرد`);
            setTimeout('');
        } catch (error) {
            alert.showError('خطا در تغییر timeout');
        }
    };

    // تست اتصال به API
    const handleTestConnection = async () => {
        setLoading(true);
        setTestResult(null);

        try {
            const result = await ApiManager.testConnection();
            setTestResult(result);

            if (result.success) {
                alert.showSuccess('اتصال به API موفق بود!');
            } else {
                alert.showError(`خطا در اتصال: ${result.error}`);
            }
        } catch (error) {
            setTestResult({ success: false, error: error.message });
            alert.showError('خطا در تست اتصال');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Settings className="text-indigo-600 dark:text-indigo-400" size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">مدیریت API</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">تنظیمات و مدیریت اتصال API</p>
                </div>
            </div>

            {/* نمایش تنظیمات فعلی */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-700 dark:text-slate-300">تنظیمات فعلی</h4>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGetConfig}
                        icon={Info}
                    >
                        نمایش جزئیات
                    </Button>
                </div>

                {config && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Server URL:</span>
                            <span className="text-sm font-mono text-slate-800 dark:text-slate-200">{config.serverUrl}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">API URL:</span>
                            <span className="text-sm font-mono text-slate-800 dark:text-slate-200">{config.apiUrl}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Timeout:</span>
                            <span className="text-sm font-mono text-slate-800 dark:text-slate-200">{config.timeout}ms</span>
                        </div>
                    </div>
                )}
            </div>

            {/* تغییر آدرس API */}
            <div className="space-y-3">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Globe size={16} />
                    تغییر آدرس API
                </h4>
                <div className="flex gap-2">
                    <input
                        type="url"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        placeholder="https://api.example.com"
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        dir="ltr"
                    />
                    <Button size="sm" onClick={handleChangeApiUrl}>
                        تغییر
                    </Button>
                </div>
            </div>

            {/* تغییر Timeout */}
            <div className="space-y-3">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">تغییر Timeout</h4>
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={timeout}
                        onChange={(e) => setTimeout(e.target.value)}
                        placeholder="30000"
                        min="1000"
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                    <span className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">ms</span>
                    <Button size="sm" onClick={handleChangeTimeout}>
                        تغییر
                    </Button>
                </div>
            </div>

            {/* تست اتصال */}
            <div className="space-y-3">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <TestTube size={16} />
                    تست اتصال
                </h4>

                <Button
                    onClick={handleTestConnection}
                    disabled={loading}
                    icon={loading ? RefreshCw : TestTube}
                    className={loading ? 'animate-spin' : ''}
                >
                    {loading ? 'در حال تست...' : 'تست اتصال به API'}
                </Button>

                {testResult && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${testResult.success
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        }`}>
                        {testResult.success ? (
                            <CheckCircle size={16} />
                        ) : (
                            <XCircle size={16} />
                        )}
                        <span className="text-sm font-medium">
                            {testResult.success ? 'اتصال موفق!' : `خطا: ${testResult.error}`}
                        </span>
                    </div>
                )}
            </div>

            {/* راهنما */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h5 className="font-bold text-blue-800 dark:text-blue-300 mb-2">💡 راهنما</h5>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• تغییرات در تمام کامپوننت‌ها اعمال می‌شود</li>
                    <li>• برای تغییر دائمی از فایل .env استفاده کنید</li>
                    <li>• تست اتصال endpoint /health-check را بررسی می‌کند</li>
                </ul>
            </div>
        </div>
    );
};

export default ApiManagerComponent;