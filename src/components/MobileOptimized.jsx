import React from 'react';

// کامپوننت کانتینر بهینه شده برای موبایل
export const MobileContainer = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`mobile-optimized mobile-padding ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

// کامپوننت گرید ریسپانسیو
export const ResponsiveGrid = ({ children, className = '', cols = { xs: 1, sm: 2, md: 3, lg: 4 } }) => {
    const gridClasses = `
        grid gap-4 
        grid-cols-${cols.xs} 
        sm:grid-cols-${cols.sm} 
        md:grid-cols-${cols.md} 
        lg:grid-cols-${cols.lg}
        ${className}
    `;

    return (
        <div className={gridClasses}>
            {children}
        </div>
    );
};

// کامپوننت کارت بهینه شده برای موبایل
export const MobileCard = ({ children, className = '', onClick, ...props }) => {
    return (
        <div
            className={`
                bg-white dark:bg-slate-800 
                rounded-xl border border-slate-200 dark:border-slate-700 
                p-4 sm:p-6 
                shadow-sm hover:shadow-md 
                transition-all duration-200
                ${onClick ? 'cursor-pointer touch-friendly' : ''}
                ${className}
            `}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
};

// کامپوننت دکمه بهینه شده برای موبایل
export const MobileButton = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseClasses = 'touch-friendly rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2';

    const variants = {
        primary: 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30',
        secondary: 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
        ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
    };

    const sizes = {
        sm: 'px-3 py-2 text-sm min-h-[40px]',
        md: 'px-4 py-3 text-base min-h-[44px]',
        lg: 'px-6 py-4 text-lg min-h-[48px]'
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

// کامپوننت ورودی بهینه شده برای موبایل
export const MobileInput = ({
    label,
    error,
    className = '',
    containerClassName = '',
    ...props
}) => {
    return (
        <div className={`space-y-2 ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                    {label}
                </label>
            )}
            <input
                className={`
                    w-full px-4 py-3 
                    rounded-xl border border-slate-200 dark:border-slate-600 
                    bg-white dark:bg-slate-700 
                    text-slate-800 dark:text-white 
                    placeholder-slate-400 
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    min-h-[44px] text-base
                    ${error ? 'border-red-500 focus:ring-red-500' : ''}
                    ${className}
                `}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
};

// کامپوننت مودال بهینه شده برای موبایل
export const MobileModal = ({
    isOpen,
    onClose,
    title,
    children,
    className = '',
    showCloseButton = true
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`
                relative w-full sm:w-auto sm:min-w-[400px] sm:max-w-lg
                bg-white dark:bg-slate-900 
                rounded-t-2xl sm:rounded-2xl
                shadow-xl border-t sm:border border-slate-200 dark:border-slate-700
                max-h-[90vh] overflow-y-auto mobile-optimized
                animate-in slide-in-from-bottom sm:fade-in sm:zoom-in duration-200
                ${className}
            `}>
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                        {title && (
                            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 touch-friendly"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="p-4 sm:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// کامپوننت لودینگ بهینه شده برای موبایل
export const MobileLoading = ({ size = 'md', text = 'در حال بارگذاری...' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
            <div className={`${sizes[size]} border-2 border-primary border-t-transparent rounded-full animate-spin`} />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{text}</p>
        </div>
    );
};

// کامپوننت حالت خالی
export const MobileEmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    className = ''
}) => {
    return (
        <div className={`text-center py-12 px-4 ${className}`}>
            {Icon && (
                <div className="w-16 h-16 mx-auto mb-4 text-slate-400">
                    <Icon size={64} />
                </div>
            )}
            {title && (
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">
                    {title}
                </h3>
            )}
            {description && (
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                    {description}
                </p>
            )}
            {action}
        </div>
    );
};

// Hook برای تشخیص اندازه صفحه
export const useScreenSize = () => {
    const [screenSize, setScreenSize] = React.useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
        isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
        isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
        isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
    });

    React.useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            setScreenSize({
                width,
                height,
                isMobile: width < 768,
                isTablet: width >= 768 && width < 1024,
                isDesktop: width >= 1024
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // اجرای اولیه

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return screenSize;
};

export default {
    MobileContainer,
    ResponsiveGrid,
    MobileCard,
    MobileButton,
    MobileInput,
    MobileModal,
    MobileLoading,
    MobileEmptyState,
    useScreenSize
};