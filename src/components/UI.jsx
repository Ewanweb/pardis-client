import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', icon: Icon, ...props }) => {
    const baseStyle = "relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95";
    const variants = {
        primary: "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 shadow-sm hover:shadow-md",
        ghost: "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50",
        outline: "border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50"
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {children}
            {Icon && <Icon size={18} strokeWidth={2.5} />}
        </button>
    );
};

export const Badge = ({ children, color = 'indigo' }) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-${color}-50 text-${color}-600 border border-${color}-100`}>
        {children}
    </span>
);