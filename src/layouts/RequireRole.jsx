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
            <div className="h-screen flex items-center justify-center bg-slate-50/50">
                <Loader2 className="animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    // اگر نقش مجاز را ندارد -> برو به داشبورد (یا هر جای امن دیگر)
    if (!hasRole(allowedRoles)) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default RequireRole;