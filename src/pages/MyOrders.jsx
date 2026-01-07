import { useState, useEffect } from 'react';
import { ShoppingBag, ChevronRight, Clock, CheckCircle2, XCircle, Upload, Eye, Filter, RefreshCw, Smartphone, CreditCard } from 'lucide-react';
import { apiClient } from '../services/api';
import { formatPrice, formatDate, getImageUrl } from '../services/Libs';
import { Button } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import SeoHead from '../components/Seo/SeoHead';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unpaid, paid, pending, rejected
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const result = await apiClient.get('/me/orders');
            if (result.success) {
                setOrders(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 0: // Draft
                return { label: 'پیش‌نویس', color: 'bg-slate-100 text-slate-700', icon: Clock };
            case 1: // PendingPayment
                return { label: 'در انتظار پرداخت', color: 'bg-amber-100 text-amber-700', icon: Clock };
            case 2: // Completed
                return { label: 'تکمیل شده', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 };
            case 3: // Cancelled
                return { label: 'لغو شده', color: 'bg-red-100 text-red-700', icon: XCircle };
            default:
                return { label: 'نامشخص', color: 'bg-slate-100 text-slate-700', icon: Clock };
        }
    };

    const getPaymentStatusInfo = (pa) => {
        const s = String(pa.status).toLowerCase();

        if (s === '5' || s === 'failed') {
            return { label: 'رسید رد شد (نیاز به اصلاح)', color: 'bg-rose-100 text-rose-700', icon: XCircle, canReupload: true };
        }

        if (s === '1' || s === 'pendingpayment' || s === '2' || s === 'awaitingreceiptupload') {
            return { label: 'در انتظار آپلود رسید', color: 'bg-amber-100 text-amber-700', icon: Clock, canUpload: true };
        }
        if (s === '3' || s === 'awaitingadminapproval') {
            return { label: 'در انتظار تایید ادمین', color: 'bg-blue-100 text-blue-700', icon: Clock, canView: true };
        }
        if (s === '4' || s === 'paid') {
            return { label: 'پرداخت شده', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, canView: true };
        }

        return { label: pa.statusText || 'نامشخص', color: 'bg-slate-100 text-slate-700', icon: Clock };
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'unpaid') return order.status === 1;
        if (filter === 'paid') return order.status === 2;

        // Filter based on payment attempts
        const hasPendingPA = order.paymentAttempts?.some(pa => pa.status === 3);
        const hasRejectedPA = order.paymentAttempts?.some(pa => pa.status === 5);

        if (filter === 'pending') return hasPendingPA;
        if (filter === 'rejected') return hasRejectedPA;
        return true;
    });

    return (
        <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
            <SeoHead title="سفارش‌های من | آکادمی پردیس توس" noIndex />

            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                            <ShoppingBag className="text-indigo-600" size={32} />
                            سفارش‌های من
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">مدیریت سفارش‌ها و تاریخچه پرداخت‌های شما</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={fetchOrders} disabled={loading} className="!rounded-2xl !px-4">
                            <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-8 p-2 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
                    {[
                        { id: 'all', label: 'همه سفارش‌ها', icon: Filter },
                        { id: 'unpaid', label: 'در انتظار پرداخت', icon: Clock },
                        { id: 'pending', label: 'در انتظار تایید رسید', icon: Clock },
                        { id: 'paid', label: 'پرداخت شده', icon: CheckCircle2 },
                        { id: 'rejected', label: 'رسیدهای رد شده', icon: XCircle },
                    ].map(btn => (
                        <button
                            key={btn.id}
                            onClick={() => setFilter(btn.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${filter === btn.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <btn.icon size={16} />
                            {btn.label}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 h-48 rounded-[2rem] border border-slate-100 dark:border-slate-800 animate-pulse"></div>
                        ))
                    ) : filteredOrders.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 p-20 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag size={48} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">سفارشی یافت نشد</h3>
                            <p className="text-slate-400 mb-8">هنوز هیچ سفارشی در سیستم ثبت نکرده‌اید.</p>
                            <Button onClick={() => navigate('/')}>مشاهده دوره‌ها</Button>
                        </div>
                    ) : (
                        filteredOrders.map(order => {
                            const status = getStatusInfo(order.status);

                            return (
                                <div key={order.orderId} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group overflow-hidden">
                                    {/* Order Top Bar */}
                                    <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600">
                                                <Smartphone size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">شماره سفارش</span>
                                                    <span className="font-black text-slate-800 dark:text-white">#{order.orderNumber}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(order.createdAt)}</p>
                                            </div>
                                        </div>

                                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black ${status.color}`}>
                                            <status.icon size={14} />
                                            {status.label}
                                        </div>
                                    </div>

                                    {/* Order Content */}
                                    <div className="p-8">
                                        <div className="grid md:grid-cols-2 gap-8 items-center">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-slate-400">تعداد دوره‌ها:</span>
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">{order.courseCount} دوره</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-slate-400">مبلغ کل:</span>
                                                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-xl">{formatPrice(order.totalAmount)} تومان</span>
                                                </div>

                                                {/* Mini course list in tooltips or simple text */}
                                                <div className="flex -space-x-3 space-x-reverse">
                                                    {order.courses?.map((c, i) => (
                                                        <div key={i} className="w-10 h-10 rounded-xl border-2 border-white dark:border-slate-800 overflow-hidden shadow-sm" title={c.title}>
                                                            <img src={getImageUrl(c.thumbnail)} alt={c.thumbnail} className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Payment Attempts Info */}
                                            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">وضعیت پرداخت</h4>
                                                {order.paymentAttempts && order.paymentAttempts.length > 0 ? (
                                                    order.paymentAttempts.map(pa => {
                                                        const paStatus = getPaymentStatusInfo(pa);
                                                        return (
                                                            <div key={pa.paymentAttemptId} className="flex items-center justify-between gap-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-1.5 rounded-lg ${paStatus.color}`}>
                                                                        <paStatus.icon size={14} />
                                                                    </div>
                                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{paStatus.label}</span>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    {paStatus.canUpload && (
                                                                        <Button
                                                                            size="xs"
                                                                            variant="primary"
                                                                            onClick={() => navigate(`/payment/manual/${pa.paymentAttemptId}`)}
                                                                            icon={Upload}
                                                                        >
                                                                            آپلود رسید
                                                                        </Button>
                                                                    )}
                                                                    {paStatus.canReupload && (
                                                                        <Button
                                                                            size="xs"
                                                                            variant="primary"
                                                                            className="!bg-rose-600 hover:!bg-rose-700"
                                                                            onClick={() => navigate(`/payment/manual/${pa.paymentAttemptId}`)}
                                                                            icon={RefreshCw}
                                                                        >
                                                                            اصلاح و ارسال مجدد
                                                                        </Button>
                                                                    )}
                                                                    {(paStatus.canView || paStatus.canRetry) && (
                                                                        <Button
                                                                            size="xs"
                                                                            variant="outline"
                                                                            onClick={() => navigate(`/payment/manual/${pa.paymentAttemptId}`)}
                                                                            icon={Eye}
                                                                        >
                                                                            جزئیات
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-slate-500 italic">تلاش پرداختی ثبت نشده است</span>
                                                        <Button size="xs" variant="primary" onClick={() => navigate(`/checkout-cart`)}>ایجاد پرداخت</Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footbar */}
                                    <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-end">
                                        <button
                                            onClick={() => navigate(`/profile?tab=payments`)}
                                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all"
                                        >
                                            مشاهده ردیف‌های پرداخت <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyOrders;
