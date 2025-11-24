import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import { Button } from '../../components/UI';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. دریافت پاسخ مستقیم از سرور
            const res = await login(email, password);

            // 2. استخراج نقش‌ها مستقیماً از پاسخ (بدون انتظار برای آپدیت کانتکست)
            // ساختار پاسخ شما: { data: { data: { user: { roles: [...] } } } }
            const userData = res.data?.data?.user || {};
            const roles = userData.roles || [];

            // 3. منطق ریدایرکت آنی
            if (roles.includes('Admin') || roles.includes('Manager') || roles.includes('Instructor')) {
                // اگر مدیر یا مدرس است -> پنل ادمین
                navigate('/admin', { replace: true });
            } else {
                // اگر کاربر عادی است -> صفحه اصلی
                navigate('/', { replace: true });
            }

        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || 'اطلاعات ورود اشتباه است.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="خوش‌آمدید 👋" subtitle="برای دسترسی به حساب خود وارد شوید">
            {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 border border-red-100 animate-shake">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>{error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="group">
                    <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-indigo-600 transition-colors">ایمیل</label>
                    <div className="relative">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="email"
                            className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="group">
                    <label className="block text-sm font-bold text-slate-700 mb-2">رمز عبور</label>
                    <div className="relative">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="password"
                            className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <Button type="submit" className="w-full !py-4 !text-base shadow-xl shadow-indigo-500/20" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : 'ورود به حساب'}
                </Button>
            </form>
        </AuthLayout>
    );
};

export default Login;