import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowRight, Upload, X } from 'lucide-react';
import { Button, Input, Card } from '../../../components/UI';
import { adminBlogService } from '../../../features/blog/services/adminBlogService';
import { blogService } from '../../../features/blog/services/blogService';
import { getImageUrl } from '../../../../src/services/Libs';
import toast from 'react-hot-toast';

const BlogCategoryForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        priority: 0,
        coverImageUrl: '',
        seo: {
            metaTitle: '',
            metaDescription: '',
            keywords: '',
            noIndex: false,
            noFollow: false
        }
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEdit) {
            loadCategory();
        }
    }, [id]);

    const loadCategory = async () => {
        try {
            const categories = await blogService.getCategories();
            const category = categories.find(c => c.id === id);
            if (category) {
                setFormData({
                    title: category.title || '',
                    slug: category.slug || '',
                    description: category.description || '',
                    priority: category.priority || 0,
                    coverImageUrl: category.coverImageUrl || '',
                    seo: category.seo || {
                        metaTitle: '',
                        metaDescription: '',
                        keywords: '',
                        noIndex: false,
                        noFollow: false
                    }
                });
            }
        } catch (err) {
            console.error('Error loading category:', err);
            toast.error('خطا در بارگذاری دسته‌بندی');
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[\s_]+/g, '-')
            .replace(/[^\u0600-\u06FFa-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: generateSlug(title)
        }));
    };

    const handleImageUpload = async (e) => {
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
            setFormData(prev => ({ ...prev, coverImageUrl: result.imageUrl }));
            toast.success('تصویر با موفقیت آپلود شد');
        } catch (err) {
            console.error('Error uploading image:', err);
            toast.error('خطا در آپلود تصویر');
        } finally {
            setUploading(false);
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'عنوان الزامی است';
        }

        if (!formData.slug.trim()) {
            newErrors.slug = 'اسلاگ الزامی است';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('لطفاً فیلدهای الزامی را پر کنید');
            return;
        }

        setSaving(true);
        try {
            if (isEdit) {
                await adminBlogService.updateCategory(id, formData);
                toast.success('دسته‌بندی با موفقیت به‌روزرسانی شد');
            } else {
                await adminBlogService.createCategory(formData);
                toast.success('دسته‌بندی با موفقیت ایجاد شد');
            }
            navigate('/admin/blog/categories');
        } catch (err) {
            console.error('Error saving category:', err);
            toast.error(isEdit ? 'خطا در به‌روزرسانی دسته‌بندی' : 'خطا در ایجاد دسته‌بندی');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                    <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {isEdit ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {isEdit ? 'ویرایش اطلاعات دسته‌بندی' : 'ایجاد یک دسته‌بندی جدید برای وبلاگ'}
                    </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/admin/blog/categories')}>
                    <ArrowRight size={16} />
                    بازگشت
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">اطلاعات پایه</h2>

                    <Input
                        label="عنوان دسته‌بندی *"
                        value={formData.title}
                        onChange={handleTitleChange}
                        error={errors.title}
                        placeholder="مثال: برنامه‌نویسی"
                    />

                    <Input
                        label="اسلاگ (URL) *"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        error={errors.slug}
                        placeholder="programming"
                        dir="ltr"
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                            توضیحات
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 dark:focus:border-indigo-500 transition-all duration-300"
                            placeholder="توضیحات کوتاه درباره این دسته‌بندی..."
                        />
                    </div>

                    <Input
                        label="اولویت"
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                    />
                </Card>

                {/* Cover Image */}
                <Card className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">تصویر کاور</h2>

                    {formData.coverImageUrl ? (
                        <div className="relative">
                            <img
                                src={getImageUrl(formData.coverImageUrl)}
                                alt="Cover"
                                className="w-full h-48 object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, coverImageUrl: '' }))}
                                className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                            <Upload size={48} className="mx-auto mb-4 text-slate-400" />
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                تصویر کاور را آپلود کنید
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                                className="hidden"
                                id="cover-upload"
                            />
                            <label
                                htmlFor="cover-upload"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold rounded-xl border-2 border-primary-200 dark:border-primary-400/30 text-primary-600 dark:text-primary-400 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 dark:hover:from-primary-900/20 dark:hover:to-secondary-900/20 hover:border-primary-300 dark:hover:border-primary-300 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                style={{ pointerEvents: uploading ? 'none' : 'auto', opacity: uploading ? 0.7 : 1 }}
                            >
                                {uploading ? 'در حال آپلود...' : 'انتخاب تصویر'}
                            </label>
                        </div>
                    )}
                </Card>

                {/* SEO */}
                <Card className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">تنظیمات سئو</h2>

                    <Input
                        label="عنوان متا"
                        value={formData.seo.metaTitle}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            seo: { ...prev.seo, metaTitle: e.target.value }
                        }))}
                        placeholder="عنوان برای موتورهای جستجو"
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                            توضیحات متا
                        </label>
                        <textarea
                            value={formData.seo.metaDescription}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                seo: { ...prev.seo, metaDescription: e.target.value }
                            }))}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 dark:focus:border-indigo-500 transition-all duration-300"
                            placeholder="توضیحات برای موتورهای جستجو"
                        />
                    </div>

                    <Input
                        label="کلمات کلیدی"
                        value={formData.seo.keywords}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            seo: { ...prev.seo, keywords: e.target.value }
                        }))}
                        placeholder="کلمات کلیدی با کاما جدا شوند"
                    />

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.seo.noIndex}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    seo: { ...prev.seo, noIndex: e.target.checked }
                                }))}
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">NoIndex</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.seo.noFollow}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    seo: { ...prev.seo, noFollow: e.target.checked }
                                }))}
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">NoFollow</span>
                        </label>
                    </div>
                </Card>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button type="submit" disabled={saving}>
                        <Save size={16} />
                        {saving ? 'در حال ذخیره...' : isEdit ? 'به‌روزرسانی' : 'ایجاد دسته‌بندی'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/admin/blog/categories')}
                    >
                        انصراف
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default BlogCategoryForm;
