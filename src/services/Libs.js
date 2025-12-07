import { SERVER_URL } from './api';

export const getImageUrl = (path) => {
    if (!path) return null;
    // اگر لینک کامل (http/blob) بود، دست نزن
    if (path.startsWith('http') || path.startsWith('blob:')) return path;

    // اگر SERVER_URL ایمپورت نشد، به صورت پیش‌فرض https://localhost را میگیرد
    const base = SERVER_URL || 'https://localhost:44367';

    // اطمینان از وجود اسلش در ابتدا
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${base}${cleanPath}`;
};

export const formatPrice = (price) => new Intl.NumberFormat('fa-IR').format(price);
