import React from 'react';

const LoadingSpinner = ({ message = 'در حال بارگذاری...', size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="text-center">
                <div className={`${sizeClasses[size]} border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4`}></div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">{message}</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;