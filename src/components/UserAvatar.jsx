import React from 'react';
import { User } from 'lucide-react';
import { getImageUrl } from '../services/Libs';

/**
 * UserAvatar component for displaying user profile pictures with backend integration
 * Automatically handles image URLs from backend and provides fallback
 */
const UserAvatar = ({
    user,
    src,
    alt,
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

    // استخراج اطلاعات کاربر
    const userName = user?.fullName || user?.name || user?.userName || '';
    const userAvatar = src || user?.avatarUrl || user?.avatar;

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
            const fallback = e.target.nextSibling;
            if (fallback) {
                fallback.style.display = 'flex';
            }
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

    // استفاده از getImageUrl برای تبدیل مسیر به URL کامل
    const imageUrl = userAvatar ? getImageUrl(userAvatar) : null;

    return (
        <div
            className={baseClasses}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            title={userName || alt || 'User Avatar'}
        >
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={alt || userName || 'Avatar'}
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
                        ${imageUrl ? 'hidden' : 'flex'}
                    `}
                    style={{ display: imageUrl ? 'none' : 'flex' }}
                >
                    {userName ? getInitials(userName) : <User className="w-1/2 h-1/2" />}
                </div>
            )}
        </div>
    );
};

export default UserAvatar;
