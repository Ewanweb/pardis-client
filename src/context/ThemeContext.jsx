import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // 1. مدیریت حالت تاریک و روشن (Dark/Light Mode)
    const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'dark');

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

    // اعمال اتریبیوت data-theme-color به html (برای تغییر رنگ‌ها)
    useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute('data-theme-color', colorTheme);
        localStorage.setItem('colorTheme', colorTheme);
    }, [colorTheme]);

    const toggleMode = () => {
        setMode(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ mode, toggleMode, colorTheme, setColorTheme }}>
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