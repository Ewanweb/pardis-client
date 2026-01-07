import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { optimizeImageForMobile, detectDevice } from '../utils/mobileOptimizations';

const LazyImage = ({
    src,
    alt,
    className = '',
    width,
    height,
    quality,
    placeholder = 'https://placehold.co/600x400/e2e8f0/64748b?text=Loading...',
    onError,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef();
    const device = useMemo(() => detectDevice(), []);

    // بهینه‌سازی src برای موبایل
    const optimizedSrc = useMemo(() => (
        optimizeImageForMobile(src, {
            width: width || (device.isMobile ? Math.min(device.screenWidth * device.pixelRatio, 800) : undefined),
            height,
            quality: quality || (device.isMobile ? 80 : 90)
        })
    ), [device.isMobile, device.pixelRatio, device.screenWidth, height, quality, src, width]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: '50px' }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleLoad = useCallback(() => {
        setIsLoaded(true);
    }, []);

    const handleError = useCallback((e) => {
        setHasError(true);
        if (onError) {
            onError(e);
        } else {
            e.target.src = 'https://placehold.co/600x400/ef4444/ffffff?text=Error';
        }
    }, [onError]);

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden ${className}`}
            style={{ width, height }}
        >
            {/* Placeholder */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                </div>
            )}

            {/* Actual Image */}
            {isInView && (
                <img
                    src={optimizedSrc}
                    alt={alt}
                    className={`mobile-image w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading="lazy"
                    decoding="async"
                    width={width}
                    height={height}
                    // بهینه‌سازی برای موبایل
                    style={{
                        imageRendering: device.isMobile ? '-webkit-optimize-contrast' : 'auto'
                    }}
                    {...props}
                />
            )}
        </div>
    );
};

export default LazyImage;
