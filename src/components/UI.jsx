import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', icon: Icon, ...props }) => {
    const baseStyle = "relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95";

    const variants = {
        // ✅ تغییر رنگ‌ها به primary
        primary: "bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-hover hover:shadow-primary/40",

        secondary: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary/30 hover:bg-primary-light/10 shadow-sm hover:shadow-md",

        ghost: "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white hover:bg-primary-light/10",

        outline: "border-2 border-primary-light text-primary hover:bg-primary-light/10"
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {children}
            {Icon && <Icon size={18} strokeWidth={2.5} />}
        </button>
    );
};

export const Badge = ({ children, color = 'indigo' }) => {
    // نگاشت رنگ‌های ورودی به کلاس‌های تیلویند
    const colorClasses = {
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        red: 'bg-red-50 text-red-600 border-red-100',
        primary: 'bg-primary-light/20 text-primary border-primary-light/30',
    };

    const selectedColor = colorClasses[color] || colorClasses.indigo;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${selectedColor}`}>
            {children}
        </span>
    );
};