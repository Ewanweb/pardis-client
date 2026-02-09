import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import { Button } from '../../components/UI';
import SeoHead from '../../components/Seo/SeoHead';

const Login = () => {
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await login(mobile, password);

            // استخراج دیتا برای تصمیم‌گیری ریدایرکت
            const userData = res.data?.data?.user || res.data?.user || {};
            const roles = userData.roles || [];

            // نرمال‌سازی نقش‌ها (حذف حساسیت به حروف بزرگ و کوچک)
            const lowerRoles = roles.map(r => String(r).toLowerCase());
            const adminRoles = ['admin', 'manager', 'instructor'];
            const isAdmin = lowerRoles.some(r => adminRoles.includes(r));

            // هدایت به صفحه مناسب
            if (isAdmin) {
                navigate('/admin', { replace: true });
            } else {
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
        <>
            <SeoHead
                title="ورود به حساب کاربری | آکادمی پردیس توس"
                description="برای مدیریت دوره‌ها، مشاهده ثبت‌نام‌ها و ادامه یادگیری وارد حساب خود شوید."
                noIndex
                noFollow
            />
            <AuthLayout title="خوش‌آمدید 👋" subtitle="برای دسترسی به حساب خود وارد شوید">
                {error && (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm p-4 rounded-xl mb-6 border border-red-100 dark:border-red-900/50 animate-shake">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>{error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="group">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-primary dark:group-focus-within:text-primary-light transition-colors">شماره تلفن</label>
                        <div className="relative">
                            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-primary-light transition-colors" size={20} />
                            <input
                                type="tel"
                                className="w-full pr-12 pl-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary-light/10 focus:border-primary dark:focus:border-primary-light outline-none transition-all font-medium text-sm text-left font-sans"
                                dir="ltr"
                                placeholder="09123456789"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="group">
                        <div className="flex justify-between mb-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 group-focus-within:text-primary dark:group-focus-within:text-primary-light transition-colors">رمز عبور</label>
                            <a href="#" className="text-xs font-bold text-primary dark:text-primary-light hover:underline">فراموشی رمز؟</a>
                        </div>
                        <div className="relative">
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-primary-light transition-colors" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full pr-12 pl-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary-light/10 focus:border-primary dark:focus:border-primary-light outline-none transition-all font-medium text-sm text-left font-sans"
                                dir="ltr"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full !py-4 !text-base shadow-xl shadow-primary/20" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'ورود به حساب'}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        حساب کاربری ندارید؟
                        <Link to="/register" className="text-primary dark:text-primary-light font-bold hover:underline mr-1 transition-all">
                            ثبت نام کنید
                        </Link>
                    </p>
                </div>
            </AuthLayout>
        </>
    );
};

export default Login;
