import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RequireRole = ({ allowedRoles, children }) => {
    const { user, loading, hasRole } = useAuth();
    const token = localStorage.getItem('token');

    if (loading || (token && !user)) {
        return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
    }

    // اگر کاربر اصلاً نقش ندارد یا لاگین نیست -> لاگین
    if (!user) return <Navigate to="/login" replace />;

    // اگر کاربر لاگین است اما نقشش مجاز نیست -> صفحه اصلی (یا 403)
    if (!hasRole(allowedRoles)) {
        return <Navigate to="/admin" replace />; // یا یک صفحه Access Denied
    }

    return children;
};
export default RequireRole;