import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Tag, Search } from 'lucide-react';
import { Button, Input, Badge, Card } from '../../../components/UI';
import { adminBlogService } from '../../../features/blog/services/adminBlogService';
import { blogService } from '../../../features/blog/services/blogService';
import toast from 'react-hot-toast';

const BlogTags = () => {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const loadTags = async () => {
        setLoading(true);
        try {
            const result = await blogService.getTags();
            setTags(result || []);
        } catch (err) {
            console.error('Error loading tags:', err);
            toast.error('خطا در بارگذاری تگ‌ها');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTags();
    }, []);

    const handleDelete = async (id, title) => {
        if (!confirm(`آیا از حذف تگ "${title}" اطمینان دارید؟`)) return;

        try {
            await adminBlogService.deleteTag(id);
            toast.success('تگ با موفقیت حذف شد');
            loadTags();
        } catch (err) {
            console.error('Error deleting tag:', err);
            toast.error('خطا در حذف تگ');
        }
    };

    const filteredTags = tags.filter(tag =>
        tag.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
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
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">تگ‌های وبلاگ</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {tags.length.toLocaleString('fa-IR')} تگ
                    </p>
                </div>
                <Link to="/admin/blog/tags/create">
                    <Button>
                        <Plus size={16} />
                        تگ جدید
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <Input
                    placeholder="جستجو در تگ‌ها..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search size={16} />}
                />
            </div>

            {/* Tags Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredTags.length === 0 ? (
                    <div className="col-span-full text-center p-12">
                        <Tag size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 dark:text-slate-400">تگی یافت نشد</p>
                    </div>
                ) : (
                    filteredTags.map(tag => (
                        <Card key={tag.id} className="p-4 space-y-3">
                            <div className="flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center">
                                    <Tag size={24} className="text-primary-600 dark:text-primary-400" />
                                </div>
                            </div>

                            <div className="text-center">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                                    {tag.title}
                                </h3>
                                <Badge color="slate" size="sm">
                                    {tag.slug}
                                </Badge>
                            </div>

                            <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                                <Link to={`/admin/blog/tags/edit/${tag.id}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Edit size={12} />
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(tag.id, tag.title)}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                                >
                                    <Trash2 size={12} />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default BlogTags;
