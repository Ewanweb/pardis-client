import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

export const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
            fetchUser();
        } else {
            delete api.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await api.get('/user');
            // ✅ اصلاح شد: اگر از ریسورس لاراول استفاده میکنید، دیتا داخل data است
            // ما چک میکنیم اگر response.data.data بود آن را بردار، اگر نه خود response.data
            const userData = response.data.data ? response.data.data : response.data;
            setUser(userData);
        } catch (error) {
            console.error("Error fetching user", error);
            // اگر توکن منقضی شده بود، خروج بزن
            if (error.response && error.response.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const receivedToken = response.data.data.token;
        const receivedUser = response.data.data.user;

        setToken(receivedToken);
        setUser(receivedUser);

        // ذخیره فوری در لوکال استوریج برای جلوگیری از پرش
        localStorage.setItem('token', receivedToken);

        return response;
    };

    const register = async (data) => {
        const response = await api.post('/auth/register', data);
        const receivedToken = response.data.data.token;
        const receivedUser = response.data.data.user;

        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('token', receivedToken);

        return response;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    const hasRole = (rolesToCheck) => {
        if (!user || !user.roles) return false;
        // اگر ورودی یک رشته تکی بود
        if (typeof rolesToCheck === 'string') {
            return user.roles.includes(rolesToCheck);
        }
        // اگر ورودی آرایه بود (مثلا ['Admin', 'Manager'])
        return rolesToCheck.some(role => user.roles.includes(role));
    };
    return (
        // hasRole را به ولیو اضافه کنید
        <AuthContext.Provider value={{ user, token, login, register, logout, loading, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);