import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, Upload, Play, Image as ImageIcon, Clock, Calendar, Home } from 'lucide-react';
import { useAlert } from '../../hooks/useAlert';
import { api } from '../../services/api'; // ✅ اضافه کردن API
import { heroSlides, successStories } from '../../data/sliderData';
import {
    filterExpiredItems,
    getRemainingTime,
    createExpirationDate,
    getStoryTypeBadge,
    getStoryTypeLabel
} from '../../utils/storyExpiration';
import {
    serializeSlidesForStorage,
    hydrateSlidesForDisplay
} from '../../utils/sliderIcons';
import {
    transformSlideFormToApi,
    transformSlideFormToApiForUpdate,
    transformStoryFormToApi,
    transformStoryFormToApiForUpdate,
    validateSlideForm,
    validateStoryForm,
    handleApiError
} from '../../utils/sliderDataTransform';

const SliderManager = () => {
    const [slides, setSlides] = useState([]);
    const [stories, setStories] = useState([]);
    const [activeTab, setActiveTab] = useState('slides');
    const [editingItem, setEditingItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const alert = useAlert();

    // Load data from API or localStorage
    useEffect(() => {
        loadSlides();
        loadStories();
    }, []);

    const loadSlides = async () => {
        try {
            setLoading(true);
            // ✅ استفاده از API صحیح بر اساس swagger.json
            const response = await api.get('/HeroSlides?adminView=true&includeInactive=true&includeExpired=true');
            const slidesData = response.data?.data || [];
            setSlides(slidesData);
        } catch (error) {
            console.error('Error loading slides from API:', error);
            // Fallback to localStorage if API fails
            try {
                const savedSlides = localStorage.getItem('heroSlides');
                if (savedSlides) {
                    const parsedSlides = JSON.parse(savedSlides);
                    const hydratedSlides = hydrateSlidesForDisplay(parsedSlides);
                    const validSlides = filterExpiredItems(hydratedSlides);
                    setSlides(validSlides);
                } else {
                    // Load default data from sliderData.js
                    const sanitizedDefaults = serializeSlidesForStorage(heroSlides);
                    const hydratedDefaults = hydrateSlidesForDisplay(sanitizedDefaults);
                    setSlides(hydratedDefaults);
                }
            } catch (fallbackError) {
                console.error('Error loading slides from localStorage:', fallbackError);
                alert.showError('خطا در بارگذاری اسلایدها');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadStories = async () => {
        try {
            setLoading(true);
            // ✅ استفاده از API به جای localStorage
            const response = await api.get('/SuccessStories?adminView=true&includeInactive=true&includeExpired=true');
            const storiesData = response.data?.data || [];
            setStories(storiesData);
        } catch (error) {
            console.error('Error loading stories from API:', error);
            // Fallback to localStorage if API fails
            try {
                const savedStories = localStorage.getItem('successStories');
                if (savedStories) {
                    const parsedStories = JSON.parse(savedStories);
                    const validStories = filterExpiredItems(parsedStories);
                    setStories(validStories);

                    // Update localStorage if expired items were removed
                    if (validStories.length !== parsedStories.length) {
                        localStorage.setItem('successStories', JSON.stringify(validStories));
                    }
                } else {
                    // Load default data from sliderData.js
                    setStories(successStories);
                    localStorage.setItem('successStories', JSON.stringify(successStories));
                }
            } catch (fallbackError) {
                console.error('Error loading stories from localStorage:', fallbackError);
                alert.showError('خطا در بارگذاری استوری‌ها');
            }
        } finally {
            setLoading(false);
        }
    };

    // ✅ متدهای جدید برای API operations
    const createSlide = async (slideData) => {
        try {
            setLoading(true);

            // Validate form data before API submission
            const validation = validateSlideForm(slideData);
            if (!validation.isValid) {
                const errorMessages = Object.values(validation.errors).join(', ');
                alert.showError(errorMessages);
                return;
            }

            // Transform form data to API format
            const formData = transformSlideFormToApi(slideData);

            const response = await api.post('/HeroSlides', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await loadSlides(); // بارگذاری مجدد لیست
            alert.showSuccess('اسلاید با موفقیت ایجاد شد');
            return response.data;
        } catch (error) {
            console.error('Error creating slide:', error);
            const errorMessage = handleApiError(error);
            alert.showError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateSlide = async (id, slideData) => {
        try {
            setLoading(true);

            // Validate form data before API submission
            const validation = validateSlideForm(slideData);
            if (!validation.isValid) {
                const errorMessages = Object.values(validation.errors).join(', ');
                alert.showError(errorMessages);
                return;
            }

            // Transform form data to API format for update
            const formData = transformSlideFormToApiForUpdate(slideData);

            const response = await api.put(`/HeroSlides/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await loadSlides(); // بارگذاری مجدد لیست
            alert.showSuccess('اسلاید با موفقیت به‌روزرسانی شد');
            return response.data;
        } catch (error) {
            console.error('Error updating slide:', error);
            const errorMessage = handleApiError(error);
            alert.showError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteSlide = async (id) => {
        try {
            setLoading(true);
            await api.delete(`/HeroSlides/${id}`);
            await loadSlides(); // بارگذاری مجدد لیست
            alert.showSuccess('اسلاید با موفقیت حذف شد');
        } catch (error) {
            console.error('Error deleting slide:', error);
            alert.showError('خطا در حذف اسلاید');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // ✅ متدهای API برای Success Stories
    const createStory = async (storyData) => {
        try {
            setLoading(true);

            // Validate form data before API submission
            const validation = validateStoryForm(storyData);
            if (!validation.isValid) {
                const errorMessages = Object.values(validation.errors).join(', ');
                alert.showError(errorMessages);
                return;
            }

            // Transform form data to API format
            const formData = transformStoryFormToApi(storyData);

            const response = await api.post('/SuccessStories', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await loadStories(); // بارگذاری مجدد لیست
            alert.showSuccess('استوری با موفقیت ایجاد شد');
            return response.data;
        } catch (error) {
            console.error('Error creating story:', error);
            const errorMessage = handleApiError(error);
            alert.showError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateStory = async (id, storyData) => {
        try {
            setLoading(true);

            // Validate form data before API submission
            const validation = validateStoryForm(storyData);
            if (!validation.isValid) {
                const errorMessages = Object.values(validation.errors).join(', ');
                alert.showError(errorMessages);
                return;
            }

            // Transform form data to API format for update
            const formData = transformStoryFormToApiForUpdate(storyData);

            const response = await api.put(`/SuccessStories/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await loadStories(); // بارگذاری مجدد لیست
            alert.showSuccess('استوری با موفقیت به‌روزرسانی شد');
            return response.data;
        } catch (error) {
            console.error('Error updating story:', error);
            const errorMessage = handleApiError(error);
            alert.showError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };



    const deleteStory = async (id) => {
        try {
            setLoading(true);
            await api.delete(`/SuccessStories/${id}`);
            await loadStories(); // بارگذاری مجدد لیست
            alert.showSuccess('استوری با موفقیت حذف شد');
        } catch (error) {
            console.error('Error deleting story:', error);
            alert.showError('خطا در حذف استوری');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const saveSlides = async (newSlides) => {
        // ⚠️ DEPRECATED: این متد دیگر استفاده نمی‌شود - از createSlide, updateSlide, deleteSlide استفاده کنید
        // فقط برای compatibility با کدهای قدیمی نگه داشته شده
        try {
            setLoading(true);
            // Fallback to localStorage for compatibility
            const sanitizedSlides = serializeSlidesForStorage(newSlides);
            localStorage.setItem('heroSlides', JSON.stringify(sanitizedSlides));
            setSlides(newSlides);
            alert.showSuccess('اسلایدها با موفقیت ذخیره شدند');
        } catch (error) {
            alert.showError('خطا در ذخیره اسلایدها');
        } finally {
            setLoading(false);
        }
    };

    const saveStories = async (newStories) => {
        // ⚠️ DEPRECATED: این متد دیگر استفاده نمی‌شود - از createStory, updateStory, deleteStory استفاده کنید
        // فقط برای compatibility با کدهای قدیمی نگه داشته شده
        try {
            setLoading(true);
            // Fallback to localStorage for compatibility
            localStorage.setItem('successStories', JSON.stringify(newStories));
            setStories(newStories);
            alert.showSuccess('استوری‌ها با موفقیت ذخیره شدند');
        } catch (error) {
            alert.showError('خطا در ذخیره استوری‌ها');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSlide = () => {
        const newSlide = {
            id: `slide-${Date.now()}`,
            title: '',
            description: '',
            image: '',
            badge: '',
            slideType: 'permanent', // default to permanent
            createdAt: new Date().toISOString(),
            expiresAt: null,
            order: slides.length + 1,
            primaryAction: {
                label: '',
                link: ''
            },
            secondaryAction: {
                label: '',
                link: ''
            },
            isActive: true
        };
        setEditingItem(newSlide);
        setShowModal(true);
    };

    const handleAddStory = () => {
        const newStory = {
            id: `story-${Date.now()}`,
            title: '',
            subtitle: '',
            description: '',
            image: '',
            badge: '',
            type: 'success',
            storyType: 'permanent', // default to permanent
            createdAt: new Date().toISOString(),
            expiresAt: null,
            duration: 5000,
            order: stories.length + 1,
            action: {
                label: '',
                link: ''
            },
            isActive: true
        };
        setEditingItem(newStory);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        if (activeTab === 'slides') {
            // ✅ تبدیل داده‌های API به فرمت فرم
            const formattedSlide = {
                ...item,
                image: item.imageUrl || item.image || '',
                primaryAction: {
                    label: item.buttonText || '',
                    link: item.buttonLink || ''
                },
                secondaryAction: {
                    label: '',
                    link: ''
                }
            };
            setEditingItem(formattedSlide);
        } else {
            // ✅ تبدیل داده‌های API به فرمت فرم برای stories
            const formattedStory = {
                ...item,
                image: item.imageUrl || item.image || '',
                action: {
                    label: item.actionText || '',
                    link: item.actionLink || ''
                }
            };
            setEditingItem(formattedStory);
        }
        setShowModal(true);
    };

    const handleDelete = async (id, type) => {
        if (window.confirm('آیا از حذف این آیتم اطمینان دارید؟')) {
            if (type === 'slide') {
                // ✅ استفاده از API
                await deleteSlide(id);
            } else {
                // ✅ استفاده از API برای stories
                await deleteStory(id);
            }
        }
    };

    const handleToggleActive = async (id, type) => {
        if (type === 'slide') {
            // ✅ استفاده از API برای toggle کردن وضعیت
            const slide = slides.find(s => s.id === id);
            if (slide) {
                const slideData = {
                    title: slide.title,
                    description: slide.description || '',
                    buttonText: slide.buttonText || slide.primaryAction?.label || '',
                    buttonLink: slide.buttonLink || slide.primaryAction?.link || '',
                    order: slide.order || 0,
                    isActive: !slide.isActive
                };

                // اگر تصویر URL است، آن را به عنوان imageUrl ارسال کن
                if (slide.image && slide.image.startsWith('http')) {
                    slideData.imageUrl = slide.image;
                } else if (slide.imageUrl) {
                    slideData.imageUrl = slide.imageUrl;
                }

                await updateSlide(id, slideData);
            }
        } else {
            // ✅ استفاده از API برای stories
            const story = stories.find(s => s.id === id);
            if (story) {
                const storyData = {
                    title: story.title,
                    subtitle: story.subtitle || '',
                    description: story.description || '',
                    type: story.type || 'success',
                    order: story.order || 0,
                    isActive: !story.isActive
                };

                // اگر تصویر URL است، آن را به عنوان imageUrl ارسال کن
                if (story.image && story.image.startsWith('http')) {
                    storyData.imageUrl = story.image;
                } else if (story.imageUrl) {
                    storyData.imageUrl = story.imageUrl;
                }

                await updateStory(id, storyData);
            }
        }
    };

    const handleSave = async () => {
        try {
            if (activeTab === 'slides') {
                const existingSlide = slides.find(slide => slide.id === editingItem.id);

                // ✅ تبدیل داده‌های فرم به فرمت مناسب برای transformation utilities
                const slideData = {
                    title: editingItem.title,
                    description: editingItem.description || '',
                    image: editingItem.image || '',
                    imageFile: editingItem.imageFile || null,
                    badge: editingItem.badge || '',
                    primaryAction: editingItem.primaryAction || { label: '', link: '' },
                    secondaryAction: editingItem.secondaryAction || { label: '', link: '' },
                    slideType: editingItem.slideType || 'permanent',
                    expiresAt: editingItem.expiresAt || null,
                    order: editingItem.order || 0,
                    isActive: editingItem.isActive !== false,
                    linkUrl: editingItem.linkUrl || ''
                };

                // ✅ Validate form data before API submission
                const validation = validateSlideForm(slideData);
                if (!validation.isValid) {
                    // ✅ Show validation errors in UI
                    const errorMessages = Object.values(validation.errors).join(', ');
                    alert.showError(errorMessages);
                    // ✅ Prevent API calls when validation fails
                    return;
                }

                if (existingSlide) {
                    // ✅ به‌روزرسانی اسلاید موجود - use main API method
                    await updateSlide(editingItem.id, slideData);
                } else {
                    // ✅ ایجاد اسلاید جدید - use main API method
                    await createSlide(slideData);
                }
            } else {
                // ✅ استفاده از API برای stories
                const existingStory = stories.find(story => story.id === editingItem.id);

                // تبدیل داده‌های فرم به فرمت مناسب برای transformation utilities
                const storyData = {
                    title: editingItem.title,
                    subtitle: editingItem.subtitle || '',
                    description: editingItem.description || '',
                    image: editingItem.image || '',
                    imageFile: editingItem.imageFile || null,
                    badge: editingItem.badge || '',
                    type: editingItem.type || 'success',
                    studentName: editingItem.studentName || '',
                    courseName: editingItem.courseName || '',
                    courseId: editingItem.courseId || '',
                    action: editingItem.action || { label: '', link: '' },
                    duration: editingItem.duration || 5000,
                    storyType: editingItem.storyType || 'permanent',
                    expiresAt: editingItem.expiresAt || null,
                    order: editingItem.order || 0,
                    isActive: editingItem.isActive !== false,
                    linkUrl: editingItem.linkUrl || ''
                };

                // ✅ Validate form data before API submission
                const validation = validateStoryForm(storyData);
                if (!validation.isValid) {
                    // ✅ Show validation errors in UI
                    const errorMessages = Object.values(validation.errors).join(', ');
                    alert.showError(errorMessages);
                    // ✅ Prevent API calls when validation fails
                    return;
                }

                if (existingStory) {
                    // به‌روزرسانی استوری موجود - use main API method
                    await updateStory(editingItem.id, storyData);
                } else {
                    // ایجاد استوری جدید - use main API method
                    await createStory(storyData);
                }
            }

            // بستن modal
            setShowModal(false);
            setEditingItem(null);
        } catch (error) {
            // خطا در API call - پیام خطا قبلاً نمایش داده شده
            console.error('Error in handleSave:', error);
        }
    };

    const handleCancel = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    const SlideCard = ({ slide }) => {
        const remainingTime = getRemainingTime(slide);
        const isTemporary = slide.slideType === 'temporary';

        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="relative h-48">
                    <img
                        src={slide.imageUrl || slide.image || 'https://via.placeholder.com/400x200?text=No+Image'}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                        {slide.badge && (
                            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                                {slide.badge}
                            </span>
                        )}
                        {isTemporary && (
                            <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${remainingTime.expired
                                ? 'bg-red-500 text-white'
                                : 'bg-orange-500 text-white'
                                }`}>
                                <Clock size={12} />
                                {remainingTime.expired ? 'منقضی' : remainingTime.formatted}
                            </span>
                        )}
                        <button
                            onClick={() => handleToggleActive(slide.id, 'slide')}
                            className={`p-1 rounded-full ${slide.isActive ? 'bg-green-500' : 'bg-gray-500'} text-white`}
                        >
                            {slide.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white flex-1">
                            {slide.title || 'بدون عنوان'}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStoryTypeBadge(slide.slideType)}`}>
                            {getStoryTypeLabel(slide.slideType)}
                        </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
                        {slide.description || 'بدون توضیحات'}
                    </p>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(slide)}
                                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(slide.id, 'slide')}
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${slide.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                            {slide.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const StoryCard = ({ story }) => {
        const remainingTime = getRemainingTime(story);
        const isTemporary = story.storyType === 'temporary';

        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="relative h-48">
                    <img
                        src={story.imageUrl || story.image || 'https://via.placeholder.com/400x200?text=No+Image'}
                        alt={story.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                        {story.badge && (
                            <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                                {story.badge}
                            </span>
                        )}
                        {isTemporary && (
                            <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${remainingTime.expired
                                ? 'bg-red-500 text-white'
                                : 'bg-orange-500 text-white'
                                }`}>
                                <Clock size={12} />
                                {remainingTime.expired ? 'منقضی' : remainingTime.formatted}
                            </span>
                        )}
                        {story.type === 'video' && (
                            <span className="p-1 bg-red-500 text-white rounded-full">
                                <Play size={12} />
                            </span>
                        )}
                        <button
                            onClick={() => handleToggleActive(story.id, 'story')}
                            className={`p-1 rounded-full ${story.isActive ? 'bg-green-500' : 'bg-gray-500'} text-white`}
                        >
                            {story.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white flex-1">
                            {story.title || 'بدون عنوان'}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStoryTypeBadge(story.storyType)}`}>
                            {getStoryTypeLabel(story.storyType)}
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
                        {story.subtitle || 'بدون زیرعنوان'}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
                        {story.description || 'بدون توضیحات'}
                    </p>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(story)}
                                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(story.id, 'story')}
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${story.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                            {story.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                    مدیریت اسلایدها و استوری‌ها
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        title="بازگشت به صفحه اصلی"
                    >
                        <Home size={20} />
                        صفحه اصلی
                    </button>
                    <button
                        onClick={activeTab === 'slides' ? handleAddSlide : handleAddStory}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                        <Plus size={20} />
                        {activeTab === 'slides' ? 'اسلاید جدید' : 'استوری جدید'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('slides')}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'slides'
                        ? 'text-blue-500 border-b-2 border-blue-500'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    اسلایدهای اصلی ({slides.length})
                </button>
                <button
                    onClick={() => setActiveTab('stories')}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'stories'
                        ? 'text-blue-500 border-b-2 border-blue-500'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    استوری‌های موفقیت ({stories.length})
                </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'slides' ? (
                    slides.length > 0 ? (
                        slides.map(slide => (
                            <SlideCard key={slide.id} slide={slide} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <ImageIcon size={48} className="mx-auto text-slate-400 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 mb-4">
                                هنوز اسلایدی اضافه نشده است
                            </p>
                            <button
                                onClick={handleAddSlide}
                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                                اولین اسلاید را اضافه کنید
                            </button>
                        </div>
                    )
                ) : (
                    stories.length > 0 ? (
                        stories.map(story => (
                            <StoryCard key={story.id} story={story} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <Play size={48} className="mx-auto text-slate-400 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 mb-4">
                                هنوز استوری‌ای اضافه نشده است
                            </p>
                            <button
                                onClick={handleAddStory}
                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                                اولین استوری را اضافه کنید
                            </button>
                        </div>
                    )
                )}
            </div>

            {/* Modal */}
            {showModal && editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                    {activeTab === 'slides' ? 'ویرایش اسلاید' : 'ویرایش استوری'}
                                </h2>
                                <button
                                    onClick={handleCancel}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        عنوان *
                                    </label>
                                    <input
                                        type="text"
                                        value={editingItem.title}
                                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                        placeholder="عنوان را وارد کنید"
                                    />
                                </div>

                                {/* Subtitle (Stories only) */}
                                {activeTab === 'stories' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            زیرعنوان
                                        </label>
                                        <input
                                            type="text"
                                            value={editingItem.subtitle || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                            placeholder="زیرعنوان را وارد کنید"
                                        />
                                    </div>
                                )}

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        توضیحات
                                    </label>
                                    <textarea
                                        value={editingItem.description}
                                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                        placeholder="توضیحات را وارد کنید"
                                    />
                                </div>

                                {/* Image URL */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        آدرس تصویر *
                                    </label>
                                    <input
                                        type="url"
                                        value={editingItem.image}
                                        onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {/* Image Preview */}
                                    {editingItem.image && (
                                        <div className="mt-2">
                                            <img
                                                src={editingItem.image}
                                                alt="Preview"
                                                className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-600"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Badge */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        برچسب
                                    </label>
                                    <input
                                        type="text"
                                        value={editingItem.badge || ''}
                                        onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                        placeholder="برچسب را وارد کنید"
                                    />
                                </div>

                                {/* Primary Action (Slides only) */}
                                {activeTab === 'slides' && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    متن دکمه اصلی
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editingItem.primaryAction?.label || ''}
                                                    onChange={(e) => setEditingItem({
                                                        ...editingItem,
                                                        primaryAction: {
                                                            ...editingItem.primaryAction,
                                                            label: e.target.value
                                                        }
                                                    })}
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
                                                    value={editingItem.primaryAction?.link || ''}
                                                    onChange={(e) => setEditingItem({
                                                        ...editingItem,
                                                        primaryAction: {
                                                            ...editingItem.primaryAction,
                                                            link: e.target.value
                                                        }
                                                    })}
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
                                                    value={editingItem.secondaryAction?.label || ''}
                                                    onChange={(e) => setEditingItem({
                                                        ...editingItem,
                                                        secondaryAction: {
                                                            ...editingItem.secondaryAction,
                                                            label: e.target.value
                                                        }
                                                    })}
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
                                                    value={editingItem.secondaryAction?.link || ''}
                                                    onChange={(e) => setEditingItem({
                                                        ...editingItem,
                                                        secondaryAction: {
                                                            ...editingItem.secondaryAction,
                                                            link: e.target.value
                                                        }
                                                    })}
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                                    placeholder="/about یا https://youtube.com/watch?v=..."
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Action Link (Stories only) */}
                                {activeTab === 'stories' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                متن دکمه عمل
                                            </label>
                                            <input
                                                type="text"
                                                value={editingItem.action?.label || ''}
                                                onChange={(e) => setEditingItem({
                                                    ...editingItem,
                                                    action: {
                                                        ...editingItem.action,
                                                        label: e.target.value
                                                    }
                                                })}
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
                                                value={editingItem.action?.link || ''}
                                                onChange={(e) => setEditingItem({
                                                    ...editingItem,
                                                    action: {
                                                        ...editingItem.action,
                                                        link: e.target.value
                                                    }
                                                })}
                                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                                placeholder="/profile/123 یا https://linkedin.com/in/..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Duration (Stories only) */}
                                {activeTab === 'stories' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            مدت زمان نمایش (میلی‌ثانیه)
                                        </label>
                                        <input
                                            type="number"
                                            value={editingItem.duration || 5000}
                                            onChange={(e) => setEditingItem({ ...editingItem, duration: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                            min="1000"
                                            max="10000"
                                        />
                                    </div>
                                )}

                                {/* Story/Slide Type */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        نوع {activeTab === 'slides' ? 'اسلاید' : 'استوری'}
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="flex items-center p-3 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                            <input
                                                type="radio"
                                                name="itemType"
                                                value="permanent"
                                                checked={(activeTab === 'slides' ? editingItem.slideType : editingItem.storyType) === 'permanent'}
                                                onChange={(e) => {
                                                    const key = activeTab === 'slides' ? 'slideType' : 'storyType';
                                                    setEditingItem({
                                                        ...editingItem,
                                                        [key]: e.target.value,
                                                        expiresAt: null
                                                    });
                                                }}
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
                                                name="itemType"
                                                value="temporary"
                                                checked={(activeTab === 'slides' ? editingItem.slideType : editingItem.storyType) === 'temporary'}
                                                onChange={(e) => {
                                                    const key = activeTab === 'slides' ? 'slideType' : 'storyType';
                                                    setEditingItem({
                                                        ...editingItem,
                                                        [key]: e.target.value,
                                                        expiresAt: createExpirationDate()
                                                    });
                                                }}
                                                className="mr-2"
                                            />
                                            <div>
                                                <div className="font-medium text-slate-800 dark:text-white">موقت</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">24 ساعته</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={editingItem.isActive}
                                        onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        فعال
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                >
                                    انصراف
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                                >
                                    <Save size={16} />
                                    {loading ? 'در حال ذخیره...' : 'ذخیره'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SliderManager;
