import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Folder, Search, Image } from 'lucide-react';
import { Button, Input, Badge, Card } from '../../../components/UI';
import { formatDate } from '../../../services/Libs';
import { adminBlogService } from '../../../features/blog/services/adminBlogService';
import { blogService } from '../../../features/blog/services/blogService';
import toast from 'react-hot-toast';

const BlogCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const loadCategories = async () => {
        setLoading(true);
        try {
            const result = await blogService.getCategories();
            setCategories(result || []);
        } catch (err) {
            console.error('Error loading categories:', err);
            toast.error('خطا در بارگذاری دسته‌بندی‌ها');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleDelete = async (id, title) => {
        if (!confirm(`آیا از حذف دسته‌بندی "${title}" اطمینان دارید؟`)) return;

        try {
            await adminBlogService.deleteCategory(id);
            toast.success('دسته‌بندی با موفقیت حذف شد');
            loadCategories();
        } catch (err) {
            console.error('Error deleting category:', err);
            toast.error('خطا در حذف دسته‌بندی');
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">دسته‌بندی‌های وبلاگ</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {categories.length.toLocaleString('fa-IR')} دسته‌بندی
                    </p>
                </div>
                <Link to="/admin/blog/categories/create">
                    <Button>
                        <Plus size={16} />
                        دسته‌بندی جدید
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <Input
                    placeholder="جستجو در دسته‌بندی‌ها..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search size={16} />}
                />
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.length === 0 ? (
                    <div className="col-span-full text-center p-12">
                        <Folder size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 dark:text-slate-400">دسته‌بندی یافت نشد</p>
                    </div>
                ) : (
                    filteredCategories.map(category => (
                        <Card key={category.id} className="p-6 space-y-4">
                            {/* Category Image */}
                            {category.coverImageUrl ? (
                                <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    <img
                                        src={category.coverImageUrl}
                                        alt={category.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video rounded-lg bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 flex items-center justify-center">
                                    <Folder size={48} className="text-primary-300 dark:text-primary-700" />
                                </div>
                            )}

                            {/* Category Info */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    {category.title}
                                </h3>
                                {category.description && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                        {category.description}
                                    </p>
                                )}
                                <div className="mt-3 flex items-center gap-2">
                                    <Badge color="slate" size="sm">
                                        {category.slug}
                                    </Badge>
                                    <Badge color="primary" size="sm">
                                        اولویت: {category.priority?.toLocaleString('fa-IR') || '۰'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <Link to={`/admin/blog/categories/edit/${category.id}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Edit size={14} />
                                        ویرایش
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(category.id, category.title)}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default BlogCategories;
