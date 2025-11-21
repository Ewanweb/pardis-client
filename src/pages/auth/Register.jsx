import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import { Button } from '../../components/UI';

// ✅ اصلاح ۱: کامپوننت InputField را به بیرون از Register آوردیم
const InputField = ({ label, icon: Icon, value, onChange, ...props }) => (
    <div className="group">
        <label className="block text-sm font-bold text-slate-700 mb-1.5 group-focus-within:text-indigo-600 transition-colors">
            {label}
        </label>
        <div className="relative">
            <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
                className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                value={value}      // ✅ مقدار ولیو اضافه شد (Controlled Input)
                onChange={onChange} // ✅ هندلر تغییر اضافه شد
                {...props}
            />
        </div>
    </div>
);

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        password_confirmation: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    // هندلر عمومی برای تغییر فیلدها
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            // هندل کردن ارورهای ولیدیشن لاراول (آرایه) یا ارور عمومی
            const msg = err.response?.data?.message || 'خطایی رخ داد.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="ساخت حساب جدید 🚀" subtitle="به جمع دانشجویان آکادمی بپیوندید">
            {error && (
                <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="نام کامل"
                        icon={User}
                        type="text"
                        name="name"  // ✅ نام فیلد برای هندل کردن اتوماتیک
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <InputField
                        label="موبایل"
                        icon={Phone}
                        type="text"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                    />
                </div>

                <InputField
                    label="ایمیل"
                    icon={Mail}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
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
                    />
                    <InputField
                        label="تکرار رمز"
                        icon={Lock}
                        type="password"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        required
                    />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : 'تکمیل ثبت نام'}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">
                    قبلاً ثبت نام کرده‌اید؟
                    <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-800 mr-1">وارد شوید</Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default Register;