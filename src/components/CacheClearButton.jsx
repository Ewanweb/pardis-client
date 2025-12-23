/**
 * 🧹 دکمه پاک کردن کش دستی
 * برای استفاده در صفحات admin یا تنظیمات
 */

import React, { useState } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { cacheManager } from '../utils/cacheManager';
import { Button } from './UI';

const CacheClearButton = ({
    variant = "outline",
    size = "sm",
    showSize = false,
    className = ""
}) => {
    const [isClearing, setIsClearing] = useState(false);
    const [cacheSize, setCacheSize] = useState(null);

    // محاسبه اندازه کش
    React.useEffect(() => {
        if (showSize) {
            cacheManager.getCacheSize().then(setCacheSize);
        }
    }, [showSize]);

    const handleClearCache = async () => {
        if (isClearing) return;

        const confirmed = window.confirm(
            "آیا مطمئن هستید که می‌خواهید تمام کش برنامه را پاک کنید؟\n" +
            "این عمل باعث بارگذاری مجدد صفحه خواهد شد."
        );

        if (!confirmed) return;

        setIsClearing(true);

        try {
            await cacheManager.forceClearCache();
            // Page will reload automatically
        } catch (error) {
            console.error("Failed to clear cache:", error);
            alert("خطا در پاک کردن کش. لطفاً دوباره تلاش کنید.");
            setIsClearing(false);
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Button
                variant={variant}
                size={size}
                onClick={handleClearCache}
                disabled={isClearing}
                className="flex items-center gap-2"
            >
                {isClearing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                    <Trash2 className="w-4 h-4" />
                )}
                {isClearing ? "در حال پاک کردن..." : "پاک کردن کش"}
            </Button>

            {showSize && cacheSize && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({cacheSize.kb} KB)
                </span>
            )}
        </div>
    );
};

export default CacheClearButton;