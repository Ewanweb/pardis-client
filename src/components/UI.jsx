import React from 'react';

export const Button = ({ children, variant = 'primary', size = 'md', className = '', icon: Icon, ...props }) => {
    const baseStyle = "relative inline-flex items-center justify-center gap-2 font-bold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/20";

    const sizes = {
        sm: "px-3 py-2 text-sm rounded-lg",
        md: "px-6 py-3 text-base rounded-xl",
        lg: "px-8 py-4 text-lg rounded-2xl"
    };

    const variants = {
        primary: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:from-indigo-700 hover:to-purple-700 border border-indigo-500/20",

        secondary: "bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-600/50 hover:border-indigo-300 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 backdrop-blur-sm",

        ghost: "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-slate-800 dark:hover:to-slate-700 rounded-xl",

        outline: "border-2 border-indigo-200 dark:border-indigo-400/30 text-indigo-600 dark:text-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 hover:border-indigo-300 dark:hover:border-indigo-300",

        danger: "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:from-red-600 hover:to-pink-700 border border-red-400/20",

        success: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-700 border border-emerald-400/20"
    };

    return (
        <button className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
            {children}
            {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} strokeWidth={2.5} />}
        </button>
    );
};

export const Badge = ({ children, color = 'indigo', size = 'md' }) => {
    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm'
    };

    const colorClasses = {
        indigo: 'bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-700/50 shadow-sm',
        emerald: 'bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/50 shadow-sm',
        amber: 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/50 shadow-sm',
        red: 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 text-red-700 dark:text-red-300 border border-red-200/50 dark:border-red-700/50 shadow-sm',
        purple: 'bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-700/50 shadow-sm',
        blue: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50 shadow-sm',
        slate: 'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-600/50 shadow-sm'
    };

    const selectedColor = colorClasses[color] || colorClasses.indigo;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold backdrop-blur-sm ${sizes[size]} ${selectedColor}`}>
            {children}
        </span>
    );
};

// کامپوننت کارت بهبود یافته
export const Card = ({ children, className = '', hover = true, gradient = false }) => {
    const baseStyle = "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm backdrop-blur-sm";
    const hoverStyle = hover ? "hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 hover:-translate-y-1 transition-all duration-300" : "";
    const gradientStyle = gradient ? "bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800" : "";

    return (
        <div className={`${baseStyle} ${hoverStyle} ${gradientStyle} ${className}`}>
            {children}
        </div>
    );
};

// کامپوننت Input بهبود یافته
export const Input = ({ label, error, className = '', ...props }) => {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-300 dark:focus:border-indigo-500 transition-all duration-300 backdrop-blur-sm ${error ? 'border-red-300 dark:border-red-600' : ''} ${className}`}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            )}
        </div>
    );
};