import { useMemo, useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Search, Plus, X, AlertTriangle, Database, Shield, SlidersHorizontal, Upload, Image as ImageIcon, Globe, Trash2 } from 'lucide-react';
import { Button, Badge } from '../../components/UI';
import { apiClient, API_URL } from '../../services/api';
import { useAlert } from '../../hooks/useAlert';
import { formatDate, getImageUrl } from '../../services/Libs';
import { adminBlogService } from '../../features/blog/services/adminBlogService';
import toast from 'react-hot-toast';

const DEFAULT_GROUP_LABELS = {
    ManualPayment: 'پرداخت دستی',
    Payment: 'پرداخت',
    Auth: 'احراز هویت',
    Security: 'امنیت',
    Email: 'ایمیل',
    System: 'سیستم'
};

const SystemSettings = () => {
    const alert = useAlert();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [version, setVersion] = useState(1);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [updatedBy, setUpdatedBy] = useState('');
    const [settingsMap, setSettingsMap] = useState({});
    const [initialMap, setInitialMap] = useState({});
    const [search, setSearch] = useState('');
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const response = await apiClient.get('/admin/system/settings', {
            showSuccessAlert: false
        });

        if (response?.success) {
            const data = response.data || {};
            const map = data.data || {};

            setVersion(data.version || 1);
            setUpdatedAt(data.updatedAt || null);
            setUpdatedBy(data.updatedBy || 'System');
            setSettingsMap(map);
            setInitialMap(map);
        } else {
            alert.showError('خطا در دریافت تنظیمات سیستم');
        }

        setLoading(false);
    };

    const hasChanges = useMemo(() => {
        const keys = new Set([...Object.keys(initialMap), ...Object.keys(settingsMap)]);
        for (const key of keys) {
            if ((initialMap[key] ?? '') !== (settingsMap[key] ?? '')) return true;
        }
        return false;
    }, [initialMap, settingsMap]);

    const groupedSettings = useMemo(() => {
        const entries = Object.entries(settingsMap)
            .filter(([key, value]) => {
                if (!search.trim()) return true;
                const q = search.toLowerCase();
                return key.toLowerCase().includes(q) || String(value).toLowerCase().includes(q);
            })
            .sort((a, b) => a[0].localeCompare(b[0]));

        return entries.reduce((acc, [key, value]) => {
            const group = key.split('.')[0] || 'System';
            acc[group] = acc[group] || [];
            acc[group].push({ key, value });
            return acc;
        }, {});
    }, [settingsMap, search]);

    const handleChange = (key, value) => {
        setSettingsMap(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleRemove = (key) => {
        const next = { ...settingsMap };
        delete next[key];
        setSettingsMap(next);
    };

    const handleAdd = () => {
        if (!newKey.trim()) {
            alert.showError('کلید تنظیم را وارد کنید');
            return;
        }
        setSettingsMap(prev => ({
            ...prev,
            [newKey.trim()]: newValue ?? ''
        }));
        setNewKey('');
        setNewValue('');
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('لطفاً یک فایل تصویری انتخاب کنید');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('حجم تصویر نباید بیشتر از ۵ مگابایت باشد');
            return;
        }

        setUploading(true);
        try {
            const result = await adminBlogService.uploadImage(file);
            setSettingsMap(prev => ({
                ...prev,
                'System.SiteLogo': result.imageUrl
            }));
            toast.success('لوگو با موفقیت آپلود شد');
        } catch (err) {
            console.error('Error uploading logo:', err);
            toast.error('خطا در آپلود لوگو');
        } finally {
            setUploading(false);
        }
    };

    const handleFaviconUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('لطفاً یک فایل تصویری انتخاب کنید');
            return;
        }

        if (file.size > 1 * 1024 * 1024) {
            toast.error('حجم فاویکون نباید بیشتر از ۱ مگابایت باشد');
            return;
        }

        setUploading(true);
        try {
            const result = await adminBlogService.uploadImage(file);
            setSettingsMap(prev => ({
                ...prev,
                'System.Favicon': result.imageUrl
            }));
            toast.success('فاویکون با موفقیت آپلود شد');

            // به‌روزرسانی فاویکون در صفحه
            updateFavicon(result.imageUrl);
        } catch (err) {
            console.error('Error uploading favicon:', err);
            toast.error('خطا در آپلود فاویکون');
        } finally {
            setUploading(false);
        }
    };

    const updateFavicon = (url) => {
        // حذف فاویکون‌های قبلی
        const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
        existingFavicons.forEach(link => link.remove());

        // اضافه کردن فاویکون جدید
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = url;
        document.head.appendChild(link);

        // اضافه کردن apple-touch-icon
        const appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        appleLink.href = url;
        document.head.appendChild(appleLink);
    };

    const handleRemoveLogo = () => {
        setSettingsMap(prev => {
            const next = { ...prev };
            delete next['System.SiteLogo'];
            return next;
        });
    };

    const handleRemoveFavicon = () => {
        setSettingsMap(prev => {
            const next = { ...prev };
            delete next['System.Favicon'];
            return next;
        });
    };

    const handleClearCache = async () => {
        const confirmed = window.confirm(
            '⚠️ هشدار: تمام کش‌های سایت پاک خواهد شد!\n\n' +
            'این شامل موارد زیر می‌شود:\n' +
            '• LocalStorage\n' +
            '• SessionStorage\n' +
            '• Cache API\n' +
            '• Service Worker Cache\n\n' +
            'آیا مطمئن هستید؟'
        );

        if (!confirmed) return;

        try {
            let clearedItems = [];

            // 1. پاک کردن localStorage
            const localStorageCount = localStorage.length;
            localStorage.clear();
            if (localStorageCount > 0) {
                clearedItems.push(`LocalStorage (${localStorageCount} مورد)`);
            }

            // 2. پاک کردن sessionStorage
            const sessionStorageCount = sessionStorage.length;
            sessionStorage.clear();
            if (sessionStorageCount > 0) {
                clearedItems.push(`SessionStorage (${sessionStorageCount} مورد)`);
            }

            // 3. پاک کردن Cache API
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                if (cacheNames.length > 0) {
                    clearedItems.push(`Cache API (${cacheNames.length} کش)`);
                }
            }

            // 4. Unregister Service Workers
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(
                    registrations.map(registration => registration.unregister())
                );
                if (registrations.length > 0) {
                    clearedItems.push(`Service Workers (${registrations.length} مورد)`);
                }
            }

            // 5. پاک کردن IndexedDB (اختیاری)
            if ('indexedDB' in window) {
                const databases = await indexedDB.databases?.();
                if (databases && databases.length > 0) {
                    databases.forEach(db => {
                        if (db.name) indexedDB.deleteDatabase(db.name);
                    });
                    clearedItems.push(`IndexedDB (${databases.length} دیتابیس)`);
                }
            }

            toast.success(
                `✅ کش با موفقیت پاک شد!\n\n${clearedItems.join('\n')}`,
                { duration: 5000 }
            );

            // رفرش صفحه بعد از 2 ثانیه
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            console.error('Error clearing cache:', error);
            toast.error('خطا در پاک کردن کش: ' + error.message);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const response = await apiClient.put('/admin/system/settings', {
            version,
            data: settingsMap
        });

        if (response?.success) {
            const data = response.data || {};
            setVersion(data.version || version + 1);
            setUpdatedAt(data.updatedAt || new Date().toISOString());
            setUpdatedBy(data.updatedBy || 'System');
            setInitialMap(data.data || settingsMap);
            setSettingsMap(data.data || settingsMap);
        }

        setSaving(false);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-56 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                            ))}
                        </div>
                        <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Settings size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 dark:text-white">تنظیمات سیستم</h1>
                            <p className="text-slate-500 dark:text-slate-400">مدیریت تنظیمات پیشرفته سیستم و پیکربندی</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={fetchSettings} className="!py-2.5">
                            <RefreshCw size={16} className="ml-2" />
                            بارگذاری مجدد
                        </Button>
                        <Button onClick={handleSave} disabled={!hasChanges || saving} className="!py-2.5">
                            {saving ? <RefreshCw size={16} className="ml-2 animate-spin" /> : <Save size={16} className="ml-2" />}
                            {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
                        </Button>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                        <Badge color="blue">نسخه {version}</Badge>
                        <span>آخرین بروزرسانی: {updatedAt ? formatDate(updatedAt) : 'نامشخص'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge color="emerald">بروزرسانی توسط {updatedBy || 'System'}</Badge>
                    </div>
                </div>
            </div>

            {/* بخش برندینگ (لوگو و فاویکون) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <ImageIcon size={20} className="text-purple-600" />
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">برندینگ سایت</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* لوگوی سایت */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">لوگوی سایت</h3>
                            <Badge color="slate" size="sm">System.SiteLogo</Badge>
                        </div>

                        {settingsMap['System.SiteLogo'] ? (
                            <div className="relative">
                                <img
                                    src={getImageUrl(settingsMap['System.SiteLogo'])}
                                    alt="Site Logo"
                                    className="w-full h-40 object-contain bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveLogo}
                                    className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center">
                                <Upload size={32} className="mx-auto mb-3 text-slate-400" />
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                    آپلود لوگوی سایت
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    disabled={uploading}
                                    className="hidden"
                                    id="logo-upload"
                                />
                                <label
                                    htmlFor="logo-upload"
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={uploading ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                >
                                    {uploading ? 'در حال آپلود...' : 'انتخاب تصویر'}
                                </label>
                            </div>
                        )}

                        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                            <p>• حداکثر حجم: ۵ مگابایت</p>
                            <p>• فرمت‌های مجاز: JPG, PNG, SVG, WebP</p>
                            <p>• سایز پیشنهادی: 200x200 پیکسل</p>
                        </div>
                    </div>

                    {/* فاویکون */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">فاویکون (Favicon)</h3>
                            <Badge color="slate" size="sm">System.Favicon</Badge>
                        </div>

                        {settingsMap['System.Favicon'] ? (
                            <div className="relative">
                                <div className="flex items-center justify-center h-40 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <img
                                        src={getImageUrl(settingsMap['System.Favicon'])}
                                        alt="Favicon"
                                        className="w-24 h-24 object-contain"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveFavicon}
                                    className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center">
                                <Globe size={32} className="mx-auto mb-3 text-slate-400" />
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                    آپلود فاویکون سایت
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFaviconUpload}
                                    disabled={uploading}
                                    className="hidden"
                                    id="favicon-upload"
                                />
                                <label
                                    htmlFor="favicon-upload"
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={uploading ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                >
                                    {uploading ? 'در حال آپلود...' : 'انتخاب تصویر'}
                                </label>
                            </div>
                        )}

                        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                            <p>• حداکثر حجم: ۱ مگابایت</p>
                            <p>• فرمت‌های مجاز: ICO, PNG</p>
                            <p>• سایز پیشنهادی: 32x32 یا 64x64 پیکسل</p>
                        </div>
                    </div>
                </div>

                {/* نام سایت */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings size={18} className="text-indigo-600" />
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">نام سایت</h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">نام فارسی</label>
                                <Badge color="slate" size="sm">System.SiteName</Badge>
                            </div>
                            <input
                                type="text"
                                value={settingsMap['System.SiteName'] || ''}
                                onChange={(e) => handleChange('System.SiteName', e.target.value)}
                                placeholder="آکادمی پردیس توس"
                                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">نام انگلیسی</label>
                                <Badge color="slate" size="sm">System.SiteNameEn</Badge>
                            </div>
                            <input
                                type="text"
                                value={settingsMap['System.SiteNameEn'] || ''}
                                onChange={(e) => handleChange('System.SiteNameEn', e.target.value)}
                                placeholder="Pardis Tous Academy"
                                dir="ltr"
                                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal size={18} className="text-indigo-600 dark:text-indigo-400" />
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">تنظیمات سیستم</h3>
                            </div>
                            <div className="relative w-full lg:w-80">
                                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="جستجو در تنظیمات..."
                                    className="w-full pr-10 pl-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {Object.keys(groupedSettings).length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center">
                            <p className="text-slate-500 dark:text-slate-400">تنظیمی برای نمایش یافت نشد.</p>
                        </div>
                    ) : (
                        Object.entries(groupedSettings).map(([group, items]) => (
                            <div key={group} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield size={18} className="text-emerald-500" />
                                        <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                                            {DEFAULT_GROUP_LABELS[group] || group}
                                        </h4>
                                    </div>
                                    <Badge color="slate" size="sm">{items.length} مورد</Badge>
                                </div>

                                <div className="space-y-4">
                                    {items.map(({ key, value }) => (
                                        <div key={key} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-slate-400">{key}</p>
                                                    <input
                                                        type="text"
                                                        value={value ?? ''}
                                                        onChange={(e) => handleChange(key, e.target.value)}
                                                        className="mt-2 w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="!py-2.5 !px-3 text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={() => handleRemove(key)}
                                                >
                                                    <X size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Database size={18} className="text-purple-600" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">اطلاعات سیستم</h3>
                        </div>
                        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center justify-between">
                                <span>تعداد کل تنظیمات</span>
                                <span className="font-bold text-slate-800 dark:text-white">{Object.keys(settingsMap).length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>تغییرات ذخیره نشده</span>
                                {hasChanges ? (
                                    <Badge color="amber" size="sm">در انتظار ذخیره</Badge>
                                ) : (
                                    <Badge color="emerald" size="sm">ذخیره شده</Badge>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span>API</span>
                                <span className="font-medium text-slate-800 dark:text-white">{API_URL}</span>
                            </div>
                        </div>
                    </div>

                    {/* دکمه پاک کردن کش */}
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">مدیریت کش</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            پاک کردن کامل کش‌های سایت شامل LocalStorage، SessionStorage، Cache API و Service Workers
                        </p>
                        <Button
                            variant="outline"
                            className="w-full !border-red-300 dark:!border-red-800 !text-red-600 dark:!text-red-400 hover:!bg-red-50 dark:hover:!bg-red-950/30"
                            onClick={handleClearCache}
                        >
                            <Trash2 size={16} className="ml-2" />
                            پاک کردن کامل کش
                        </Button>
                        <div className="mt-3 p-3 bg-red-100/50 dark:bg-red-950/30 rounded-lg">
                            <p className="text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                                <span>این عملیات برگشت‌پذیر نیست و صفحه به صورت خودکار رفرش خواهد شد.</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Plus size={18} className="text-indigo-600" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">افزودن تنظیم جدید</h3>
                        </div>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="System.Key"
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <input
                                type="text"
                                placeholder="مقدار"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <Button variant="outline" className="w-full" onClick={handleAdd}>
                                افزودن
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-900/10 p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={18} className="text-amber-600" />
                            <h3 className="font-bold text-amber-900 dark:text-amber-200">نکته مهم</h3>
                        </div>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            تغییر تنظیمات سیستم می‌تواند روی عملکرد برنامه تأثیرگذار باشد. لطفاً با دقت اقدام کنید.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
