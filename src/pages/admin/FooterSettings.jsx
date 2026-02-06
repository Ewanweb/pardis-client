import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const FooterSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({});
    const [formData, setFormData] = useState({
        // Brand
        'Footer.BrandName': '',
        'Footer.BrandDescription': '',
        // Contact
        'Footer.Address': '',
        'Footer.Phone': '',
        'Footer.Email': '',
        // Social Media
        'Footer.InstagramUrl': '',
        'Footer.TwitterUrl': '',
        'Footer.LinkedinUrl': '',
        'Footer.YoutubeUrl': '',
        // Stats
        'Footer.Stats.CoursesCount': '',
        'Footer.Stats.StudentsCount': '',
        'Footer.Stats.InstructorsCount': '',
        // Newsletter
        'Footer.NewsletterEnabled': 'true',
        'Footer.NewsletterTitle': '',
        'Footer.NewsletterDescription': '',
        // Copyright
        'Footer.CopyrightText': '',
        // Enamad
        'Footer.EnamadUrl': '',
        'Footer.EnamadCode': ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/system/settings');
            const settingsData = response.data?.data || response.data;

            setSettings(settingsData);

            // پر کردن فرم با مقادیر موجود
            const newFormData = { ...formData };
            Object.keys(newFormData).forEach(key => {
                if (settingsData[key]) {
                    newFormData[key] = settingsData[key];
                }
            });
            setFormData(newFormData);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('خطا در دریافت تنظیمات');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // ساخت آبجکت تنظیمات برای ارسال
            const settingsToSave = {};
            Object.keys(formData).forEach(key => {
                if (formData[key] !== '') {
                    settingsToSave[key] = formData[key];
                }
            });

            await api.put('/admin/system/settings', settingsToSave);

            toast.success('تنظیمات با موفقیت ذخیره شد');
            fetchSettings(); // بارگذاری مجدد تنظیمات
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('خطا در ذخیره تنظیمات');
        } finally {
            setSaving(false);
        }
    };

    const handlePreview = () => {
        window.open('/', '_blank');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">تنظیمات فوتر</h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">مدیریت اطلاعات نمایش داده شده در فوتر سایت</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handlePreview}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                            >
                                <Eye size={18} />
                                پیش‌نمایش
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin" />
                                        در حال ذخیره...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        ذخیره تغییرات
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Brand Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">اطلاعات برند</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                نام برند
                            </label>
                            <input
                                type="text"
                                value={formData['Footer.BrandName']}
                                onChange={(e) => handleChange('Footer.BrandName', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                placeholder="پردیس توس"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                توضیحات برند
                            </label>
                            <textarea
                                value={formData['Footer.BrandDescription']}
                                onChange={(e) => handleChange('Footer.BrandDescription', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                placeholder="بهترین پلتفرم آموزش آنلاین ایران"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">اطلاعات تماس</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                آدرس
                            </label>
                            <input
                                type="text"
                                value={formData['Footer.Address']}
                                onChange={(e) => handleChange('Footer.Address', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                placeholder="تهران، خیابان ولیعصر، پلاک ۱۲۳"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    شماره تلفن
                                </label>
                                <input
                                    type="text"
                                    value={formData['Footer.Phone']}
                                    onChange={(e) => handleChange('Footer.Phone', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                    placeholder="021-1234-5678"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    ایمیل
                                </label>
                                <input
                                    type="email"
                                    value={formData['Footer.Email']}
                                    onChange={(e) => handleChange('Footer.Email', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                    placeholder="info@pardistous.ir"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Media Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">شبکه‌های اجتماعی</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                اینستاگرام
                            </label>
                            <input
                                type="url"
                                value={formData['Footer.InstagramUrl']}
                                onChange={(e) => handleChange('Footer.InstagramUrl', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                placeholder="https://instagram.com/..."
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                توییتر
                            </label>
                            <input
                                type="url"
                                value={formData['Footer.TwitterUrl']}
                                onChange={(e) => handleChange('Footer.TwitterUrl', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                placeholder="https://twitter.com/..."
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                لینکدین
                            </label>
                            <input
                                type="url"
                                value={formData['Footer.LinkedinUrl']}
                                onChange={(e) => handleChange('Footer.LinkedinUrl', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                placeholder="https://linkedin.com/..."
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                یوتیوب
                            </label>
                            <input
                                type="url"
                                value={formData['Footer.YoutubeUrl']}
                                onChange={(e) => handleChange('Footer.YoutubeUrl', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                placeholder="https://youtube.com/..."
                                dir="ltr"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">آمار سایت</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                تعداد دوره‌ها
                            </label>
                            <input
                                type="text"
                                value={formData['Footer.Stats.CoursesCount']}
                                onChange={(e) => handleChange('Footer.Stats.CoursesCount', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                placeholder="۱۰۰۰+"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                تعداد دانشجویان
                            </label>
                            <input
                                type="text"
                                value={formData['Footer.Stats.StudentsCount']}
                                onChange={(e) => handleChange('Footer.Stats.StudentsCount', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                placeholder="۵۰۰۰+"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                تعداد مدرسین
                            </label>
                            <input
                                type="text"
                                value={formData['Footer.Stats.InstructorsCount']}
                                onChange={(e) => handleChange('Footer.Stats.InstructorsCount', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                placeholder="۱۰۰+"
                            />
                        </div>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">تنظیمات خبرنامه</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="newsletter-enabled"
                                checked={formData['Footer.NewsletterEnabled'] === 'true'}
                                onChange={(e) => handleChange('Footer.NewsletterEnabled', e.target.checked ? 'true' : 'false')}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="newsletter-enabled" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                نمایش بخش خبرنامه
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                عنوان
                            </label>
                            <input
                                type="text"
                                value={formData['Footer.NewsletterTitle']}
                                onChange={(e) => handleChange('Footer.NewsletterTitle', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                placeholder="عضویت در خبرنامه"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                توضیحات
                            </label>
                            <input
                                type="text"
                                value={formData['Footer.NewsletterDescription']}
                                onChange={(e) => handleChange('Footer.NewsletterDescription', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                placeholder="از آخرین دوره‌ها و تخفیف‌های ویژه باخبر شوید"
                            />
                        </div>
                    </div>
                </div>

                {/* Copyright & Enamad Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">کپی‌رایت و نماد اعتماد</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                متن کپی‌رایت
                            </label>
                            <input
                                type="text"
                                value={formData['Footer.CopyrightText']}
                                onChange={(e) => handleChange('Footer.CopyrightText', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                placeholder="آکادمی پردیس توس - تمامی حقوق محفوظ است"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                لینک نماد اعتماد
                            </label>
                            <input
                                type="url"
                                value={formData['Footer.EnamadUrl']}
                                onChange={(e) => handleChange('Footer.EnamadUrl', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                placeholder="https://trustseal.enamad.ir/..."
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                کد نماد اعتماد
                            </label>
                            <input
                                type="text"
                                value={formData['Footer.EnamadCode']}
                                onChange={(e) => handleChange('Footer.EnamadCode', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                placeholder="fDfKAiPgvcH664AEtkOpBLvv4wGKnNO9"
                                dir="ltr"
                            />
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                    <div className="flex gap-3">
                        <AlertCircle className="text-blue-600 dark:text-blue-400 shrink-0" size={20} />
                        <div>
                            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">نکات مهم</h3>
                            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                <li>• تغییرات بعد از ذخیره، بلافاصله در فوتر سایت اعمال می‌شود</li>
                                <li>• برای نمایش آیکون شبکه‌های اجتماعی، لینک آن را وارد کنید</li>
                                <li>• آمار سایت می‌تواند شامل اعداد فارسی یا علامت + باشد</li>
                                <li>• برای غیرفعال کردن خبرنامه، تیک "نمایش بخش خبرنامه" را بردارید</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FooterSettings;
