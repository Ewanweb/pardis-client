import React, { createContext, useState, useContext, useEffect } from 'react';
// ✅ مسیر صحیح فایل سرویس (بر اساس ساختار پوشه‌بندی شما)
import { api } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // 1. تنظیم هدر به محض لود شدن کامپوننت (جلوگیری از تاخیر اولیه)
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                // تنظیم مجدد هدر برای اطمینان
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                localStorage.setItem('token', token);

                // ✅ اصلاح حیاتی: اگر یوزر قبلاً ست شده (مثلاً بلافاصله بعد از لاگین)، دوباره درخواست نده
                // این خط جلوی آن ارور ۴۰۱ تکراری را می‌گیرد
                if (!user) {
                    await fetchUser();
                } else {
                    setLoading(false);
                }
            } else {
                delete api.defaults.headers.common['Authorization'];
                localStorage.removeItem('token');
                setUser(null);
                setLoading(false);
            }
        };

        initAuth();
    }, [token]); // فقط وقتی توکن عوض شد اجرا شو

    const fetchUser = async () => {
        try {
            const response = await api.get('/user');
            // هندل کردن ساختار ریسورس لاراول (data.data یا data)
            const userData = response.data.data ? response.data.data : response.data;
            setUser(userData);
        } catch (error) {
            console.error("Error fetching user", error);
            // فقط اگر واقعا 401 شد (توکن نامعتبر) خروج بزن
            if (error.response && error.response.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    // ✅ تابع هوشمند بررسی نقش (بدون حساسیت به حروف بزرگ و کوچک)
    const hasRole = (rolesToCheck) => {
        if (!user || !user.roles) return false;

        // نرمال‌سازی نقش‌های کاربر به حروف کوچک
        const userRoles = user.roles.map(r => String(r).toLowerCase());

        if (typeof rolesToCheck === 'string') {
            return userRoles.includes(rolesToCheck.toLowerCase());
        }

        if (Array.isArray(rolesToCheck)) {
            const checkRoles = rolesToCheck.map(r => r.toLowerCase());
            return checkRoles.some(role => userRoles.includes(role));
        }

        return false;
    };

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });

        // استخراج دقیق دیتا از پاسخ سرور
        const receivedToken = response.data.data?.token || response.data.token;
        const receivedUser = response.data.data?.user || response.data.user;

        // 1. اول توکن را در لوکال استوریج و هدر ذخیره کن
        localStorage.setItem('token', receivedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;

        // 2. بعد استیت‌ها را آپدیت کن (این باعث می‌شود useEffect اجرا شود، اما چون یوزر داریم دوباره درخواست نمی‌دهد)
        setToken(receivedToken);
        setUser(receivedUser);

        return response;
    };

    const register = async (data) => {
        const response = await api.post('/auth/register', data);

        const receivedToken = response.data.data?.token || response.data.token;
        const receivedUser = response.data.data?.user || response.data.user;

        localStorage.setItem('token', receivedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;

        setToken(receivedToken);
        setUser(receivedUser);

        return response;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

// خط زیر برای رفع ارور ESLint Fast Refresh ضروری است
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);