import React, { useState, useEffect } from 'react';
import {
    Plus, Edit, Trash2, Eye, EyeOff, Save, X, Upload,
    Image as ImageIcon, Clock, Calendar, Home, Search,
    AlertCircle, CheckCircle, Loader2, ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { Button, Badge } from '../../components/UI';
import toast, { Toaster } from 'react-hot-toast';

const SlidesManagement = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('all'); // all, active, inactive

    const initialFormData = {
        title: '',
        description: '',
        imageFile: null,
        imageUrl: '',
        badge: '',
        primaryActionLabel: '',
        primaryActionLink: '',
        secondaryActionLabel: '',
        secondaryActionLink: '',
        order: 0,
        isActive: true,
        isPermanent: true,
        expiresAt: null,
        linkUrl: '',
        buttonText: '',
        stats: []
    };

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadSlides();
    }, []);

    const loadSlides = async () => {
        try {
            setLoading(true);
            const response = await api.get('/HeroSlides?adminView=true&includeInactive=true&includeExpired=true');
            const slidesData = response.data?.data || [];
            setSlides(slidesData);
        } catch (error) {
            console.error('Error loading slides:', error);
            toast.error('خطا در بارگذاری اسلایدها');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            setIsSubmitting(true);
            const formDataToSend = new FormData();

            // اضافه کردن فیلدهای اجباری
            formDataToSend.append('Title', formData.title);
            formDataToSend.append('Description', formData.description || '');
            formDataToSend.append('Badge', formData.badge || '');
            formDataToSend.append('PrimaryActionLabel', formData.primaryActionLabel || '');
            formDataToSend.append('PrimaryActionLink', formData.primaryActionLink || '');
            formDataToSend.append('SecondaryActionLabel', formData.secondaryActionLabel || '');
            formDataToSend.append('SecondaryActionLink', formData.secondaryActionLink || '');
            formDataToSend.append('Order', formData.order || 0);
            formDataToSend.append('IsPermanent', formData.isPermanent);
            formDataToSend.append('LinkUrl', formData.linkUrl || '');
            formDataToSend.append('ButtonText', formData.buttonText || '');

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
                    formDataToSend.append(`Stats[${index}].Icon`, stat.icon || '');
                    formDataToSend.append(`Stats[${index}].Value`, stat.value || '');
                    formDataToSend.append(`Stats[${index}].Label`, stat.label || '');
                });
            }

            const response = await api.post('/HeroSlides', formDataToSend);

            if (response.data.success) {
                toast.success('اسلاید با موفقیت ایجاد شد');
                await loadSlides();
                handleCloseModal();
            } else {
                throw new Error(response.data.message || 'خطا در ایجاد اسلاید');
            }
        } catch (error) {
            console.error('Error creating slide:', error);
            toast.error(error.response?.data?.message || 'خطا در ایجاد اسلاید');
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
            formDataToSend.append('Description', formData.description || '');
            formDataToSend.append('Badge', formData.badge || '');
            formDataToSend.append('PrimaryActionLabel', formData.primaryActionLabel || '');
            formDataToSend.append('PrimaryActionLink', formData.primaryActionLink || '');
            formDataToSend.append('SecondaryActionLabel', formData.secondaryActionLabel || '');
            formDataToSend.append('SecondaryActionLink', formData.secondaryActionLink || '');
            formDataToSend.append('Order', formData.order || 0);
            formDataToSend.append('IsActive', formData.isActive);
            formDataToSend.append('IsPermanent', formData.isPermanent);
            formDataToSend.append('LinkUrl', formData.linkUrl || '');
            formDataToSend.append('ButtonText', formData.buttonText || '');

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
                    formDataToSend.append(`Stats[${index}].Icon`, stat.icon || '');
                    formDataToSend.append(`Stats[${index}].Value`, stat.value || '');
                    formDataToSend.append(`Stats[${index}].Label`, stat.label || '');
                });
            }

            const response = await api.put(`/HeroSlides/${editingSlide.id}`, formDataToSend);

            if (response.data.success) {
                toast.success('اسلاید با موفقیت به‌روزرسانی شد');
                await loadSlides();
                handleCloseModal();
            } else {
                throw new Error(response.data.message || 'خطا در به‌روزرسانی اسلاید');
            }
        } catch (error) {
            console.error('Error updating slide:', error);
            toast.error(error.response?.data?.message || 'خطا در به‌روزرسانی اسلاید');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('آیا از حذف این اسلاید اطمینان دارید؟')) {
            return;
        }

        try {
            const response = await api.delete(`/HeroSlides/${id}`);

            if (response.data.success) {
                toast.success('اسلاید با موفقیت حذف شد');
                await loadSlides();
            } else {
                throw new Error(response.data.message || 'خطا در حذف اسلاید');
            }
        } catch (error) {
            console.error('Error deleting slide:', error);
            toast.error(error.response?.data?.message || 'خطا در حذف اسلاید');
        }
    };

    const handleToggleActive = async (slide) => {
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('Title', slide.title);
            formDataToSend.append('Description', slide.description || '');
            formDataToSend.append('IsActive', !slide.isActive);
            formDataToSend.append('Order', slide.order || 0);
            formDataToSend.append('IsPermanent', slide.isPermanent || true);

            if (slide.imageUrl) {
                formDataToSend.append('ImageUrl', slide.imageUrl);
            }

            const response = await api.put(`/HeroSlides/${slide.id}`, formDataToSend);

            if (response.data.success) {
                toast.success(`اسلاید ${!slide.isActive ? 'فعال' : 'غیرفعال'} شد`);
                await loadSlides();
            } else {
                throw new Error(response.data.message || 'خطا در تغییر وضعیت اسلاید');
            }
        } catch (error) {
            console.error('Error toggling slide status:', error);
            toast.error(error.response?.data?.message || 'خطا در تغییر وضعیت اسلاید');
        }
    };

    const handleEdit = (slide) => {
        setEditingSlide(slide);
        setFormData({
            title: slide.title || '',
            description: slide.description || '',
            imageFile: null,
            imageUrl: slide.imageUrl || '',
            badge: slide.badge || '',
            primaryActionLabel: slide.primaryActionLabel || '',
            primaryActionLink: slide.primaryActionLink || '',
            secondaryActionLabel: slide.secondaryActionLabel || '',
            secondaryActionLink: slide.secondaryActionLink || '',
            order: slide.order || 0,
            isActive: slide.isActive !== false,
            isPermanent: slide.isPermanent !== false,
            expiresAt: slide.expiresAt || null,
            linkUrl: slide.linkUrl || '',
            buttonText: slide.buttonText || '',
            stats: slide.stats || []
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSlide(null);
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
            stats: [...prev.stats, { icon: '', value: '', label: '' }]
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

    // فیلتر کردن اسلایدها
    const filteredSlides = slides.filter(slide => {
        const matchesSearch = slide.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            slide.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterActive === 'all' ||
            (filterActive === 'active' && slide.isActive) ||
            (filterActive === 'inactive' && !slide.isActive);

        return matchesSearch && matchesFilter;
    });

    return (
        <div>
            <Toaster position="top-center" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        مدیریت اسلایدهای اصلی
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        اسلایدهای صفحه اصلی را مدیریت کنید
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
                        اسلاید جدید
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="جستجو در اسلایدها..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterActive('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterActive === 'all'
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                    >
                        همه ({slides.length})
                    </button>
                    <button
                        onClick={() => setFilterActive('active')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterActive === 'active'
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                    >
                        فعال ({slides.filter(s => s.isActive).length})
                    </button>
                    <button
                        onClick={() => setFilterActive('inactive')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterActive === 'inactive'
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                    >
                        غیرفعال ({slides.filter(s => !s.isActive).length})
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            )}

            {/* Slides Grid */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSlides.length > 0 ? (
                        filteredSlides.map(slide => (
                            <SlideCard
                                key={slide.id}
                                slide={slide}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onToggleActive={handleToggleActive}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <ImageIcon size={48} className="mx-auto text-slate-400 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 mb-4">
                                {searchTerm || filterActive !== 'all'
                                    ? 'هیچ اسلایدی با این فیلتر یافت نشد'
                                    : 'هنوز اسلایدی اضافه نشده است'
                                }
                            </p>
                            {!searchTerm && filterActive === 'all' && (
                                <Button onClick={() => setShowModal(true)} icon={Plus}>
                                    اولین اسلاید را اضافه کنید
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <SlideModal
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={editingSlide ? handleUpdate : handleCreate}
                    isSubmitting={isSubmitting}
                    isEditing={!!editingSlide}
                    onImageChange={handleImageChange}
                    addStat={addStat}
                    removeStat={removeStat}
                    updateStat={updateStat}
                />
            )}
        </div>
    );
};

// Slide Card Component
const SlideCard = ({ slide, onEdit, onDelete, onToggleActive }) => {
    const getStatusBadge = () => {
        if (!slide.isActive) {
            return <Badge variant="secondary">غیرفعال</Badge>;
        }
        if (!slide.isPermanent && slide.expiresAt) {
            const isExpired = new Date(slide.expiresAt) < new Date();
            return isExpired ?
                <Badge variant="destructive">منقضی شده</Badge> :
                <Badge variant="warning">موقت</Badge>;
        }
        return <Badge variant="success">فعال</Badge>;
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative h-48">
                <img
                    src={slide.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                    {slide.badge && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                            {slide.badge}
                        </span>
                    )}
                    {getStatusBadge()}
                </div>
                <div className="absolute top-2 left-2">
                    <button
                        onClick={() => onToggleActive(slide)}
                        className={`p-1 rounded-full ${slide.isActive ? 'bg-green-500' : 'bg-gray-500'
                            } text-white hover:opacity-80 transition-opacity`}
                        title={slide.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                    >
                        {slide.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1">
                        {slide.title || 'بدون عنوان'}
                    </h3>
                    <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                        #{slide.order || 0}
                    </span>
                </div>

                {slide.description && (
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 line-clamp-2">
                        {slide.description}
                    </p>
                )}

                {(slide.primaryActionLabel || slide.buttonText) && (
                    <div className="mb-3">
                        <span className="text-xs text-slate-500">دکمه اصلی:</span>
                        <p className="text-sm font-medium text-blue-600">
                            {slide.primaryActionLabel || slide.buttonText}
                        </p>
                    </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(slide)}
                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            title="ویرایش"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => onDelete(slide.id)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            title="حذف"
                        >
                            <Trash2 size={16} />
                        </button>
                        {slide.linkUrl && (
                            <a
                                href={slide.linkUrl}
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
                        {slide.createdAt && new Date(slide.createdAt).toLocaleDateString('fa-IR')}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Slide Modal Component
const SlideModal = ({
    isOpen, onClose, formData, setFormData, onSubmit, isSubmitting, isEditing,
    onImageChange, addStat, removeStat, updateStat
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                            {isEditing ? 'ویرایش اسلاید' : 'ایجاد اسلاید جدید'}
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
                                    placeholder="عنوان اسلاید را وارد کنید"
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
                                    placeholder="توضیحات اسلاید را وارد کنید"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    برچسب
                                </label>
                                <input
                                    type="text"
                                    value={formData.badge}
                                    onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                    placeholder="برچسب اسلاید"
                                />
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

                    {/* دکمه‌های عمل */}
                    <div className="mt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    متن دکمه اصلی
                                </label>
                                <input
                                    type="text"
                                    value={formData.primaryActionLabel}
                                    onChange={(e) => setFormData(prev => ({ ...prev, primaryActionLabel: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                    placeholder="مثال: شروع یادگیری"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    لینک دکمه اصلی
                                </label>
                                <input
                                    type="text"
                                    value={formData.primaryActionLink}
                                    onChange={(e) => setFormData(prev => ({ ...prev, primaryActionLink: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                    placeholder="/courses یا https://example.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    متن دکمه ثانویه
                                </label>
                                <input
                                    type="text"
                                    value={formData.secondaryActionLabel}
                                    onChange={(e) => setFormData(prev => ({ ...prev, secondaryActionLabel: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                    placeholder="مثال: مشاهده نمونه"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    لینک دکمه ثانویه
                                </label>
                                <input
                                    type="text"
                                    value={formData.secondaryActionLink}
                                    onChange={(e) => setFormData(prev => ({ ...prev, secondaryActionLink: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                    placeholder="/about یا https://youtube.com/watch?v=..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* آمار */}
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                آمار اسلاید
                            </label>
                            <Button onClick={addStat} size="sm" variant="outline">
                                <Plus size={16} className="ml-1" />
                                افزودن آمار
                            </Button>
                        </div>

                        {formData.stats.map((stat, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
                                <div>
                                    <input
                                        type="text"
                                        value={stat.icon}
                                        onChange={(e) => updateStat(index, 'icon', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                        placeholder="آیکون"
                                    />
                                </div>
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

                    {/* نوع اسلاید */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            نوع اسلاید
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-center p-3 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <input
                                    type="radio"
                                    name="slideType"
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
                                    name="slideType"
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

export default SlidesManagement;