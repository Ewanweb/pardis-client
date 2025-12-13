import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RequireRole = ({ allowedRoles, children }) => {
    const { user, loading, hasRole } = useAuth();
    const token = localStorage.getItem('token');

    // صبر کن تا اطلاعات بیاید
    if (loading || (token && !user)) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // اگر نقش مجاز را ندارد -> برو به داشبورد (یا هر جای امن دیگر)
    if (!hasRole(allowedRoles)) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default RequireRole;