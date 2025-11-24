import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RequireAdmin = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const token = localStorage.getItem('token');

    console.log("🛡️ RequireAdmin Check:", { loading, hasToken: !!token, user: user?.name, roles: user?.roles });

    // 1. حالت لودینگ: اگر توکن داریم اما یوزر هنوز لود نشده، صبر کن
    if (loading || (token && !user)) {
        return (
            <div className="h-screen flex flex-col gap-4 items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <span className="text-slate-500 text-sm font-medium animate-pulse">در حال بررسی دسترسی...</span>
            </div>
        );
    }

    // 2. اگر کلا یوزر نیست (و لودینگ هم تمام شده) -> برو به لاگین
    if (!user) {
        console.warn("⛔ Access Denied: No User Found");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. بررسی نقش (بدون حساسیت به حروف بزرگ و کوچک)
    const userRoles = user.roles || [];
    const lowerRoles = userRoles.map(r => r.toLowerCase());
    const allowed = ['admin', 'manager', 'instructor'];

    const isAdmin = lowerRoles.some(r => allowed.includes(r));

    if (isAdmin) {
        return children;
    } else {
        console.warn("⛔ Access Denied: User is not Admin", userRoles);
        return <Navigate to="/" replace />;
    }
};

export default RequireAdmin;