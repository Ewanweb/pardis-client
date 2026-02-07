import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    Calendar,
    Tag,
    Folder,
    FileText,
    MoreVertical,
    CheckCircle,
    Clock,
    Archive
} from 'lucide-react';
import { Button, Input, Badge } from '../../components/UI';
import { formatDate } from '../../services/Libs';
import { adminBlogService } from '../../features/blog/services/adminBlogService';
import { blogService } from '../../features/blog/services/blogService';

const AdminBlog = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [publishing, setPublishing] = useState(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState(''); // برای input field
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);
    const [isSearching, setIsSearching] = useState(false); // نشانگر جستجو

    // Debounce timer
    const searchTimeoutRef = useRef(null);

    // Pagination
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const statusOptions = [
        { value: '', label: 'همه وضعیت‌ها' },
        { value: 'Draft', label: 'پیش‌نویس' },
        { value: 'Published', label: 'منتشر شده' },
        { value: 'Archived', label: 'آرشیو شده' }
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Published':
                return <Badge color="emerald" size="sm"><CheckCircle size={12} /> منتشر شده</Badge>;
            case 'Draft':
                return <Badge color="amber" size="sm"><Clock size={12} /> پیش‌نویس</Badge>;
            case 'Archived':
                return <Badge color="secondary" size="sm"><Archive size={12} /> آرشیو</Badge>;
            default:
                return <Badge color="slate" size="sm">{status}</Badge>;
        }
    };

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [postsResult, categoriesResult, tagsResult] = await Promise.all([
                adminBlogService.getPosts({
                    page: currentPage,
                    pageSize,
                    q: searchQuery || undefined,
                    category: selectedCategory || undefined,
                    status: selectedStatus || undefined
                }),
                blogService.getCategories(),
                blogService.getTags()
            ]);

            setPosts(postsResult.items || []);
            setTotalPages(postsResult.totalPages);
            setTotalCount(postsResult.totalCount);
            setCategories(categoriesResult || []);
            setTags(tagsResult || []);
        } catch (err) {
            console.error('Error loading blog data:', err);
            setError('خطا در بارگذاری اطلاعات');
        } finally {
            setLoading(false);
        }
    };

    // Debounced search effect
    useEffect(() => {
        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Show searching indicator
        if (searchInput !== searchQuery) {
            setIsSearching(true);
        }

        // Set new timeout for search
        searchTimeoutRef.current = setTimeout(() => {
            setSearchQuery(searchInput);
            setCurrentPage(1); // Reset to first page on new search
            setIsSearching(false);
        }, 500); // 500ms debounce

        // Cleanup
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchInput]);

    useEffect(() => {
        loadData();
    }, [currentPage, searchQuery, selectedCategory, selectedStatus]);

    const handleSearchInputChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Trigger immediate search on form submit
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        setSearchQuery(searchInput);
        setCurrentPage(1);
        setIsSearching(false);
    };

    const handleDelete = async (postId) => {
        if (!confirm('آیا از حذف این مطلب اطمینان دارید؟')) return;

        try {
            await adminBlogService.deletePost(postId);
            loadData(); // Reload data
        } catch (err) {
            console.error('Error deleting post:', err);
            alert('خطا در حذف مطلب');
        }
    };

    const handlePublish = async (postId) => {
        try {
            await adminBlogService.publishPost(postId);
            loadData(); // Reload data
        } catch (err) {
            console.error('Error publishing post:', err);
            alert('خطا در انتشار مطلب');
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-12 bg-slate-200 rounded"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-slate-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                    <Button className="mt-2" onClick={loadData}>تلاش دوباره</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">مدیریت وبلاگ</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {totalCount.toLocaleString('fa-IR')} مطلب
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to="/admin/blog/categories">
                        <Button variant="outline">
                            <Folder size={16} />
                            دسته‌بندی‌ها
                        </Button>
                    </Link>
                    <Link to="/admin/blog/tags">
                        <Button variant="outline">
                            <Tag size={16} />
                            تگ‌ها
                        </Button>
                    </Link>
                    <Link to="/admin/blog/create">
                        <Button>
                            <Plus size={16} />
                            مطلب جدید
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <Input
                            placeholder="جستجو در عنوان و محتوا..."
                            value={searchInput}
                            onChange={handleSearchInputChange}
                            icon={<Search size={16} />}
                        />
                        {isSearching && (
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
                            </div>
                        )}
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                        <option value="">همه دسته‌بندی‌ها</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.slug}>
                                {category.title}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {(searchInput || selectedCategory || selectedStatus) && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSearchInput('');
                                setSearchQuery('');
                                setSelectedCategory('');
                                setSelectedStatus('');
                                setCurrentPage(1);
                            }}
                        >
                            پاک کردن فیلترها
                        </Button>
                    )}
                </form>
            </div>

            {/* Posts Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th className="text-right p-4 font-semibold text-slate-900 dark:text-white">عنوان</th>
                                <th className="text-right p-4 font-semibold text-slate-900 dark:text-white">دسته‌بندی</th>
                                <th className="text-right p-4 font-semibold text-slate-900 dark:text-white">وضعیت</th>
                                <th className="text-right p-4 font-semibold text-slate-900 dark:text-white">نویسنده</th>
                                <th className="text-right p-4 font-semibold text-slate-900 dark:text-white">تاریخ</th>
                                <th className="text-right p-4 font-semibold text-slate-900 dark:text-white">بازدید</th>
                                <th className="text-center p-4 font-semibold text-slate-900 dark:text-white">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center p-8 text-slate-500 dark:text-slate-400">
                                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                                        مطلبی یافت نشد
                                    </td>
                                </tr>
                            ) : (
                                posts.map(post => (
                                    <tr key={post.id} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="p-4">
                                            <div>
                                                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                                                    {post.title}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                                                    {post.excerpt}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge color="secondary" size="sm">
                                                {post.categoryTitle}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(post.status)}
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300">
                                            {post.author}
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300">
                                            <div className="flex items-center gap-1 text-sm">
                                                <Calendar size={14} />
                                                {formatDate(post.publishedAt || post.createdAt)}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300">
                                            <div className="flex items-center gap-1 text-sm">
                                                <Eye size={14} />
                                                {post.viewCount?.toLocaleString('fa-IR') || '۰'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link to={`/blog/${post.slug}`} target="_blank">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye size={14} />
                                                    </Button>
                                                </Link>
                                                <Link to={`/admin/blog/edit/${post.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit size={14} />
                                                    </Button>
                                                </Link>
                                                {post.status === 'Draft' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handlePublish(post.id)}
                                                    >
                                                        <CheckCircle size={14} />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(post.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            >
                                قبلی
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            >
                                بعدی
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBlog;