import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Receipt, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { apiClient } from '../services/api';
import { getImageUrl, formatPrice } from '../services/Libs';
import { Button } from '../components/UI';
import { useAlert } from '../hooks/useAlert';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Seo from '../components/Seo';
import ContractModal from '../components/ContractModal';

const CheckoutCart = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { user } = useAuth();
    const alert = useAlert();

    const [cart, setCart] = useState(state?.cart || null);
    const [step, setStep] = useState(1); // 1: Review, 2: Success
    const [isProcessing, setIsProcessing] = useState(false);
    const [order, setOrder] = useState(null);
    const [showContractModal, setShowContractModal] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!cart) {
            navigate('/cart');
            return;
        }

        if (cart.isExpired) {
            alert.showError('سبد خرید منقضی شده است');
            navigate('/cart');
            return;
        }
    }, [user, cart, navigate, alert]);

    const handleCheckout = async () => {
        if (!cart || cart.itemCount === 0) {
            alert.showError('سبد خرید خالی است');
            return;
        }

        setIsProcessing(true);
        try {
            const result = await apiClient.post('/me/checkout', {
                notes: null
            });

            if (result.success) {
                setOrder(result.data);

                if (result.data.isFreePurchase) {
                    // Free purchase completed immediately
                    setStep(2);
                    alert.showSuccess('خرید رایگان با موفقیت تکمیل شد! 🎉');
                } else {
                    // Manual payment - redirect to receipt upload
                    navigate(`/payment/manual/${result.data.paymentAttemptId}`, {
                        state: {
                            paymentAttempt: result.data,
                            order: result.data
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert.showError('خطا در تکمیل خرید');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleContractAccept = () => {
        setShowContractModal(false);
        handleCheckout();
    };

    const handleContractReject = () => {
        setShowContractModal(false);
    };

    if (!cart) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20 bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <p className="text-slate-600 dark:text-slate-400">در حال هدایت به سبد خرید...</p>
                </div>
            </div>
        );
    }

    const totalAmount = cart.totalAmount;

    return (
        <div className="min-h-screen font-sans bg-white dark:bg-slate-950 text-text-primary dark:text-slate-100 transition-colors duration-300" dir="rtl">
            <Navbar />
            <div className="pt-28 pb-20 bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
                <Seo
                    title="تکمیل خرید"
                    description="تکمیل خرید دوره‌های آموزشی"
                />

                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Cart Review */}
                            {step === 1 && (
                                <div className="space-y-8">
                                    {/* Cart Items */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                            <ShoppingCart size={20} />
                                            بررسی سبد خرید
                                        </h3>
                                        <div className="space-y-4">
                                            {cart.items.map((item) => (
                                                <div key={item.courseId} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                                    <img
                                                        src={getImageUrl(item.thumbnailSnapshot)}
                                                        alt={item.titleSnapshot}
                                                        className="w-16 h-16 rounded-lg object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-slate-800 dark:text-white">{item.titleSnapshot}</h4>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.instructorSnapshot}</p>
                                                    </div>
                                                    <div className="text-left">
                                                        {item.unitPrice === 0 ? (
                                                            <span className="text-emerald-500 font-bold">رایگان</span>
                                                        ) : (
                                                            <span className="text-slate-800 dark:text-white font-bold">
                                                                {formatPrice(item.unitPrice)} تومان
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Total */}
                                        <div className="border-t border-slate-200 dark:border-slate-700 mt-6 pt-6">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-semibold text-slate-800 dark:text-white">مجموع:</span>
                                                <span className="text-2xl font-bold text-primary-600">{formatPrice(totalAmount)} تومان</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    {totalAmount > 0 && (
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                                <Receipt size={20} />
                                                روش پرداخت
                                            </h3>
                                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                                                <div className="flex items-center gap-3">
                                                    <Receipt size={24} className="text-orange-500" />
                                                    <div>
                                                        <h4 className="font-semibold text-orange-800 dark:text-orange-200">پرداخت کارت به کارت</h4>
                                                        <p className="text-sm text-orange-600 dark:text-orange-300">پس از تکمیل سفارش، رسید پرداخت خود را آپلود کنید</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-4">
                                        <Button
                                            onClick={() => navigate('/cart')}
                                            variant="outline"
                                            className="flex-1"
                                            icon={ArrowLeft}
                                        >
                                            بازگشت به سبد خرید
                                        </Button>
                                        <Button
                                            onClick={() => setShowContractModal(true)}
                                            disabled={isProcessing}
                                            className="flex-1"
                                            icon={isProcessing ? undefined : CheckCircle2}
                                        >
                                            {isProcessing ? 'در حال پردازش...' : 'تکمیل خرید'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Success */}
                            {step === 2 && (
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                                    <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400 animate-bounce">
                                        <CheckCircle2 size={48} />
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">خرید موفقیت‌آمیز بود!</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                                        تبریک می‌گوییم! شما اکنون در {cart.itemCount} دوره ثبت‌نام کرده‌اید. دسترسی شما به محتوای دوره‌ها فعال شد.
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <Button onClick={() => navigate('/profile?tab=courses')} variant="outline">
                                            مشاهده در پنل کاربری
                                        </Button>
                                        <Button onClick={() => navigate('/')}>
                                            مشاهده دوره‌های بیشتر
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Summary */}
                        {step < 2 && (
                            <div className="lg:col-span-1">
                                <div className="sticky top-28 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">خلاصه صورت‌حساب</h3>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                                            <span>تعداد دوره‌ها</span>
                                            <span>{cart.itemCount}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                                            <span>مبلغ کل</span>
                                            <span>{formatPrice(totalAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                                            <span>مالیات (۰٪)</span>
                                            <span>۰</span>
                                        </div>
                                        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between font-bold text-lg text-slate-800 dark:text-white">
                                            <span>مجموع</span>
                                            <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(totalAmount)} تومان</span>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl mb-6">
                                        <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed flex items-start gap-2">
                                            <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                                            خرید شما شامل ضمانت بازگشت وجه ۷ روزه و پشتیبانی دائمی می‌باشد.
                                        </p>
                                    </div>

                                    <Button
                                        onClick={() => setShowContractModal(true)}
                                        disabled={isProcessing}
                                        className="w-full !py-3.5 !rounded-xl shadow-xl shadow-indigo-500/20"
                                    >
                                        {isProcessing ? 'در حال پردازش...' : 'تکمیل خرید'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contract Modal */}
            <ContractModal
                isOpen={showContractModal}
                onClose={handleContractReject}
                onAccept={handleContractAccept}
                courses={cart?.items || []}
                user={user}
            />

            <Footer />
        </div>
    );
};

export default CheckoutCart;