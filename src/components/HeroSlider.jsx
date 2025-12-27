import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Star, Users, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSlider = ({ slides = [] }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const navigate = useNavigate();

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying || slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, slides.length]);

    const nextSlide = useCallback(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = useCallback(() => {
        setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
    }, [slides.length]);

    const goToSlide = useCallback((index) => {
        setCurrentSlide(index);
    }, []);

    if (!slides.length) return null;

    const currentSlideData = slides[currentSlide];
    if (!currentSlideData) return null;

    return (
        <div className="relative w-full h-[600px] md:h-[700px] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <img
                    src={currentSlideData.image || 'https://via.placeholder.com/1920x700?text=Slide'}
                    alt={currentSlideData.title || 'Slide'}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="max-w-2xl">
                        {/* Badge */}
                        {currentSlideData.badge && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <Star size={16} className="text-yellow-400" />
                                <span>{currentSlideData.badge}</span>
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                            {currentSlideData.title || 'Untitled Slide'}
                        </h1>

                        {/* Description */}
                        <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            {currentSlideData.description || ''}
                        </p>

                        {/* Stats */}
                        {currentSlideData.stats && Array.isArray(currentSlideData.stats) && (
                            <div className="flex flex-wrap items-center gap-6 mb-8 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                                {currentSlideData.stats.map((stat, index) => {
                                    const Icon = typeof stat.icon === 'function' ? stat.icon : null;

                                    return (
                                        <div key={index} className="flex items-center gap-2 text-white/80">
                                            {Icon && <Icon size={20} className="text-white" />}
                                            <span className="font-bold">{stat.value || ''}</span>
                                            <span className="text-sm">{stat.label || ''}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-400">
                            {currentSlideData.primaryAction && (
                                <button
                                    onClick={() => {
                                        if (currentSlideData.primaryAction?.link) {
                                            // اگر لینک خارجی باشد
                                            if (currentSlideData.primaryAction.link.startsWith('http')) {
                                                window.open(currentSlideData.primaryAction.link, '_blank');
                                            } else {
                                                // اگر لینک داخلی باشد
                                                navigate(currentSlideData.primaryAction.link);
                                            }
                                        } else if (currentSlideData.primaryAction?.onClick) {
                                            currentSlideData.primaryAction.onClick();
                                        }
                                    }}
                                    className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:bg-white/90 transition-all hover:-translate-y-1 shadow-xl shadow-white/20 flex items-center justify-center gap-2"
                                >
                                    {currentSlideData.primaryAction?.label || 'Action'}
                                    <ArrowLeft size={20} />
                                </button>
                            )}

                            {currentSlideData.secondaryAction && (
                                <button
                                    onClick={() => {
                                        if (currentSlideData.secondaryAction?.link) {
                                            // اگر لینک خارجی باشد
                                            if (currentSlideData.secondaryAction.link.startsWith('http')) {
                                                window.open(currentSlideData.secondaryAction.link, '_blank');
                                            } else {
                                                // اگر لینک داخلی باشد
                                                navigate(currentSlideData.secondaryAction.link);
                                            }
                                        } else if (currentSlideData.secondaryAction?.onClick) {
                                            currentSlideData.secondaryAction.onClick();
                                        }
                                    }}
                                    className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                                >
                                    <Play size={20} />
                                    {currentSlideData.secondaryAction?.label || 'Secondary Action'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        onMouseEnter={() => setIsAutoPlaying(false)}
                        onMouseLeave={() => setIsAutoPlaying(true)}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110"
                    >
                        <ChevronRight size={24} />
                    </button>

                    <button
                        onClick={nextSlide}
                        onMouseEnter={() => setIsAutoPlaying(false)}
                        onMouseLeave={() => setIsAutoPlaying(true)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110"
                    >
                        <ChevronLeft size={24} />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {slides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            onMouseEnter={() => setIsAutoPlaying(false)}
                            onMouseLeave={() => setIsAutoPlaying(true)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'bg-white scale-125'
                                : 'bg-white/40 hover:bg-white/60'
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Progress Bar */}
            {slides.length > 1 && isAutoPlaying && (
                <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-white/20">
                    <div
                        className="h-full bg-white transition-all duration-100 ease-linear"
                        style={{
                            width: `${((currentSlide + 1) / slides.length) * 100}%`
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default HeroSlider;
