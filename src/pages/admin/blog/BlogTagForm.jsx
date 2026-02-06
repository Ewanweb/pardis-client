import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowRight } from 'lucide-react';
import { Button, Input, Card } from '../../../components/UI';
import { adminBlogService } from '../../../features/blog/services/adminBlogService';
import { blogService } from '../../../features/blog/services/blogService';
import toast from 'react-hot-toast';

const BlogTagForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEdit) {
            loadTag();
        }
    }, [id]);

    const loadTag = async () => {
        try {
            const tags = await blogService.getTags();
            const tag = tags.find(t => t.id === id);
            if (tag) {
                setFormData({
                    title: tag.title || '',
                    slug: tag.slug || ''
                });
            }
        } catch (err) {
            console.error('Error loading tag:', err);
            toast.error('خطا در بارگذاری تگ');
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
                await adminBlogService.updateTag(id, formData);
                toast.success('تگ با موفقیت به‌روزرسانی شد');
            } else {
                await adminBlogService.createTag(formData);
                toast.success('تگ با موفقیت ایجاد شد');
            }
            navigate('/admin/blog/tags');
        } catch (err) {
            console.error('Error saving tag:', err);
            toast.error(isEdit ? 'خطا در به‌روزرسانی تگ' : 'خطا در ایجاد تگ');
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
                        {isEdit ? 'ویرایش تگ' : 'تگ جدید'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {isEdit ? 'ویرایش اطلاعات تگ' : 'ایجاد یک تگ جدید برای وبلاگ'}
                    </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/admin/blog/tags')}>
                    <ArrowRight size={16} />
                    بازگشت
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                <Card className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">اطلاعات تگ</h2>

                    <Input
                        label="عنوان تگ *"
                        value={formData.title}
                        onChange={handleTitleChange}
                        error={errors.title}
                        placeholder="مثال: React"
                    />

                    <Input
                        label="اسلاگ (URL) *"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        error={errors.slug}
                        placeholder="react"
                        dir="ltr"
                    />

                    <div className="flex gap-4 pt-4">
                        <Button type="submit" disabled={saving}>
                            <Save size={16} />
                            {saving ? 'در حال ذخیره...' : isEdit ? 'به‌روزرسانی' : 'ایجاد تگ'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/admin/blog/tags')}
                        >
                            انصراف
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default BlogTagForm;
