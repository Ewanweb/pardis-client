import { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Set header immediately when component loads
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                localStorage.setItem('token', token);

                // Only fetch user if we don't have it
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
    }, [token]);

    const fetchUser = useCallback(async () => {
        try {
            // ✅ OPTIMIZATION: Only fetch minimal user data for auth
            const response = await api.get('/user');
            const userData = response.data.data ? response.data.data : response.data;

            // Only store essential user data for initial auth
            const minimalUser = {
                id: userData.id,
                fullName: userData.fullName,
                email: userData.email,
                mobile: userData.mobile,
                roles: userData.roles,
                avatarUrl: userData.avatarUrl ? `${userData.avatarUrl}?v=${userData.avatarUpdatedAt || Date.now()}` : null
            };

            setUser(minimalUser);
        } catch (error) {
            console.error("Error fetching user", error);
            if (error.response && error.response.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const hasRole = useCallback((rolesToCheck) => {
        if (!user || !user.roles) return false;

        const userRoles = user.roles.map(r => String(r).toLowerCase());

        if (typeof rolesToCheck === 'string') {
            return userRoles.includes(rolesToCheck.toLowerCase());
        }

        if (Array.isArray(rolesToCheck)) {
            const checkRoles = rolesToCheck.map(r => r.toLowerCase());
            return checkRoles.some(role => userRoles.includes(role));
        }

        return false;
    }, [user]);

    const login = useCallback(async (mobile, password) => {
        const response = await api.post('/auth/login', { mobile, password });

        const receivedToken = response.data.data?.token || response.data.token;
        const receivedUser = response.data.data?.user || response.data.user;

        localStorage.setItem('token', receivedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;

        setToken(receivedToken);
        setUser(receivedUser);

        return response;
    }, []);

    const register = useCallback(async (data) => {
        const response = await api.post('/auth/register', data);

        const receivedToken = response.data.data?.token || response.data.token;
        const receivedUser = response.data.data?.user || response.data.user;

        localStorage.setItem('token', receivedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;

        setToken(receivedToken);
        setUser(receivedUser);

        return response;
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
    }, []);

    const value = useMemo(() => ({
        user,
        token,
        login,
        register,
        logout,
        loading,
        hasRole,
        fetchUser
    }), [user, token, login, register, logout, loading, hasRole, fetchUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);