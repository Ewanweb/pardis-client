import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Database, Shield, Mail, Globe, Server, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button, Badge } from '../../components/UI';
import { apiClient } from '../../services/api';
import { useAlert } from '../../hooks/useAlert';

const SystemSettings = () => {
    const alert = useAlert();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        siteName: '',
        siteUrl: '',
        adminEmail: '',
        maintenanceMode: false,
        registrationEnabled: true,
        emailVerificationRequired: false,
        maxFileUploadSize: 10,
        sessionTimeout: 30,
        passwordMinLength: 6,
        enableTwoFactor: false,
        smtpHost: '',
        smtpPort: 587,
        smtpUsername: '',
        smtpPassword: '',
        smtpEncryption: 'tls'
    });

    const [systemInfo, setSystemInfo] = useState({
        version: '1.0.0',
        environment: 'Production',
        uptime: '0 days',
        memoryUsage: '0 MB',
        diskSpace: '0 GB',
        lastBackup: null
    });

    useEffect(() => {
        fetchSettings();
        fetchSystemInfo();
    }, []);

    const fetchSettings = async () => {
        try {
            // This would be a real API call to get system settings
            // For now, using mock data since the backend endpoint doesn't exist yet
            setSettings({
                siteName: 'آکادمی پردیس توس',
                siteUrl: 'https://pardis-academy.com',
                adminEmail: 'admin@pardis-academy.com',
                maintenanceMode: false,
                registrationEnabled: true,
                emailVerificationRequired: false,
                maxFileUploadSize: 10,
                sessionTimeout: 30,
                passwordMinLength: 6,
                enableTwoFactor: false,
                smtpHost: 'smtp.gmail.com',
                smtpPort: 587,
                smtpUsername: '',
                smtpPassword: '',
                smtpEncryption: 'tls'
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
            alert.showError('خطا در دریافت تنظیمات سیستم');
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemInfo = async () => {
        try {
            // This would be a real API call to get system information
            // For now, using mock data
            setSystemInfo({
                version: '1.0.0',
                environment: 'Production',
                uptime: '15 days, 8 hours',
                memoryUsage: '2.4 GB',
                diskSpace: '45.2 GB free of 100 GB',
                lastBackup: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching system info:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // This would be a real API call to save settings
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            alert.showSuccess('تنظیمات با موفقیت ذخیره شد');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert.showError('خطا در ذخیره تنظیمات');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                            ))}
                        </div>
                        <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                        <Settings size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">تنظیمات سیستم</h1>
                        <p className="text-slate-500 dark:text-slate-400">مدیریت تنظیمات کلی سیستم</p>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2"
                >
                    {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Settings Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Settings */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Globe size={20} className="text-indigo-600 dark:text-indigo-400" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">تنظیمات عمومی</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    نام سایت
                                </label>
                                <input
                                    type="text"
                                    value={settings.siteName}
                                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    آدرس سایت
                                </label>
                                <input
                                    type="url"
                                    value={settings.siteUrl}
                                    onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    ایمیل مدیر سیستم
                                </label>
                                <input
                                    type="email"
                                    value={settings.adminEmail}
                                    onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield size={20} className="text-emerald-600 dark:text-emerald-400" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">تنظیمات امنیتی</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">حالت تعمیر و نگهداری</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">غیرفعال کردن دسترسی عمومی</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">فعال بودن ثبت‌نام</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">اجازه ثبت‌نام کاربران جدید</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.registrationEnabled}
                                        onChange={(e) => handleInputChange('registrationEnabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    حداقل طول رمز عبور
                                </label>
                                <input
                                    type="number"
                                    min="6"
                                    max="20"
                                    value={settings.passwordMinLength}
                                    onChange={(e) => handleInputChange('passwordMinLength', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email Settings */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Mail size={20} className="text-blue-600 dark:text-blue-400" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">تنظیمات ایمیل</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        SMTP Host
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.smtpHost}
                                        onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        SMTP Port
                                    </label>
                                    <input
                                        type="number"
                                        value={settings.smtpPort}
                                        onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
                                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    SMTP Username
                                </label>
                                <input
                                    type="text"
                                    value={settings.smtpUsername}
                                    onChange={(e) => handleInputChange('smtpUsername', e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Information Sidebar */}
                <div className="space-y-6">
                    {/* System Status */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Server size={20} className="text-green-600 dark:text-green-400" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">وضعیت سیستم</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">وضعیت:</span>
                                <Badge color="emerald" className="flex items-center gap-1">
                                    <CheckCircle2 size={12} />
                                    آنلاین
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">نسخه:</span>
                                <span className="text-sm font-medium text-slate-800 dark:text-white">{systemInfo.version}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">محیط:</span>
                                <Badge color="blue">{systemInfo.environment}</Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">مدت فعالیت:</span>
                                <span className="text-sm font-medium text-slate-800 dark:text-white">{systemInfo.uptime}</span>
                            </div>
                        </div>
                    </div>

                    {/* Resource Usage */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Database size={20} className="text-purple-600 dark:text-purple-400" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">منابع سیستم</h3>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600 dark:text-slate-400">حافظه:</span>
                                    <span className="font-medium text-slate-800 dark:text-white">{systemInfo.memoryUsage}</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600 dark:text-slate-400">فضای دیسک:</span>
                                    <span className="font-medium text-slate-800 dark:text-white">{systemInfo.diskSpace}</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">عملیات سریع</h3>

                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                <Database size={16} className="ml-2" />
                                پشتیبان‌گیری از دیتابیس
                            </Button>

                            <Button variant="outline" className="w-full justify-start">
                                <RefreshCw size={16} className="ml-2" />
                                پاک کردن کش
                            </Button>

                            <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                                <AlertTriangle size={16} className="ml-2" />
                                راه‌اندازی مجدد سیستم
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;