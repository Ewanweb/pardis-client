import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { apiClient } from '../services/api';
import { getImageUrl, formatPrice } from '../services/Libs';
import { Button } from '../components/UI';
import { useAlert } from '../hooks/useAlert';
import { useAuth } from '../context/AuthContext';
import { CartValidationService } from '../services/cartValidation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Seo from '../components/Seo';

const Cart = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const alert = useAlert();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState(null);
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchCart();
    }, [user, navigate]);

    const fetchCart = async () => {
        try {
            const result = await apiClient.get('/me/cart', {
                showErrorAlert: false
            });

            if (result.success) {
                setCart(result.data);
            } else {
                setCart(null);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            setCart(null);
        } finally {
            setLoading(false);
        }
    };

    const removeCourse = async (courseId) => {
        setRemoving(courseId);
        try {
            const result = await apiClient.delete(`/me/cart/items/${courseId}`, {
                successMessage: 'دوره از سبد خرید حذف شد'
            });

            if (result.success) {
                await fetchCart(); // Refresh cart
            }
        } catch (error) {
            console.error('Error removing course:', error);
        } finally {
            setRemoving(null);
        }
    };

    const clearCart = async () => {
        if (!confirm('آیا مطمئن هستید که می‌خواهید سبد خرید را خالی کنید؟')) {
            return;
        }

        setClearing(true);
        try {
            const result = await apiClient.delete('/me/cart', {
                successMessage: 'سبد خرید پاک شد'
            });

            if (result.success) {
                await fetchCart(); // Refresh cart
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
        } finally {
            setClearing(false);
        }
    };

    const proceedToCheckout = () => {
        // Validate cart before proceeding
        const validation = CartValidationService.validateCartForCheckout(cart);

        if (!validation.isValid) {
            const firstError = validation.errors[0];
            alert.showError(firstError.message);
            return;
        }

        // Show warnings if any
        if (validation.warnings.length > 0) {
            validation.warnings.forEach(warning => {
                alert.showWarning(warning.message);
            });
        }

        navigate('/checkout-cart', { state: { cart } });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20 bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">در حال بارگذاری سبد خرید...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans bg-white dark:bg-slate-950 text-text-primary dark:text-slate-100 transition-colors duration-300" dir="rtl">
            <Navbar />
            <div className="pt-28 pb-20 bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
                <Seo
                    title="سبد خرید"
                    description="مشاهده و مدیریت دوره‌های انتخابی در سبد خرید آکادمی پردیس توس"
                    noIndex
                />

                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                                <ShoppingCart size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-800 dark:text-white">سبد خرید</h1>
                                <p className="text-slate-500 dark:text-slate-400">
                                    {cart && cart.itemCount > 0 ? `${cart.itemCount} دوره انتخاب شده` : 'سبد خرید خالی است'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Empty Cart */}
                    {!cart || cart.itemCount === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                                <ShoppingCart size={48} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">سبد خرید شما خالی است</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                                هنوز هیچ دوره‌ای به سبد خرید اضافه نکرده‌اید. دوره‌های مورد علاقه خود را انتخاب کنید.
                            </p>
                            <Button onClick={() => navigate('/')} variant="primary">
                                مشاهده دوره‌ها
                            </Button>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Expiry Warning */}
                                {cart.isExpired && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                        <p className="text-red-700 dark:text-red-300 text-sm">
                                            ⚠️ سبد خرید شما منقضی شده است. لطفاً دوره‌ها را مجدداً اضافه کنید.
                                        </p>
                                    </div>
                                )}

                                {/* Cart Header */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                            دوره‌های انتخابی ({cart.itemCount})
                                        </h2>
                                        <Button
                                            onClick={clearCart}
                                            disabled={clearing}
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                            {clearing ? 'در حال پاک کردن...' : 'پاک کردن همه'}
                                        </Button>
                                    </div>

                                    {/* Cart Items List */}
                                    <div className="space-y-4">
                                        {cart.items.map((item) => (
                                            <div key={item.id} className="flex gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                                                {/* Course Image */}
                                                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                                                    <img
                                                        src={getImageUrl(item.thumbnail || '/images/default-course-thumbnail.jpg')}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = "/images/default-course-thumbnail.jpg";
                                                            // If default also fails, use placeholder
                                                            e.target.onerror = () => {
                                                                e.target.src = "https://placehold.co/400x300/1e1b4b/FFF?text=Course";
                                                            };
                                                        }}
                                                    />
                                                </div>

                                                {/* Course Info */}
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-slate-800 dark:text-white mb-1 line-clamp-2">
                                                        {item.title}
                                                    </h3>
                                                    {item.instructor && item.instructor !== 'نامشخص' && (
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                                            مدرس: {item.instructor}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-slate-400">
                                                        اضافه شده در: {new Date(item.addedAt).toLocaleDateString('fa-IR')}
                                                    </p>
                                                </div>

                                                {/* Price & Actions */}
                                                <div className="text-left">
                                                    <div className="mb-3">
                                                        {item.unitPrice === 0 ? (
                                                            <span className="text-emerald-500 font-bold">رایگان</span>
                                                        ) : (
                                                            <span className="text-slate-800 dark:text-white font-bold">
                                                                {formatPrice(item.unitPrice)} تومان
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Button
                                                        onClick={() => removeCourse(item.courseId)}
                                                        disabled={removing === item.courseId}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                                    >
                                                        {removing === item.courseId ? (
                                                            <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin"></div>
                                                        ) : (
                                                            <Trash2 size={16} />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Cart Summary */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-28 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">خلاصه سفارش</h3>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                                            <span>تعداد دوره‌ها</span>
                                            <span>{cart.itemCount}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                                            <span>مبلغ کل</span>
                                            <span>{formatPrice(cart.totalAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                                            <span>تخفیف</span>
                                            <span>۰ تومان</span>
                                        </div>
                                        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between font-bold text-lg text-slate-800 dark:text-white">
                                            <span>مجموع</span>
                                            <span className="text-indigo-600 dark:text-indigo-400">
                                                {formatPrice(cart.totalAmount)} تومان
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl mb-6">
                                        <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed flex items-start gap-2">
                                            <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                                            خرید شما شامل ضمانت بازگشت وجه ۷ روزه و پشتیبانی دائمی می‌باشد.
                                        </p>
                                    </div>

                                    <Button
                                        onClick={proceedToCheckout}
                                        disabled={cart.isExpired}
                                        className="w-full !py-3.5 !rounded-xl shadow-xl shadow-indigo-500/20"
                                    >
                                        <CreditCard size={18} className="ml-2" />
                                        ادامه خرید
                                    </Button>

                                    {cart.expiresAt && (
                                        <p className="text-xs text-slate-400 text-center mt-3">
                                            انقضای سبد: {new Date(cart.expiresAt).toLocaleDateString('fa-IR')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Cart;