import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RequireAdmin = ({ children }) => {
    const { user, loading } = useAuth();
    const token = localStorage.getItem('token'); // چک کردن مستقیم توکن

    // حالت لودینگ:
    // 1. سیستم کلا در حال لودینگ است (loading === true)
    // 2. یا سیستم لود شده، ولی توکن داریم اما یوزر هنوز ست نشده (تاخیر کانتکست)
    if (loading || (token && !user)) {
        return (
            <div className="h-screen flex flex-col gap-4 items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <span className="text-slate-500 text-sm font-medium animate-pulse">در حال اعتبارسنجی...</span>
            </div>
        );
    }

    // بررسی نقش‌ها
    const isAdmin = user && (
        user.roles?.includes('Admin') ||
        user.roles?.includes('Manager') ||
        user.roles?.includes('Instructor')
    );

    // اگر ادمین بود بفرما، اگر نبود برو لاگین
    return isAdmin ? children : <Navigate to="/login" replace />;
};

export default RequireAdmin;