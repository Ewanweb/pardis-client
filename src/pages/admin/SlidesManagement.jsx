import { useState, useEffect } from 'react';
import {
    Plus, Edit, Trash2, Eye, EyeOff, Save, X,
    Image as ImageIcon, Search,
    Loader2, ExternalLink, Home
} from 'lucide-react';
import { api } from '../../services/api';
import { Button, Badge } from '../../components/UI';
import toast, { Toaster } from 'react-hot-toast';
import { getSliderImageUrl } from '../../services/Libs';

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
        order: 0,
        actionLabel: '',
        actionLink: ''
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
        // Validation
        if (!formData.title || formData.title.trim() === '') {
            toast.error('عنوان اسلاید الزامی است');
            return;
        }

        try {
            setIsSubmitting(true);
            const formDataToSend = new FormData();

            // اضافه کردن فیلدهای اجباری
            formDataToSend.append('Title', formData.title.trim());
            formDataToSend.append('Description', formData.description || '');
            formDataToSend.append('ActionLabel', formData.actionLabel || '');
            formDataToSend.append('ActionLink', formData.actionLink || '');
            formDataToSend.append('Order', formData.order || 0);

            if (formData.imageFile) {
                formDataToSend.append('ImageFile', formData.imageFile);
            }

            // Debug: نمایش تمام فیلدهای FormData
            console.log('=== FormData Contents ===');
            for (let [key, value] of formDataToSend.entries()) {
                console.log(`${key}:`, value);
            }
            console.log('=== End FormData ===');

            const response = await api.post('/HeroSlides', formDataToSend, {
                headers: {
                    'Content-Type': undefined // اجازه به browser برای تنظیم خودکار
                }
            });

            if (response.data.success) {
                toast.success('اسلاید با موفقیت ایجاد شد');
                await loadSlides();
                handleCloseModal();
            } else {
                throw new Error(response.data.message || 'خطا در ایجاد اسلاید');
            }
        } catch (error) {
            console.error('Error creating slide:', error);

            // نمایش خطاهای validation از backend
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                Object.keys(errors).forEach(field => {
                    errors[field].forEach(message => {
                        toast.error(`${field}: ${message}`);
                    });
                });
            } else {
                toast.error(error.response?.data?.message || 'خطا در ایجاد اسلاید');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        // Validation
        if (!formData.title || formData.title.trim() === '') {
            toast.error('عنوان اسلاید الزامی است');
            return;
        }

        try {
            setIsSubmitting(true);
            const formDataToSend = new FormData();

            // اضافه کردن فیلدهای اجباری
            formDataToSend.append('Title', formData.title.trim());
            formDataToSend.append('Description', formData.description || '');
            formDataToSend.append('ActionLabel', formData.actionLabel || '');
            formDataToSend.append('ActionLink', formData.actionLink || '');
            formDataToSend.append('Order', formData.order || 0);
            formDataToSend.append('IsActive', formData.isActive);

            if (formData.imageFile) {
                formDataToSend.append('ImageFile', formData.imageFile);
            }

            // Debug: نمایش تمام فیلدهای FormData
            console.log('=== UPDATE FormData Contents ===');
            for (let [key, value] of formDataToSend.entries()) {
                console.log(`${key}:`, value);
            }
            console.log('=== End UPDATE FormData ===');

            const response = await api.put(`/HeroSlides/${editingSlide.id}`, formDataToSend, {
                headers: {
                    'Content-Type': undefined // اجازه به browser برای تنظیم خودکار
                }
            });

            if (response.data.success) {
                toast.success('اسلاید با موفقیت به‌روزرسانی شد');
                await loadSlides();
                handleCloseModal();
            } else {
                throw new Error(response.data.message || 'خطا در به‌روزرسانی اسلاید');
            }
        } catch (error) {
            console.error('Error updating slide:', error);

            // نمایش خطاهای validation از backend
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                Object.keys(errors).forEach(field => {
                    errors[field].forEach(message => {
                        toast.error(`${field}: ${message}`);
                    });
                });
            } else {
                toast.error(error.response?.data?.message || 'خطا در به‌روزرسانی اسلاید');
            }
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
            formDataToSend.append('ActionLabel', slide.actionLabel || '');
            formDataToSend.append('ActionLink', slide.actionLink || '');
            formDataToSend.append('IsActive', !slide.isActive);
            formDataToSend.append('Order', slide.order || 0);

            const response = await api.put(`/HeroSlides/${slide.id}`, formDataToSend, {
                headers: {
                    'Content-Type': undefined // اجازه به browser برای تنظیم خودکار
                }
            });

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
            actionLabel: slide.actionLabel || '',
            actionLink: slide.actionLink || '',
            order: slide.order || 0,
            isActive: slide.isActive !== false
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
                imageFile: file
            }));
        }
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
        return <Badge variant="success">فعال</Badge>;
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative h-48">
                <img
                    src={getSliderImageUrl(slide.imageUrl) || 'https://via.placeholder.com/400x200?text=No+Image'}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
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

                {slide.actionLabel && (
                    <div className="mb-3">
                        <span className="text-xs text-slate-500">دکمه عمل:</span>
                        <p className="text-sm font-medium text-blue-600">
                            {slide.actionLabel}
                        </p>
                        {slide.actionLink && (
                            <p className="text-xs text-slate-400 truncate">
                                {slide.actionLink}
                            </p>
                        )}
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
                        {slide.actionLink && (
                            <a
                                href={slide.actionLink}
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
    onImageChange
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

                    <div className="space-y-4">
                        {/* عنوان */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                عنوان *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${!formData.title.trim()
                                    ? 'border-red-300 dark:border-red-600'
                                    : 'border-slate-300 dark:border-slate-600'
                                    }`}
                                placeholder="عنوان اسلاید را وارد کنید"
                                required
                            />
                            {!formData.title.trim() && (
                                <p className="text-red-500 text-xs mt-1">عنوان الزامی است</p>
                            )}
                        </div>

                        {/* توضیحات */}
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

                        {/* تصویر */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                تصویر
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onImageChange}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                            />
                            {formData.imageFile && (
                                <div className="mt-3">
                                    <img
                                        src={URL.createObjectURL(formData.imageFile)}
                                        alt="Preview"
                                        className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-600"
                                    />
                                </div>
                            )}
                        </div>

                        {/* دکمه عمل */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    متن دکمه
                                </label>
                                <input
                                    type="text"
                                    value={formData.actionLabel}
                                    onChange={(e) => setFormData(prev => ({ ...prev, actionLabel: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                    placeholder="مثال: شروع یادگیری"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    لینک دکمه
                                </label>
                                <input
                                    type="text"
                                    value={formData.actionLink}
                                    onChange={(e) => setFormData(prev => ({ ...prev, actionLink: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                    placeholder="/courses یا https://example.com"
                                />
                            </div>
                        </div>

                        {/* ترتیب و وضعیت */}
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
                            {isEditing && (
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
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <Button onClick={onClose} variant="outline">
                            انصراف
                        </Button>
                        <Button
                            onClick={onSubmit}
                            disabled={isSubmitting || !formData.title || !formData.title.trim()}
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