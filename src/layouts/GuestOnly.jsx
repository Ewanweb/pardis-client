import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GuestOnly = ({ children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // اگر کاربر لاگین کرده باشد، به صفحه اصلی هدایت شود
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    // اگر کاربر لاگین کرده، چیزی نمایش نده
    if (user) {
        return null;
    }

    // اگر کاربر لاگین نکرده، صفحه auth را نمایش بده
    return children;
};

export default GuestOnly;