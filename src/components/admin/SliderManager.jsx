import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, Upload, Play, Image as ImageIcon, Clock, Calendar } from 'lucide-react';
import { useAlert } from '../../hooks/useAlert';
import { heroSlides, successStories } from '../../data/sliderData';
import {
    filterExpiredItems,
    getRemainingTime,
    createExpirationDate,
    getStoryTypeBadge,
    getStoryTypeLabel
} from '../../utils/storyExpiration';

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
            // Load from localStorage first, fallback to default data
            const savedSlides = localStorage.getItem('heroSlides');
            if (savedSlides) {
                const parsedSlides = JSON.parse(savedSlides);
                // Filter out expired slides
                const validSlides = filterExpiredItems(parsedSlides);
                setSlides(validSlides);

                // Update localStorage if expired items were removed
                if (validSlides.length !== parsedSlides.length) {
                    localStorage.setItem('heroSlides', JSON.stringify(validSlides));
                }
            } else {
                // Load default data from sliderData.js
                setSlides(heroSlides);
                localStorage.setItem('heroSlides', JSON.stringify(heroSlides));
            }
        } catch (error) {
            alert.showError('خطا در بارگذاری اسلایدها');
        }
    };

    const loadStories = async () => {
        try {
            // Load from localStorage first, fallback to default data
            const savedStories = localStorage.getItem('successStories');
            if (savedStories) {
                const parsedStories = JSON.parse(savedStories);
                // Filter out expired stories
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
        } catch (error) {
            alert.showError('خطا در بارگذاری استوری‌ها');
        }
    };

    const saveSlides = async (newSlides) => {
        try {
            setLoading(true);
            // In real app, this would be an API call
            localStorage.setItem('heroSlides', JSON.stringify(newSlides));
            setSlides(newSlides);
            alert.showSuccess('اسلایدها با موفقیت ذخیره شدند');
        } catch (error) {
            alert.showError('خطا در ذخیره اسلایدها');
        } finally {
            setLoading(false);
        }
    };

    const saveStories = async (newStories) => {
        try {
            setLoading(true);
            // In real app, this would be an API call
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
            stats: [],
            primaryAction: { label: '', onClick: () => { } },
            secondaryAction: { label: '', onClick: () => { } },
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
            stats: [],
            action: { label: '', onClick: () => { } },
            isActive: true
        };
        setEditingItem(newStory);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setEditingItem({ ...item });
        setShowModal(true);
    };

    const handleDelete = (id, type) => {
        if (window.confirm('آیا از حذف این آیتم اطمینان دارید؟')) {
            if (type === 'slide') {
                const newSlides = slides.filter(slide => slide.id !== id);
                saveSlides(newSlides);
            } else {
                const newStories = stories.filter(story => story.id !== id);
                saveStories(newStories);
            }
        }
    };

    const handleToggleActive = (id, type) => {
        if (type === 'slide') {
            const newSlides = slides.map(slide =>
                slide.id === id ? { ...slide, isActive: !slide.isActive } : slide
            );
            saveSlides(newSlides);
        } else {
            const newStories = stories.map(story =>
                story.id === id ? { ...story, isActive: !story.isActive } : story
            );
            saveStories(newStories);
        }
    };

    const handleSave = () => {
        if (!editingItem.title || !editingItem.image) {
            alert.showError('لطفاً عنوان و تصویر را وارد کنید');
            return;
        }

        if (activeTab === 'slides') {
            const existingIndex = slides.findIndex(slide => slide.id === editingItem.id);
            let newSlides;

            if (existingIndex >= 0) {
                newSlides = [...slides];
                newSlides[existingIndex] = editingItem;
            } else {
                newSlides = [...slides, editingItem];
            }

            saveSlides(newSlides);
        } else {
            const existingIndex = stories.findIndex(story => story.id === editingItem.id);
            let newStories;

            if (existingIndex >= 0) {
                newStories = [...stories];
                newStories[existingIndex] = editingItem;
            } else {
                newStories = [...stories, editingItem];
            }

            saveStories(newStories);
        }

        setShowModal(false);
        setEditingItem(null);
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
                        src={slide.image || 'https://via.placeholder.com/400x200?text=No+Image'}
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
                        src={story.image || 'https://via.placeholder.com/400x200?text=No+Image'}
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