import React from 'react';
import { User } from 'lucide-react';

/**
 * Avatar component for displaying user profile pictures
 * Handles fallback to initials and caching
 */
const Avatar = ({
    src,
    alt,
    name,
    size = 'md',
    className = '',
    showFallback = true,
    onClick
}) => {
    const sizes = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
        '2xl': 'w-20 h-20 text-2xl',
        '3xl': 'w-24 h-24 text-3xl'
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const words = name.trim().split(' ');
        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };

    const handleImageError = (e) => {
        if (showFallback) {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
        }
    };

    const baseClasses = `
        relative inline-flex items-center justify-center 
        rounded-full overflow-hidden bg-gradient-to-br 
        from-primary-100 to-secondary-100 
        dark:from-primary-900/30 dark:to-secondary-900/30
        border-2 border-white dark:border-slate-800
        shadow-sm hover:shadow-md transition-all duration-200
        ${sizes[size]} ${className}
    `.trim();

    return (
        <div
            className={baseClasses}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {src && (
                <img
                    src={src}
                    alt={alt || name || 'Avatar'}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                    loading="lazy"
                />
            )}

            {showFallback && (
                <div
                    className={`
                        w-full h-full flex items-center justify-center
                        bg-gradient-to-br from-primary-500 to-secondary-500
                        text-white font-bold
                        ${src ? 'hidden' : 'flex'}
                    `}
                    style={{ display: src ? 'none' : 'flex' }}
                >
                    {name ? getInitials(name) : <User className="w-1/2 h-1/2" />}
                </div>
            )}
        </div>
    );
};

export default Avatar;