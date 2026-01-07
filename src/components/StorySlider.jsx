import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StorySlider = ({ stories = [], title = "داستان‌های موفقیت" }) => {
    const [currentStory, setCurrentStory] = useState(0);
    const navigate = useNavigate();

    const nextStory = useCallback(() => {
        if (!stories || stories.length === 0) return;
        setCurrentStory(prev => (prev + 1) % stories.length);
    }, [stories]);

    const prevStory = useCallback(() => {
        if (!stories || stories.length === 0) return;
        setCurrentStory(prev => (prev - 1 + stories.length) % stories.length);
    }, [stories]);

    const goToStory = useCallback((index) => {
        setCurrentStory(index);
    }, []);

    if (!stories || stories.length === 0) return null;

    const currentStoryData = stories[currentStory];
    if (!currentStoryData) return null;

    return (
        <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-green-900 via-teal-900 to-blue-900">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <img
                    src={currentStoryData.image || 'https://via.placeholder.com/1920x600?text=Story'}
                    alt={(currentStoryData.title || 'Story').trim()}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="max-w-2xl">
                        {/* Title */}
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                            {(currentStoryData.title || 'Untitled Story').trim()}
                        </h2>

                        {/* Description */}
                        {currentStoryData.description && (
                            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                                {currentStoryData.description}
                            </p>
                        )}

                        {/* Action Button */}
                        {currentStoryData.actionLabel && currentStoryData.actionLink && (
                            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-400">
                                <button
                                    onClick={() => {
                                        if (currentStoryData.actionLink) {
                                            // اگر لینک خارجی باشد
                                            if (currentStoryData.actionLink.startsWith('http')) {
                                                window.open(currentStoryData.actionLink, '_blank');
                                            } else {
                                                // اگر لینک داخلی باشد
                                                navigate(currentStoryData.actionLink);
                                            }
                                        }
                                    }}
                                    className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:bg-white/90 transition-all hover:-translate-y-1 shadow-xl shadow-white/20 flex items-center justify-center gap-2"
                                >
                                    {currentStoryData.actionLabel}
                                    <ArrowLeft size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            {stories.length > 1 && (
                <>
                    <button
                        onClick={prevStory}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110"
                    >
                        <ChevronRight size={24} />
                    </button>

                    <button
                        onClick={nextStory}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110"
                    >
                        <ChevronLeft size={24} />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {stories.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
                    {stories.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToStory(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentStory
                                ? 'bg-white scale-125'
                                : 'bg-white/40 hover:bg-white/60'
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Section Title */}
            <div className="absolute top-6 left-6 z-20">
                <h3 className="text-white/80 text-sm font-medium uppercase tracking-wider">
                    {title}
                </h3>
            </div>
        </div>
    );
};

export default StorySlider;