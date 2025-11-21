import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
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
            // 1. ارسال درخواست لاگین
            const res = await login(email, password);

            // --- بخش دیباگ (نتیجه را در کنسول مرورگر ببینید) ---
            console.log("پاسخ کامل سرور:", res);
            console.log("دیتای یوزر:", res.data?.data?.user);
            console.log("نقش‌ها:", res.data?.data?.user?.roles);
            // -----------------------------------------------

            // 2. استخراج ایمن نقش‌ها
            // ما چک میکنیم که آیا roles وجود دارد؟ اگر نبود یک آرایه خالی میگذاریم
            const user = res.data?.data?.user || {};
            const roles = user.roles || [];

            // 3. منطق هدایت (Redirect Logic)
            if (roles.includes('Admin') || roles.includes('Manager') || roles.includes('Instructor')) {
                console.log("کاربر ادمین است -> هدایت به پنل");
                navigate('/admin');
            } else {
                console.log("کاربر عادی است -> هدایت به خانه");
                navigate('/');
            }

        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || 'اطلاعات ورود اشتباه است.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="خوش‌آمدید 👋" subtitle="برای دسترسی به دوره‌ها وارد شوید">
            {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 border border-red-100 animate-shake">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    {error}
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
                            placeholder="example@mail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="group">
                    <div className="flex justify-between mb-2">
                        <label className="block text-sm font-bold text-slate-700 group-focus-within:text-indigo-600 transition-colors">رمز عبور</label>
                        <a href="#" className="text-xs font-bold text-indigo-500 hover:text-indigo-700">فراموشی رمز؟</a>
                    </div>
                    <div className="relative">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="password"
                            className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full !py-4 !text-base shadow-xl shadow-indigo-500/20" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-2">ورود به حساب <ArrowLeft size={18} /></span>}
                </Button>
            </form>
            <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm">
                    حساب کاربری ندارید؟
                    <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-800 mr-1 underline decoration-indigo-200 underline-offset-4">ثبت نام کنید</Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default Login;