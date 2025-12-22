import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Lock, Loader2, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import { Button } from '../../components/UI';
import SeoHead from '../../components/Seo/SeoHead';

// ✅ اصلاح InputField: بیرون از کامپوننت اصلی تعریف شد تا مشکل پرش فوکوس حل شود
// همچنین کلاس‌های دارک مود و استایل‌های جدید اضافه شدند
const InputField = ({ label, icon: Icon, value, onChange, className, ...props }) => (
    <div className="group">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-primary dark:group-focus-within:text-primary-light transition-colors">
            {label}
        </label>
        <div className="relative">
            <Icon
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-primary-light transition-colors"
                size={20}
            />
            <input
                className={`w-full pr-12 pl-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary-light/10 focus:border-primary dark:focus:border-primary-light outline-none transition-all font-medium text-sm ${className || ''}`}
                value={value}
                onChange={onChange}
                {...props}
            />
        </div>
    </div>
);

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '', // هماهنگ با بک‌اند لاراول
        email: '',
        mobile: '',
        password: '',
        password_confirmation: ''
    });

    const [errorList, setErrorList] = useState([]);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorList([]);

        if (formData.password !== formData.password_confirmation) {
            setErrorList(["رمز عبور و تکرار آن مطابقت ندارند."]);
            return;
        }

        setLoading(true);
        try {
            await register(formData);
            // پس از ثبت نام موفق، به صفحه اصلی هدایت می‌شود
            navigate('/', { replace: true });
        } catch (err) {
            console.error("Registration Error:", err);

            if (err.response && err.response.status === 422) {
                const data = err.response.data;
                if (data.errors) {
                    const messages = Object.values(data.errors).flat().map(String);
                    setErrorList(messages);
                } else if (data.message) {
                    setErrorList([String(data.message)]);
                }
            } else if (err.response && err.response.status === 400) {
                setErrorList([err.response.data.message || "اطلاعات وارد شده صحیح نمی‌باشد."]);
            } else {
                setErrorList(["خطایی در برقراری ارتباط با سرور رخ داد."]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SeoHead
                title="ثبت‌نام در آکادمی پردیس توس"
                description="برای دسترسی به دوره‌ها و مسیرهای یادگیری، حساب کاربری خود را بسازید."
                noIndex
                noFollow
            />
            <AuthLayout title="ساخت حساب جدید 🚀" subtitle="به جمع دانشجویان آکادمی بپیوندید">

            {/* نمایش خطاها */}
            {errorList.length > 0 && (
                <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 relative overflow-hidden">
                        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                        <div className="flex items-start gap-3 pr-2">
                            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600 dark:text-red-400 mt-0.5 shrink-0">
                                <AlertCircle size={18} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-red-800 dark:text-red-200 mb-1">لطفاً موارد زیر را بررسی کنید:</h4>
                                <ul className="space-y-1">
                                    {errorList.map((err, index) => (
                                        <li key={index} className="text-xs font-medium text-red-600 dark:text-red-300 flex items-center gap-1.5">
                                            <span className="w-1 h-1 rounded-full bg-red-400 inline-block"></span>
                                            {String(err)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button onClick={() => setErrorList([])} className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="نام کامل"
                        icon={User}
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="مثال: علی علوی"
                        required
                    />
                    <InputField
                        label="موبایل"
                        icon={Phone}
                        type="text"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="0912..."
                        dir="ltr"
                        className="text-left font-sans"
                    />
                </div>

                <InputField
                    label="ایمیل"
                    icon={Mail}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@mail.com"
                    required
                    dir="ltr"
                    className="text-left font-sans"
                />

                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="رمز عبور"
                        icon={Lock}
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        dir="ltr"
                        className="text-left font-sans"
                    />
                    <InputField
                        label="تکرار رمز"
                        icon={Lock}
                        type="password"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        required
                        dir="ltr"
                        className="text-left font-sans"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full mt-4 !py-3.5 !text-base !rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={20} />
                            در حال ثبت نام...
                        </span>
                    ) : (
                        'ساخت حساب کاربری'
                    )}
                </Button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    قبلاً ثبت نام کرده‌اید؟
                    <Link to="/login" className="text-primary dark:text-primary-light font-bold hover:underline mr-1 transition-all">
                        وارد شوید
                    </Link>
                </p>
            </div>
            </AuthLayout>
        </>
    );
};

export default Register;
