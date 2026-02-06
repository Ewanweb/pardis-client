import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowRight, Upload, X, Eye, Calendar } from 'lucide-react';
import { Button, Input, Card, Badge } from '../../../components/UI';
import Editor from '../../../components/Editor';
import { adminBlogService } from '../../../features/blog/services/adminBlogService';
import { blogService } from '../../../features/blog/services/blogService';
import toast from 'react-hot-toast';

const BlogPostForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);

    const [formData, setFormData] = useState({
        blogCategoryId: '',
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        coverImageUrl: '',
        status: 'Draft',
        publishedAt: '',
        tags: [],
        seo: {
            metaTitle: '',
            metaDescription: '',
            keywords: '',
            noIndex: false,
            noFollow: false,
            ogTitle: '',
            ogDescription: '',
            ogImage: '',
            twitterTitle: '',
            twitterDescription: '',
            twitterImage: ''
        }
    });

    const [errors, setErrors] = useState({});
    const [selectedTags, setSelectedTags] = useState([]);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (isEdit && id) {
            loadPost();
        }
    }, [id, categories]);

    const loadInitialData = async () => {
        try {
            const [categoriesResult, tagsResult] = await Promise.all([
                blogService.getCategories(),
                blogService.getTags()
            ]);
            setCategories(categoriesResult || []);
            setTags(tagsResult || []);
        } catch (err) {
            console.error('Error loading initial data:', err);
            toast.error('خطا در بارگذاری اطلاعات');
        }
    };

    const loadPost = async () => {
        try {
            const posts = await adminBlogService.getPosts({ pageSize: 1000 });
            const post = posts.items.find(p => p.id === id);

            if (post) {
                // Get full post details
                const response = await fetch(`/api/blog/${post.slug}`);
                const result = await response.json();
                const fullPost = result.data;

                setFormData({
                    blogCategoryId: fullPost.category?.id || '',
                    title: fullPost.title || '',
                    slug: fullPost.slug || '',
                    content: fullPost.content || '',
                    excerpt: fullPost.excerpt || '',
                    coverImageUrl: fullPost.coverImageUrl || '',
                    status: fullPost.status || 'Draft',
                    publishedAt: fullPost.publishedAt ? new Date(fullPost.publishedAt).toISOString().slice(0, 16) : '',
                    tags: fullPost.tags?.map(t => t.title) || [],
                    seo: fullPost.seo || {
                        metaTitle: '',
                        metaDescription: '',
                        keywords: '',
                        noIndex: false,
                        noFollow: false,
                        ogTitle: '',
                        ogDescription: '',
                        ogImage: '',
                        twitterTitle: '',
                        twitterDescription: '',
                        twitterImage: ''
                    }
                });
                setSelectedTags(fullPost.tags?.map(t => t.title) || []);
            }
        } catch (err) {
            console.error('Error loading post:', err);
            toast.error('خطا در بارگذاری مطلب');
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
            slug: generateSlug(title),
            seo: {
                ...prev.seo,
                metaTitle: title,
                ogTitle: title,
                twitterTitle: title
            }
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
            setFormData(prev => ({
                ...prev,
                coverImageUrl: result.imageUrl,
                seo: {
                    ...prev.seo,
                    ogImage: result.imageUrl,
                    twitterImage: result.imageUrl
                }
            }));
            toast.success('تصویر با موفقیت آپلود شد');
        } catch (err) {
            console.error('Error uploading image:', err);
            toast.error('خطا در آپلود تصویر');
        } finally {
            setUploading(false);
        }
    };

    const handleTagToggle = (tagTitle) => {
        setSelectedTags(prev => {
            if (prev.includes(tagTitle)) {
                return prev.filter(t => t !== tagTitle);
            } else {
                return [...prev, tagTitle];
            }
        });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'عنوان الزامی است';
        }

        if (!formData.slug.trim()) {
            newErrors.slug = 'اسلاگ الزامی است';
        }

        if (!formData.blogCategoryId) {
            newErrors.blogCategoryId = 'دسته‌بندی الزامی است';
        }

        if (!formData.content.trim()) {
            newErrors.content = 'محتوا الزامی است';
        }

        if (!formData.excerpt.trim()) {
            newErrors.excerpt = 'خلاصه الزامی است';
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
            const submitData = {
                ...formData,
                tags: selectedTags,
                publishedAt: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : null
            };

            if (isEdit) {
                await adminBlogService.updatePost(id, submitData);
                toast.success('مطلب با موفقیت به‌روزرسانی شد');
            } else {
                await adminBlogService.createPost(submitData);
                toast.success('مطلب با موفقیت ایجاد شد');
            }
            navigate('/admin/blog');
        } catch (err) {
            console.error('Error saving post:', err);
            toast.error(isEdit ? 'خطا در به‌روزرسانی مطلب' : 'خطا در ایجاد مطلب');
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!validate()) {
            toast.error('لطفاً فیلدهای الزامی را پر کنید');
            return;
        }

        setSaving(true);
        try {
            const submitData = {
                ...formData,
                status: 'Published',
                tags: selectedTags,
                publishedAt: new Date().toISOString()
            };

            if (isEdit) {
                await adminBlogService.updatePost(id, submitData);
                toast.success('مطلب با موفقیت منتشر شد');
            } else {
                const created = await adminBlogService.createPost(submitData);
                await adminBlogService.publishPost(created.id);
                toast.success('مطلب با موفقیت منتشر شد');
            }
            navigate('/admin/blog');
        } catch (err) {
            console.error('Error publishing post:', err);
            toast.error('خطا در انتشار مطلب');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                    <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
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
                        {isEdit ? 'ویرایش مطلب' : 'مطلب جدید'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {isEdit ? 'ویرایش اطلاعات مطلب' : 'ایجاد یک مطلب جدید برای وبلاگ'}
                    </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/admin/blog')}>
                    <ArrowRight size={16} />
                    بازگشت
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <Card className="p-6 space-y-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">اطلاعات پایه</h2>

                            <Input
                                label="عنوان مطلب *"
                                value={formData.title}
                                onChange={handleTitleChange}
                                error={errors.title}
                                placeholder="عنوان جذاب برای مطلب..."
                            />

                            <Input
                                label="اسلاگ (URL) *"
                                value={formData.slug}
                                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                error={errors.slug}
                                placeholder="url-friendly-slug"
                                dir="ltr"
                            />

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                    خلاصه مطلب *
                                </label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 dark:focus:border-indigo-500 transition-all duration-300"
                                    placeholder="خلاصه‌ای کوتاه از مطلب..."
                                />
                                {errors.excerpt && (
                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.excerpt}</p>
                                )}
                            </div>
                        </Card>

                        {/* Content */}
                        <Card className="p-6 space-y-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">محتوای مطلب *</h2>
                            <Editor
                                value={formData.content}
                                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                            />
                            {errors.content && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.content}</p>
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
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Publish */}
                        <Card className="p-6 space-y-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">انتشار</h2>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                    وضعیت
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 dark:focus:border-indigo-500 transition-all duration-300"
                                >
                                    <option value="Draft">پیش‌نویس</option>
                                    <option value="Published">منتشر شده</option>
                                    <option value="Archived">آرشیو</option>
                                </select>
                            </div>

                            <Input
                                label="تاریخ انتشار"
                                type="datetime-local"
                                value={formData.publishedAt}
                                onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                            />

                            <div className="flex flex-col gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <Button type="submit" disabled={saving} className="w-full">
                                    <Save size={16} />
                                    {saving ? 'در حال ذخیره...' : 'ذخیره'}
                                </Button>
                                {formData.status !== 'Published' && (
                                    <Button
                                        type="button"
                                        variant="success"
                                        disabled={saving}
                                        onClick={handlePublish}
                                        className="w-full"
                                    >
                                        <Eye size={16} />
                                        انتشار
                                    </Button>
                                )}
                            </div>
                        </Card>

                        {/* Category */}
                        <Card className="p-6 space-y-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">دسته‌بندی *</h2>
                            <select
                                value={formData.blogCategoryId}
                                onChange={(e) => setFormData(prev => ({ ...prev, blogCategoryId: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 dark:focus:border-indigo-500 transition-all duration-300"
                            >
                                <option value="">انتخاب دسته‌بندی</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.title}
                                    </option>
                                ))}
                            </select>
                            {errors.blogCategoryId && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.blogCategoryId}</p>
                            )}
                        </Card>

                        {/* Tags */}
                        <Card className="p-6 space-y-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">تگ‌ها</h2>
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => handleTagToggle(tag.title)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedTags.includes(tag.title)
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {tag.title}
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Cover Image */}
                        <Card className="p-6 space-y-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">تصویر کاور</h2>

                            {formData.coverImageUrl ? (
                                <div className="relative">
                                    <img
                                        src={formData.coverImageUrl}
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
                                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                                    <Upload size={32} className="mx-auto mb-2 text-slate-400" />
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                        تصویر کاور
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        className="hidden"
                                        id="cover-upload"
                                    />
                                    <label htmlFor="cover-upload">
                                        <Button type="button" variant="outline" size="sm" disabled={uploading} as="span">
                                            {uploading ? 'در حال آپلود...' : 'انتخاب تصویر'}
                                        </Button>
                                    </label>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BlogPostForm;
