import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Lock, Loader2, AlertCircle, X, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import { Button } from '../../components/UI';
import SeoHead from '../../components/Seo/SeoHead';

// کامپوننت نمایش قانون پسورد
const PasswordRule = ({ isValid, text, optional = false }) => (
    <div className="flex items-center gap-2">
        {isValid ? (
            <CheckCircle2 className="text-green-500 dark:text-green-400 flex-shrink-0" size={16} />
        ) : (
            <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 flex-shrink-0" />
        )}
        <span className={`text-xs ${isValid
            ? 'text-green-600 dark:text-green-400 font-medium'
            : optional
                ? 'text-slate-400 dark:text-slate-500'
                : 'text-slate-600 dark:text-slate-400'
            }`}>
            {text}
        </span>
    </div>
);

// ✅ اصلاح InputField: بیرون از کامپوننت اصلی تعریف شد تا مشکل پرش فوکوس حل شود
const InputField = ({ label, icon: Icon, value, onChange, showPasswordToggle, showPassword, onTogglePassword, className, ...props }) => (
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
                className={`w-full pr-12 ${showPasswordToggle ? 'pl-12' : 'pl-4'} py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary-light/10 focus:border-primary dark:focus:border-primary-light outline-none transition-all font-medium text-sm ${className || ''}`}
                value={value}
                onChange={onChange}
                {...props}
            />
            {showPasswordToggle && (
                <button
                    type="button"
                    onClick={onTogglePassword}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            )}
        </div>
    </div>
);

// تابع اعتبارسنجی پسورد
const validatePassword = (password) => {
    const rules = {
        minLength: password.length >= 6,
        hasLetter: /[a-zA-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
    };

    return {
        ...rules,
        isValid: rules.minLength && rules.hasLetter && rules.hasNumber,
        strength: Object.values(rules).filter(Boolean).length
    };
};

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        mobile: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errorList, setErrorList] = useState([]);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    // اعتبارسنجی پسورد
    const passwordValidation = useMemo(() => {
        if (!formData.password) return null;
        return validatePassword(formData.password);
    }, [formData.password]);

    // بررسی اینکه آیا فرم معتبر است
    const isFormValid = useMemo(() => {
        return (
            formData.fullName.trim() &&
            formData.mobile.trim() &&
            passwordValidation?.isValid
        );
    }, [formData.fullName, formData.mobile, passwordValidation]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // پاک کردن خطاها هنگام تغییر
        if (errorList.length > 0) {
            setErrorList([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorList([]);

        // بررسی اعتبارسنجی سمت کلاینت
        if (!isFormValid) {
            setErrorList(["لطفاً تمام فیلدها را به درستی پر کنید و پسورد قوی انتخاب کنید."]);
            return;
        }

        // بررسی مجدد اعتبارسنجی پسورد
        if (!passwordValidation?.isValid) {
            setErrorList(["پسورد انتخابی ضعیف است. لطفاً قوانین پسورد را رعایت کنید."]);
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
                title="ثبت نام - آکادمی پردیس توس"
                description="در آکادمی پردیس توس ثبت نام کنید و به دوره‌های آموزشی متنوع دسترسی پیدا کنید"
                noIndex
                noFollow
            />
            <AuthLayout title="خوش‌آمدید 🎓" subtitle="حساب کاربری جدید ایجاد کنید">
                {/* نمایش خطاها */}
                {errorList.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" size={20} />
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                                    خطا در ثبت نام
                                </h3>
                                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                                    {errorList.map((error, index) => (
                                        <li key={index}>• {error}</li>
                                    ))}
                                </ul>
                            </div>
                            <button
                                onClick={() => setErrorList([])}
                                className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField
                        label="نام کامل"
                        icon={User}
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="نام و نام خانوادگی خود را وارد کنید"
                        required
                        disabled={loading}
                    />

                    <InputField
                        label="شماره تلفن"
                        icon={Phone}
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="09123456789"
                        required
                        disabled={loading}
                        dir="ltr"
                        className="text-left font-sans"
                    />

                    <div>
                        <InputField
                            label="رمز عبور"
                            icon={Lock}
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="رمز عبور قوی انتخاب کنید"
                            required
                            disabled={loading}
                            dir="ltr"
                            className={`text-left font-sans ${passwordValidation && !passwordValidation.isValid ? 'border-red-300 dark:border-red-700' : ''}`}
                            showPasswordToggle={true}
                            showPassword={showPassword}
                            onTogglePassword={() => setShowPassword(!showPassword)}
                        />

                        {/* نمایش قوانین پسورد */}
                        {formData.password && (
                            <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                    قوانین پسورد:
                                </p>
                                <div className="space-y-2">
                                    <PasswordRule
                                        isValid={passwordValidation?.minLength}
                                        text="حداقل 6 کاراکتر"
                                    />
                                    <PasswordRule
                                        isValid={passwordValidation?.hasLetter}
                                        text="حداقل یک حرف انگلیسی"
                                    />
                                    <PasswordRule
                                        isValid={passwordValidation?.hasNumber}
                                        text="حداقل یک عدد"
                                    />
                                    <PasswordRule
                                        isValid={passwordValidation?.hasUpperCase}
                                        text="حداقل یک حرف بزرگ (اختیاری)"
                                        optional
                                    />
                                    <PasswordRule
                                        isValid={passwordValidation?.hasLowerCase}
                                        text="حداقل یک حرف کوچک (اختیاری)"
                                        optional
                                    />
                                </div>

                                {/* نمایش قدرت پسورد */}
                                {passwordValidation && (
                                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-slate-600 dark:text-slate-400">قدرت پسورد:</span>
                                            <span className={`text-xs font-semibold ${passwordValidation.strength <= 2 ? 'text-red-500' :
                                                passwordValidation.strength <= 3 ? 'text-yellow-500' :
                                                    passwordValidation.strength <= 4 ? 'text-blue-500' : 'text-green-500'
                                                }`}>
                                                {passwordValidation.strength <= 2 ? 'ضعیف' :
                                                    passwordValidation.strength <= 3 ? 'متوسط' :
                                                        passwordValidation.strength <= 4 ? 'خوب' : 'قوی'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                            <div
                                                className={`h-1.5 rounded-full transition-all ${passwordValidation.strength <= 2 ? 'bg-red-500' :
                                                    passwordValidation.strength <= 3 ? 'bg-yellow-500' :
                                                        passwordValidation.strength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${(passwordValidation.strength / 5) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || !isFormValid}
                        className="w-full py-3.5 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin" size={20} />
                                در حال ثبت نام...
                            </div>
                        ) : (
                            'ثبت نام'
                        )}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-600 dark:text-slate-400">
                        قبلاً حساب کاربری دارید؟{' '}
                        <Link
                            to="/login"
                            className="text-primary dark:text-primary-light font-semibold hover:underline transition-colors"
                        >
                            وارد شوید
                        </Link>
                    </p>
                </div>
            </AuthLayout>
        </>
    );
};

export default Register;