import React, { useState, useEffect } from 'react';
import {
    Plus, Edit, Trash2, Eye, EyeOff, Save, X, Upload,
    Play, Clock, Calendar, Home, Search, User, BookOpen,
    AlertCircle, CheckCircle, Loader2, ExternalLink, Award
} from 'lucide-react';
import { api } from '../../services/api';
import { Button, Badge } from '../../components/UI';
import toast, { Toaster } from 'react-hot-toast';

const StoriesManagement = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingStory, setEditingStory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('all'); // all, active, inactive
    const [filterType, setFilterType] = useState('all'); // all, success, video, testimonial

    const initialFormData = {
        title: '',
        subtitle: '',
        description: '',
        imageFile: null,
        imageUrl: '',
        badge: '',
        type: 'success',
        studentName: '',
        courseName: '',
        actionLabel: '',
        actionLink: '',
        duration: 5000,
        courseId: null,
        order: 0,
        isActive: true,
        isPermanent: true,
        expiresAt: null,
        linkUrl: '',
        stats: []
    };

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        loadStories();
        loadCourses();
    }, []);

    const loadStories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/SuccessStories?adminView=true&includeInactive=true&includeExpired=true');
            const storiesData = response.data?.data || [];
            setStories(storiesData);
        } catch (error) {
            console.error('Error loading stories:', error);
            toast.error('خطا در بارگذاری استوری‌ها');
        } finally {
            setLoading(false);
        }
    };

    const loadCourses = async () => {
        try {
            const response = await api.get('/courses');
            const coursesData = response.data?.data || [];
            setCourses(coursesData);
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    };

    const handleCreate = async () => {
        try {
            setIsSubmitting(true);
            const formDataToSend = new FormData();

            // اضافه کردن فیلدهای اجباری
            formDataToSend.append('Title', formData.title);
            formDataToSend.append('Subtitle', formData.subtitle || '');
            formDataToSend.append('Description', formData.description || '');
            formDataToSend.append('Badge', formData.badge || '');
            formDataToSend.append('Type', formData.type || 'success');
            formDataToSend.append('StudentName', formData.studentName || '');
            formDataToSend.append('CourseName', formData.courseName || '');
            formDataToSend.append('ActionLabel', formData.actionLabel || '');
            formDataToSend.append('ActionLink', formData.actionLink || '');
            formDataToSend.append('Duration', formData.duration || 5000);
            formDataToSend.append('Order', formData.order || 0);
            formDataToSend.append('IsPermanent', formData.isPermanent);
            formDataToSend.append('LinkUrl', formData.linkUrl || '');

            if (formData.courseId) {
                formDataToSend.append('CourseId', formData.courseId);
            }

            if (formData.imageFile) {
                formDataToSend.append('ImageFile', formData.imageFile);
            } else if (formData.imageUrl) {
                formDataToSend.append('ImageUrl', formData.imageUrl);
            }

            if (!formData.isPermanent && formData.expiresAt) {
                formDataToSend.append('ExpiresAt', formData.expiresAt);
            }

            // اضافه کردن آمار
            if (formData.stats && formData.stats.length > 0) {
                formData.stats.forEach((stat, index) => {
                    formDataToSend.append(`Stats[${index}].Value`, stat.value || '');
                    formDataToSend.append(`Stats[${index}].Label`, stat.label || '');
                });
            }

            const response = await api.post('/SuccessStories', formDataToSend);

            if (response.data.success) {
                toast.success('استوری با موفقیت ایجاد شد');
                await loadStories();
                handleCloseModal();
            } else {
                throw new Error(response.data.message || 'خطا در ایجاد استوری');
            }
        } catch (error) {
            console.error('Error creating story:', error);
            toast.error(error.response?.data?.message || 'خطا در ایجاد استوری');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setIsSubmitting(true);
            const formDataToSend = new FormData();

            // اضافه کردن فیلدهای اجباری
            formDataToSend.append('Title', formData.title);
            formDataToSend.append('Subtitle', formData.subtitle || '');
            formDataToSend.append('Description', formData.description || '');
            formDataToSend.append('Badge', formData.badge || '');
            formDataToSend.append('Type', formData.type || 'success');
            formDataToSend.append('StudentName', formData.studentName || '');
            formDataToSend.append('CourseName', formData.courseName || '');
            formDataToSend.append('ActionLabel', formData.actionLabel || '');
            formDataToSend.append('ActionLink', formData.actionLink || '');
            formDataToSend.append('Duration', formData.duration || 5000);
            formDataToSend.append('Order', formData.order || 0);
            formDataToSend.append('IsActive', formData.isActive);
            formDataToSend.append('IsPermanent', formData.isPermanent);
            formDataToSend.append('LinkUrl', formData.linkUrl || '');

            if (formData.courseId) {
                formDataToSend.append('CourseId', formData.courseId);
            }

            if (formData.imageFile) {
                formDataToSend.append('ImageFile', formData.imageFile);
            } else if (formData.imageUrl) {
                formDataToSend.append('ImageUrl', formData.imageUrl);
            }

            if (!formData.isPermanent && formData.expiresAt) {
                formDataToSend.append('ExpiresAt', formData.expiresAt);
            }

            // اضافه کردن آمار
            if (formData.stats && formData.stats.length > 0) {
                formData.stats.forEach((stat, index) => {
                    formDataToSend.append(`Stats[${index}].Value`, stat.value || '');
                    formDataToSend.append(`Stats[${index}].Label`, stat.label || '');
                });
            }

            const response = await api.put(`/SuccessStories/${editingStory.id}`, formDataToSend);

            if (response.data.success) {
                toast.success('استوری با موفقیت به‌روزرسانی شد');
                await loadStories();
                handleCloseModal();
            } else {
                throw new Error(response.data.message || 'خطا در به‌روزرسانی استوری');
            }
        } catch (error) {
            console.error('Error updating story:', error);
            toast.error(error.response?.data?.message || 'خطا در به‌روزرسانی استوری');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('آیا از حذف این استوری اطمینان دارید؟')) {
            return;
        }

        try {
            const response = await api.delete(`/SuccessStories/${id}`);

            if (response.data.success) {
                toast.success('استوری با موفقیت حذف شد');
                await loadStories();
            } else {
                throw new Error(response.data.message || 'خطا در حذف استوری');
            }
        } catch (error) {
            console.error('Error deleting story:', error);
            toast.error(error.response?.data?.message || 'خطا در حذف استوری');
        }
    };

    const handleToggleActive = async (story) => {
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('Title', story.title);
            formDataToSend.append('Subtitle', story.subtitle || '');
            formDataToSend.append('Description', story.description || '');
            formDataToSend.append('Type', story.type || 'success');
            formDataToSend.append('IsActive', !story.isActive);
            formDataToSend.append('Order', story.order || 0);
            formDataToSend.append('IsPermanent', story.isPermanent || true);

            if (story.imageUrl) {
                formDataToSend.append('ImageUrl', story.imageUrl);
            }

            const response = await api.put(`/SuccessStories/${story.id}`, formDataToSend);

            if (response.data.success) {
                toast.success(`استوری ${!story.isActive ? 'فعال' : 'غیرفعال'} شد`);
                await loadStories();
            } else {
                throw new Error(response.data.message || 'خطا در تغییر وضعیت استوری');
            }
        } catch (error) {
            console.error('Error toggling story status:', error);
            toast.error(error.response?.data?.message || 'خطا در تغییر وضعیت استوری');
        }
    };

    const handleEdit = (story) => {
        setEditingStory(story);
        setFormData({
            title: story.title || '',
            subtitle: story.subtitle || '',
            description: story.description || '',
            imageFile: null,
            imageUrl: story.imageUrl || '',
            badge: story.badge || '',
            type: story.type || 'success',
            studentName: story.studentName || '',
            courseName: story.courseName || '',
            actionLabel: story.actionLabel || '',
            actionLink: story.actionLink || '',
            duration: story.duration || 5000,
            courseId: story.courseId || null,
            order: story.order || 0,
            isActive: story.isActive !== false,
            isPermanent: story.isPermanent !== false,
            expiresAt: story.expiresAt || null,
            linkUrl: story.linkUrl || '',
            stats: story.stats || []
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingStory(null);
        setFormData(initialFormData);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                imageFile: file,
                imageUrl: '' // Clear URL when file is selected
            }));
        }
    };

    const addStat = () => {
        setFormData(prev => ({
            ...prev,
            stats: [...prev.stats, { value: '', label: '' }]
        }));
    };

    const removeStat = (index) => {
        setFormData(prev => ({
            ...prev,
            stats: prev.stats.filter((_, i) => i !== index)
        }));
    };

    const updateStat = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            stats: prev.stats.map((stat, i) =>
                i === index ? { ...stat, [field]: value } : stat
            )
        }));
    };

    // فیلتر کردن استوری‌ها
    const filteredStories = stories.filter(story => {
        const matchesSearch = story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            story.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            story.studentName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesActiveFilter = filterActive === 'all' ||
            (filterActive === 'active' && story.isActive) ||
            (filterActive === 'inactive' && !story.isActive);

        const matchesTypeFilter = filterType === 'all' || story.type === filterType;

        return matchesSearch && matchesActiveFilter && matchesTypeFilter;
    });

    const storyTypes = [
        { value: 'success', label: 'موفقیت', icon: Award },
        { value: 'video', label: 'ویدیو', icon: Play },
        { value: 'testimonial', label: 'نظر', icon: User }
    ];

    return (
        <div>
            <Toaster position="top-center" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        مدیریت استوری‌های موفقیت
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        استوری‌های موفقیت دانشجویان را مدیریت کنید
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => window.location.href = '/'}
                        icon={Home}
                        variant="outline"
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                        صفحه اصلی
                    </Button>
                    <Button onClick={() => setShowModal(true)} icon={Plus}>
                        استوری جدید
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="جستجو در استوری‌ها..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {/* فیلتر وضعیت */}
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                            onClick={() => setFilterActive('all')}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${filterActive === 'all'
                                ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            همه ({stories.length})
                        </button>
                        <button
                            onClick={() => setFilterActive('active')}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${filterActive === 'active'
                                ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            فعال ({stories.filter(s => s.isActive).length})
                        </button>
                        <button
                            onClick={() => setFilterActive('inactive')}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${filterActive === 'inactive'
                                ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            غیرفعال ({stories.filter(s => !s.isActive).length})
                        </button>
                    </div>

                    {/* فیلتر نوع */}
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${filterType === 'all'
                                ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            همه انواع
                        </button>
                        {storyTypes.map(type => (
                            <button
                                key={type.value}
                                onClick={() => setFilterType(type.value)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1 ${filterType === type.value
                                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <type.icon size={14} />
                                {type.label} ({stories.filter(s => s.type === type.value).length})
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            )}

            {/* Stories Grid */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStories.length > 0 ? (
                        filteredStories.map(story => (
                            <StoryCard
                                key={story.id}
                                story={story}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onToggleActive={handleToggleActive}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <Play size={48} className="mx-auto text-slate-400 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 mb-4">
                                {searchTerm || filterActive !== 'all' || filterType !== 'all'
                                    ? 'هیچ استوری‌ای با این فیلتر یافت نشد'
                                    : 'هنوز استوری‌ای اضافه نشده است'
                                }
                            </p>
                            {!searchTerm && filterActive === 'all' && filterType === 'all' && (
                                <Button onClick={() => setShowModal(true)} icon={Plus}>
                                    اولین استوری را اضافه کنید
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <StoryModal
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={editingStory ? handleUpdate : handleCreate}
                    isSubmitting={isSubmitting}
                    isEditing={!!editingStory}
                    onImageChange={handleImageChange}
                    addStat={addStat}
                    removeStat={removeStat}
                    updateStat={updateStat}
                    courses={courses}
                    storyTypes={storyTypes}
                />
            )}
        </div>
    );
};

// Story Card Component
const StoryCard = ({ story, onEdit, onDelete, onToggleActive }) => {
    const getStatusBadge = () => {
        if (!story.isActive) {
            return <Badge variant="secondary">غیرفعال</Badge>;
        }
        if (!story.isPermanent && story.expiresAt) {
            const isExpired = new Date(story.expiresAt) < new Date();
            return isExpired ?
                <Badge variant="destructive">منقضی شده</Badge> :
                <Badge variant="warning">موقت</Badge>;
        }
        return <Badge variant="success">فعال</Badge>;
    };

    const getTypeIcon = () => {
        switch (story.type) {
            case 'video':
                return <Play size={16} className="text-red-500" />;
            case 'testimonial':
                return <User size={16} className="text-blue-500" />;
            default:
                return <Award size={16} className="text-green-500" />;
        }
    };

    const getTypeLabel = () => {
        switch (story.type) {
            case 'video':
                return 'ویدیو';
            case 'testimonial':
                return 'نظر';
            default:
                return 'موفقیت';
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative h-48">
                <img
                    src={story.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'}
                    alt={story.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                    {story.badge && (
                        <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                            {story.badge}
                        </span>
                    )}
                    <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full flex items-center gap-1">
                        {getTypeIcon()}
                        {getTypeLabel()}
                    </span>
                    {getStatusBadge()}
                </div>
                <div className="absolute top-2 left-2">
                    <button
                        onClick={() => onToggleActive(story)}
                        className={`p-1 rounded-full ${story.isActive ? 'bg-green-500' : 'bg-gray-500'
                            } text-white hover:opacity-80 transition-opacity`}
                        title={story.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                    >
                        {story.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                </div>
                {story.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-3">
                            <Play size={24} className="text-white" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1">
                        {story.title || 'بدون عنوان'}
                    </h3>
                    <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                        #{story.order || 0}
                    </span>
                </div>

                {story.subtitle && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
                        {story.subtitle}
                    </p>
                )}

                {story.description && (
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 line-clamp-2">
                        {story.description}
                    </p>
                )}

                {story.studentName && (
                    <div className="mb-3 flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                            {story.studentName}
                        </span>
                        {story.courseName && (
                            <>
                                <span className="text-slate-400">•</span>
                                <span className="text-sm text-blue-600 dark:text-blue-400">
                                    {story.courseName}
                                </span>
                            </>
                        )}
                    </div>
                )}

                {story.actionLabel && (
                    <div className="mb-3">
                        <span className="text-xs text-slate-500">عمل:</span>
                        <p className="text-sm font-medium text-purple-600">
                            {story.actionLabel}
                        </p>
                    </div>
                )}

                {story.duration && story.type === 'video' && (
                    <div className="mb-3 flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                            {Math.round(story.duration / 1000)} ثانیه
                        </span>
                    </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(story)}
                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            title="ویرایش"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => onDelete(story.id)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            title="حذف"
                        >
                            <Trash2 size={16} />
                        </button>
                        {story.linkUrl && (
                            <a
                                href={story.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                title="مشاهده لینک"
                            >
                                <ExternalLink size={16} />
                            </a>
                        )}
                    </div>

                    <div className="text-xs text-slate-500">
                        {story.createdAt && new Date(story.createdAt).toLocaleDateString('fa-IR')}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Story Modal Component
const StoryModal = ({
    isOpen, onClose, formData, setFormData, onSubmit, isSubmitting, isEditing,
    onImageChange, addStat, removeStat, updateStat, courses, storyTypes
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                            {isEditing ? 'ویرایش استوری' : 'ایجاد استوری جدید'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* اطلاعات اصلی */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    عنوان *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                    placeholder="عنوان استوری را وارد کنید"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    زیرعنوان
                                </label>
                                <input
                                    type="text"
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                    placeholder="زیرعنوان استوری را وارد کنید"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    توضیحات
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                    placeholder="توضیحات استوری را وارد کنید"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    نوع استوری
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                >
                                    {storyTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        ترتیب
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                        min="0"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            فعال
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* تصویر */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    تصویر
                                </label>
                                <div className="space-y-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={onImageChange}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                    />
                                    <div className="text-center text-slate-500">یا</div>
                                    <input
                                        type="url"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value, imageFile: null }))}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                        placeholder="آدرس تصویر را وارد کنید"
                                    />
                                </div>
                                {(formData.imageUrl || formData.imageFile) && (
                                    <div className="mt-3">
                                        <img
                                            src={formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.imageUrl}
                                            alt="Preview"
                                            className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-600"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* اطلاعات دانشجو و دوره */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                نام دانشجو
                            </label>
                            <input
                                type="text"
                                value={formData.studentName}
                                onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                placeholder="نام دانشجو"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                نام دوره
                            </label>
                            <input
                                type="text"
                                value={formData.courseName}
                                onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                placeholder="نام دوره"
                            />
                        </div>
                    </div>

                    {/* دوره مرتبط */}
                    {courses.length > 0 && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                دوره مرتبط
                            </label>
                            <select
                                value={formData.courseId || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, courseId: e.target.value || null }))}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">انتخاب دوره</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* دکمه عمل */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                متن دکمه عمل
                            </label>
                            <input
                                type="text"
                                value={formData.actionLabel}
                                onChange={(e) => setFormData(prev => ({ ...prev, actionLabel: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                placeholder="مثال: مشاهده پروفایل"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                لینک دکمه عمل
                            </label>
                            <input
                                type="text"
                                value={formData.actionLink}
                                onChange={(e) => setFormData(prev => ({ ...prev, actionLink: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                placeholder="/profile/123 یا https://linkedin.com/in/..."
                            />
                        </div>
                    </div>

                    {/* تنظیمات اضافی */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                برچسب
                            </label>
                            <input
                                type="text"
                                value={formData.badge}
                                onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                placeholder="برچسب استوری"
                            />
                        </div>
                        {formData.type === 'video' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    مدت زمان نمایش (میلی‌ثانیه)
                                </label>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 5000 }))}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                    min="1000"
                                    max="30000"
                                />
                            </div>
                        )}
                    </div>

                    {/* آمار */}
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                آمار استوری
                            </label>
                            <Button onClick={addStat} size="sm" variant="outline">
                                <Plus size={16} className="ml-1" />
                                افزودن آمار
                            </Button>
                        </div>

                        {formData.stats.map((stat, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
                                <div>
                                    <input
                                        type="text"
                                        value={stat.value}
                                        onChange={(e) => updateStat(index, 'value', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                        placeholder="مقدار"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={stat.label}
                                        onChange={(e) => updateStat(index, 'label', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                        placeholder="برچسب"
                                    />
                                </div>
                                <div>
                                    <button
                                        onClick={() => removeStat(index)}
                                        className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* نوع استوری */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            نوع استوری
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-center p-3 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <input
                                    type="radio"
                                    name="storyType"
                                    value="permanent"
                                    checked={formData.isPermanent}
                                    onChange={() => setFormData(prev => ({ ...prev, isPermanent: true, expiresAt: null }))}
                                    className="mr-2"
                                />
                                <div>
                                    <div className="font-medium text-slate-800 dark:text-white">دائمی</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">بدون انقضا</div>
                                </div>
                            </label>
                            <label className="flex items-center p-3 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <input
                                    type="radio"
                                    name="storyType"
                                    value="temporary"
                                    checked={!formData.isPermanent}
                                    onChange={() => setFormData(prev => ({
                                        ...prev,
                                        isPermanent: false,
                                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
                                    }))}
                                    className="mr-2"
                                />
                                <div>
                                    <div className="font-medium text-slate-800 dark:text-white">موقت</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">با تاریخ انقضا</div>
                                </div>
                            </label>
                        </div>

                        {!formData.isPermanent && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    تاریخ انقضا
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.expiresAt ? formData.expiresAt.slice(0, 16) : ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <Button onClick={onClose} variant="outline">
                            انصراف
                        </Button>
                        <Button
                            onClick={onSubmit}
                            disabled={isSubmitting || !formData.title}
                            icon={isSubmitting ? Loader2 : Save}
                            className={isSubmitting ? 'animate-spin' : ''}
                        >
                            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoriesManagement;