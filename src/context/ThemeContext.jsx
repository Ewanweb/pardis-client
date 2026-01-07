import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // تابع تشخیص تم بر اساس ساعت سیستم
    const getTimeBasedTheme = () => {
        const hour = new Date().getHours();
        // صبح تا بعد از ظهر (6 صبح تا 6 عصر): حالت روشن
        // عصر تا شب (6 عصر تا 6 صبح): حالت تاریک
        return (hour >= 6 && hour < 18) ? 'light' : 'dark';
    };

    // بررسی اینکه آیا کاربر قبلاً تم را دستی تغییر داده یا نه
    const [isManualOverride, setIsManualOverride] = useState(
        localStorage.getItem('themeManualOverride') === 'true'
    );

    // 1. مدیریت حالت تاریک و روشن (Dark/Light Mode)
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('themeMode');
        const savedOverride = localStorage.getItem('themeManualOverride');

        // اگر کاربر قبلاً دستی تغییر داده، از تنظیم ذخیره شده استفاده کن
        if (savedOverride === 'true' && savedMode) {
            return savedMode;
        }

        // در غیر این صورت از ساعت سیستم استفاده کن
        return getTimeBasedTheme();
    });

    // 2. مدیریت رنگ تم (Color Palette) - پیش‌فرض: آبی
    const [colorTheme, setColorTheme] = useState(localStorage.getItem('colorTheme') || 'blue');

    // اعمال کلاس dark به html
    useEffect(() => {
        const root = window.document.documentElement;
        if (mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    // بررسی خودکار تغییر تم بر اساس ساعت (هر دقیقه یک بار)
    useEffect(() => {
        // اگر کاربر دستی تغییر داده، این بررسی را انجام نده
        if (isManualOverride) return;

        const checkTimeBasedTheme = () => {
            const timeBasedTheme = getTimeBasedTheme();
            if (timeBasedTheme !== mode) {
                setMode(timeBasedTheme);
            }
        };

        // بررسی فوری
        checkTimeBasedTheme();

        // بررسی هر دقیقه
        const interval = setInterval(checkTimeBasedTheme, 60000);

        return () => clearInterval(interval);
    }, [mode, isManualOverride]);

    // اعمال اتریبیوت data-theme-color به html (برای تغییر رنگ‌ها)
    useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute('data-theme-color', colorTheme);
        localStorage.setItem('colorTheme', colorTheme);
    }, [colorTheme]);

    const toggleMode = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);

        // علامت‌گذاری که کاربر دستی تغییر داده
        setIsManualOverride(true);
        localStorage.setItem('themeManualOverride', 'true');
    };

    // تابع بازگشت به حالت خودکار
    const resetToAutoMode = () => {
        setIsManualOverride(false);
        localStorage.setItem('themeManualOverride', 'false');
        setMode(getTimeBasedTheme());
    };

    return (
        <ThemeContext.Provider value={{
            mode,
            toggleMode,
            colorTheme,
            setColorTheme,
            isManualOverride,
            resetToAutoMode
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};