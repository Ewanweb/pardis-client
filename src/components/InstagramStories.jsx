import { useState } from 'react';
import { X } from 'lucide-react';
import { getImageUrl } from '../services/Libs';

const InstagramStories = ({ stories = [] }) => {
    const [selectedStory, setSelectedStory] = useState(null);
    const [progress, setProgress] = useState(0);

    if (!stories || stories.length === 0) return null;

    const openStory = (story) => {
        setSelectedStory(story);
        setProgress(0);

        // Auto progress animation
        const duration = 5000; // 5 seconds
        const interval = 50;
        const increment = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    closeStory();
                    return 100;
                }
                return prev + increment;
            });
        }, interval);

        return () => clearInterval(timer);
    };

    const closeStory = () => {
        setSelectedStory(null);
        setProgress(0);
    };


    return (
        <>
            {/* Stories Circles */}
            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {stories.map((story, index) => (
                    <button
                        key={index}
                        onClick={() => openStory(story)}
                        className="flex flex-col items-center gap-2 flex-shrink-0 group"
                    >
                        <div className="relative">
                            {/* Gradient Ring */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[3px] group-hover:scale-110 transition-transform duration-300">
                                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900"></div>
                            </div>

                            {/* Story Image */}
                            <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-slate-900">
                                <img
                                    src={getImageUrl(story.imageUrl)}
                                    alt={story.title || 'Story'}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                        </div>

                        {/* Story Title */}
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[80px] truncate">
                            {story.title || 'داستان'}
                        </span>
                    </button>
                ))}
            </div>

            {/* Story Modal */}
            {selectedStory && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    {/* Progress Bar */}
                    <div className="absolute top-4 left-4 right-4 h-1 bg-white/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={closeStory}
                        className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                    >
                        <X size={20} />
                    </button>

                    {/* Story Content */}
                    <div className="relative w-full max-w-md h-[80vh] rounded-3xl overflow-hidden">
                        {/* Background Image */}
                        <img
                            src={getImageUrl(selectedStory.imageUrl)}
                            alt={selectedStory.title || 'Story'}
                            className="w-full h-full object-cover"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>

                        {/* Text Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                            <h3 className="text-2xl font-bold mb-3">
                                {selectedStory.title}
                            </h3>
                            {selectedStory.description && (
                                <p className="text-white/90 text-sm leading-relaxed mb-4">
                                    {selectedStory.description}
                                </p>
                            )}
                            {selectedStory.actionLabel && selectedStory.actionLink && (
                                <a
                                    href={selectedStory.actionLink}
                                    target={selectedStory.actionLink.startsWith('http') ? '_blank' : '_self'}
                                    rel="noopener noreferrer"
                                    className="inline-block px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-white/90 transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    {selectedStory.actionLabel}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Click to close */}
                    <div
                        className="absolute inset-0 -z-10"
                        onClick={closeStory}
                    ></div>
                </div>
            )}
        </>
    );
};

export default InstagramStories;
