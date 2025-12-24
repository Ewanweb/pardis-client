import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Users, Star, Clock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { filterExpiredItems, getRemainingTime } from '../utils/storyExpiration';

const StoryCard = ({ story, isActive, onClick, isViewed = false }) => {
    if (!story) return null;

    const remainingTime = getRemainingTime(story);
    const isTemporary = story.storyType === 'temporary';

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Story Circle - Instagram Style */}
            <div
                onClick={onClick}
                className={`relative cursor-pointer transition-all duration-300 ${isActive ? 'scale-110' : 'hover:scale-105'
                    }`}
            >
                {/* Gradient Ring */}
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full p-0.5 ${isViewed
                    ? 'bg-gray-300 dark:bg-gray-600'
                    : isTemporary && !remainingTime.expired
                        ? 'bg-gradient-to-tr from-orange-400 via-red-500 to-pink-600'
                        : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'
                    } ${isActive ? 'animate-pulse' : ''}`}>

                    {/* Inner White Ring */}
                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full p-0.5">

                        {/* Story Image */}
                        <div className="w-full h-full rounded-full overflow-hidden">
                            <img
                                src={story.image || 'https://via.placeholder.com/100x100?text=Story'}
                                alt={story.title || 'Story'}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>

                {/* Temporary Story Timer */}
                {isTemporary && !remainingTime.expired && (
                    <div className="absolute -top-1 -left-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <Clock size={12} className="text-white" />
                    </div>
                )}

                {/* Badge */}
                {story.badge && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                            {story.badge.length > 2 ? story.badge.substring(0, 2) : story.badge}
                        </span>
                    </div>
                )}

                {/* Play Button for Video Stories */}
                {story.type === 'video' && (
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Play size={12} className="text-gray-700" fill="currentColor" />
                    </div>
                )}
            </div>

            {/* Story Title */}
            <div className="text-center max-w-[80px]">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                    {story.subtitle || story.title || 'Story'}
                </p>
                {/* Remaining Time for Temporary Stories */}
                {isTemporary && !remainingTime.expired && (
                    <p className="text-xs text-orange-500 font-bold">
                        {remainingTime.formatted}
                    </p>
                )}
            </div>
        </div>
    );
};

const StoryModal = ({ story, isOpen, onClose, onNext, onPrev }) => {
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!isOpen || isPaused || !story) return;

        const duration = story.duration || 5000;
        const interval = 50;
        const increment = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    onNext();
                    return 0;
                }
                return prev + increment;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [isOpen, isPaused, story, onNext]);

    useEffect(() => {
        if (isOpen && story) {
            setProgress(0);
        }
    }, [isOpen, story]);

    if (!isOpen || !story) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            {/* Progress Bar */}
            <div className="absolute top-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
                ×
            </button>

            {/* Navigation */}
            <button
                onClick={onPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
                <ChevronRight size={24} />
            </button>

            <button
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
                <ChevronLeft size={24} />
            </button>

            {/* Story Content */}
            <div
                className="relative max-w-md w-full aspect-[9/16] rounded-3xl overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Background */}
                <img
                    src={story.image || 'https://via.placeholder.com/400x600?text=Story'}
                    alt={story.title || 'Story'}
                    className="w-full h-full object-cover"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    {/* Top Content */}
                    <div className="text-center">
                        {story.badge && (
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold mb-4">
                                {story.badge}
                            </span>
                        )}
                    </div>

                    {/* Bottom Content */}
                    <div className="text-center text-white">
                        <h2 className="text-2xl font-black mb-3 leading-tight">
                            {story.title || 'Untitled Story'}
                        </h2>

                        {story.description && (
                            <p className="text-white/90 mb-6 leading-relaxed">
                                {story.description}
                            </p>
                        )}

                        {story.stats && Array.isArray(story.stats) && (
                            <div className="flex justify-center gap-4 mb-6">
                                {story.stats.map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className="text-lg font-bold">{stat.value || ''}</div>
                                        <div className="text-xs text-white/80">{stat.label || ''}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {story.action && (story.action.onClick || story.action.link) && (
                            <button
                                onClick={() => {
                                    if (story.action.link) {
                                        // اگر لینک خارجی باشد
                                        if (story.action.link.startsWith('http')) {
                                            window.open(story.action.link, '_blank');
                                        } else {
                                            // اگر لینک داخلی باشد
                                            navigate(story.action.link);
                                            closeStory(); // بستن modal بعد از navigate
                                        }
                                    } else if (story.action.onClick) {
                                        story.action.onClick();
                                    }
                                }}
                                className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-white/90 transition-colors"
                            >
                                {story.action.label || 'Action'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StorySlider = ({ stories = [], title = "داستان‌های موفقیت" }) => {
    const [activeStory, setActiveStory] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewedStories, setViewedStories] = useState(new Set());
    const scrollRef = useRef(null);
    const navigate = useNavigate();

    // Filter out expired stories
    const validStories = filterExpiredItems(stories);

    // Load viewed stories from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('viewedStories');
        if (saved) {
            setViewedStories(new Set(JSON.parse(saved)));
        }
    }, []);

    // Save viewed stories to localStorage
    const markAsViewed = (storyId) => {
        const newViewed = new Set(viewedStories);
        newViewed.add(storyId);
        setViewedStories(newViewed);
        localStorage.setItem('viewedStories', JSON.stringify([...newViewed]));
    };

    const openStory = (story, index) => {
        if (!story) return;
        setActiveStory(story);
        setCurrentIndex(index);
        // Mark as viewed when opened
        markAsViewed(story.id);
    };

    const closeStory = () => {
        setActiveStory(null);
        setCurrentIndex(0);
    };

    const nextStory = () => {
        if (!validStories.length) return;
        const nextIndex = (currentIndex + 1) % validStories.length;
        setCurrentIndex(nextIndex);
        setActiveStory(validStories[nextIndex]);
        // Mark new story as viewed
        if (validStories[nextIndex]) {
            markAsViewed(validStories[nextIndex].id);
        }
    };

    const prevStory = () => {
        if (!validStories.length) return;
        const prevIndex = (currentIndex - 1 + validStories.length) % validStories.length;
        setCurrentIndex(prevIndex);
        setActiveStory(validStories[prevIndex]);
        // Mark new story as viewed
        if (validStories[prevIndex]) {
            markAsViewed(validStories[prevIndex].id);
        }
    };

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    if (!validStories.length) return null;

    return (
        <>
            <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">
                            {title}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            تجربه‌های واقعی دانشجویان ما را ببینید
                        </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={scrollLeft}
                            className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                        <button
                            onClick={scrollRight}
                            className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    </div>
                </div>

                {/* Stories Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {validStories.map((story, index) => (
                        <StoryCard
                            key={story.id || index}
                            story={story}
                            isActive={activeStory === story}
                            isViewed={viewedStories.has(story.id)}
                            onClick={() => openStory(story, index)}
                        />
                    ))}
                </div>
            </div>

            {/* Story Modal */}
            <StoryModal
                story={activeStory}
                isOpen={!!activeStory}
                onClose={closeStory}
                onNext={nextStory}
                onPrev={prevStory}
            />
        </>
    );
};

export default StorySlider;