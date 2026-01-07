import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Upload, CreditCard, CheckCircle2, XCircle, Clock, AlertTriangle, Copy, Eye } from 'lucide-react';
import { Button } from '../components/UI';
import { apiClient } from '../services/api';
import { formatPrice } from '../services/Libs';
import { useAlert } from '../hooks/useAlert';
import toast from 'react-hot-toast';

const ManualPayment = () => {
    const { paymentId } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const alert = useAlert();

    const [paymentRequest, setPaymentRequest] = useState(state?.paymentRequest || null);
    const [course, setCourse] = useState(state?.course || null);
    const [cardInfo, setCardInfo] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(!paymentRequest);

    useEffect(() => {
        fetchData();
    }, [paymentId]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // دریافت اطلاعات کارت مقصد
            const cardResult = await apiClient.get('/payments/manual/info');
            if (cardResult.success) {
                setCardInfo(cardResult.data);
            }

            // دریافت اطلاعات پرداخت
            if (paymentId) {
                const paymentResult = await apiClient.get(`/me/payments/${paymentId}`);
                if (paymentResult.success && paymentResult.data) {
                    setPaymentRequest(paymentResult.data);
                } else {
                    console.error('Payment fetch failed:', paymentResult);
                    // fallback to dummy if needed or show error
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            // alert.showError('خطا در دریافت اطلاعات'); // Avoiding multiple alerts
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // اعتبارسنجی فایل
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!allowedTypes.includes(file.type)) {
                alert.showError('فقط فایل‌های تصویری (JPG, PNG, WebP) مجاز هستند');
                return;
            }

            if (file.size > maxSize) {
                alert.showError('حداکثر سایز فایل 5 مگابایت است');
                return;
            }

            setSelectedFile(file);
            // ایجاد پیش‌نمایش
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadReceipt = async () => {
        if (!selectedFile) {
            alert.showError('لطفاً فایل رسید را انتخاب کنید');
            return;
        }

        try {
            setUploading(true);
            setUploadProgress(0);

            const formData = new FormData();
            formData.append('ReceiptFile', selectedFile);

            const result = await apiClient.post(`/me/payments/${paymentId}/receipt`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            if (result.success) {
                setPaymentRequest(result.data);
                toast.success('رسید با موفقیت آپلود شد و در انتظار تایید است');
                setPreviewUrl(null);
                setSelectedFile(null);

                // هدایت به پنل کاربری بخش پرداخت‌ها
                setTimeout(() => {
                    navigate('/profile?tab=payments');
                }, 3000);
            } else {
                throw new Error(result.message || 'خطا در آپلود رسید');
            }

        } catch (error) {
            console.error('Upload error:', error);
            alert.showError(error.response?.data?.message || error.message || 'خطا در آپلود رسید');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('کپی شد');
    };

    const getStatusBadge = (status) => {
        const s = String(status).toLowerCase();

        if (s === '1' || s === 'pendingpayment' || s === '2' || s === 'awaitingreceiptupload') {
            return (
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                    <Clock size={16} />
                    در انتظار آپلود رسید
                </div>
            );
        }
        if (s === '3' || s === 'awaitingadminapproval') {
            return (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    <Clock size={16} />
                    در انتظار تایید ادمین
                </div>
            );
        }
        if (s === '4' || s === 'paid') {
            return (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <CheckCircle2 size={16} />
                    تایید شده و فعال
                </div>
            );
        }
        if (s === '5' || s === 'failed') {
            return (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    <XCircle size={16} />
                    رد شده (نیاز به اصلاح)
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm">
                <Clock size={16} />
                {paymentRequest?.statusText || 'نامشخص'}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400 font-sans">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (!paymentRequest) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl text-center max-w-md">
                    <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2 font-sans">اطلاعات پرداخت یافت نشد</h2>
                    <p className="text-slate-500 mb-6 font-sans">متاسفانه امکان بارگذاری اطلاعات این پرداخت وجود ندارد. ممکن است لینک نامعتبر باشد یا دسترسی لازم را نداشته باشید.</p>
                    <Button onClick={() => navigate('/me/orders')}>بازگشت به سفارش‌ها</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        بازگشت
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        پرداخت کارت به کارت
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* اطلاعات پرداخت */}
                    <div className="space-y-6">
                        {/* وضعیت درخواست */}
                        {paymentRequest && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                                    وضعیت درخواست
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">وضعیت:</span>
                                        {getStatusBadge(paymentRequest.status)}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">مبلغ:</span>
                                        <span className="font-bold text-slate-800 dark:text-white">
                                            {formatPrice(paymentRequest.amount)} تومان
                                        </span>
                                    </div>
                                    {course && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600 dark:text-slate-400">دوره:</span>
                                            <span className="font-medium text-slate-800 dark:text-white">
                                                {course.title}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {(String(paymentRequest.status).toLowerCase() === '5' || String(paymentRequest.status).toLowerCase() === 'failed') && paymentRequest.rejectReason && (
                                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle size={20} className="text-red-500 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-red-800 dark:text-red-200">دلیل رد:</p>
                                                <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                                                    {paymentRequest.rejectReason}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* اطلاعات کارت مقصد */}
                        {cardInfo && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <CreditCard className="text-indigo-500" />
                                    اطلاعات کارت مقصد
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">شماره کارت:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-slate-800 dark:text-white">
                                                {cardInfo.cardNumber}
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(cardInfo.cardNumber.replace(/-/g, ''))}
                                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                                            >
                                                <Copy size={16} className="text-slate-500" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">نام صاحب حساب:</span>
                                        <span className="font-medium text-slate-800 dark:text-white">
                                            {cardInfo.cardHolderName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">بانک:</span>
                                        <span className="font-medium text-slate-800 dark:text-white">
                                            {cardInfo.bankName}
                                        </span>
                                    </div>
                                </div>

                                {cardInfo.description && (
                                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                                            {cardInfo.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* آپلود رسید */}
                    <div className="space-y-6">
                        {paymentRequest && (
                            ['1', 'pendingpayment', '2', 'awaitingreceiptupload', '5', 'failed'].includes(String(paymentRequest.status).toLowerCase())
                        ) && (
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/40 relative overflow-hidden group">
                                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>

                                    <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600">
                                            <Upload size={24} />
                                        </div>
                                        آپلود رسید پرداخت
                                    </h2>

                                    <div className="space-y-6 relative z-10">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id="receipt-file"
                                                accept=".jpg,.jpeg,.png,.webp"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />

                                            {!previewUrl ? (
                                                <label
                                                    htmlFor="receipt-file"
                                                    className="cursor-pointer block border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-500/50 rounded-[2rem] p-12 text-center transition-all bg-slate-50/50 dark:bg-slate-800/20 hover:bg-green-50/30 dark:hover:bg-green-900/10"
                                                >
                                                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                                                        <Upload size={32} className="text-slate-400 group-hover:text-green-500 transition-colors" />
                                                    </div>
                                                    <p className="text-slate-700 dark:text-slate-200 font-bold mb-2">
                                                        تصویر فیش واریزی را انتخاب کنید
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-tighter">
                                                        فرمت‌های مجاز: JPG, PNG, WebP <br /> حداکثر حجم: ۵ مگابایت
                                                    </p>
                                                </label>
                                            ) : (
                                                <div className="relative rounded-[2rem] overflow-hidden border-2 border-green-500/30 shadow-2xl">
                                                    <img src={previewUrl} alt="Receipt preview" className="w-full h-64 object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                        <label htmlFor="receipt-file" className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm cursor-pointer shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                                                            <Upload size={18} /> تغییر فایل
                                                        </label>
                                                    </div>
                                                    <button
                                                        onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                                                        className="absolute top-4 left-4 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {uploading && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-slate-500">
                                                    <span>در حال آپلود...</span>
                                                    <span>{uploadProgress}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 transition-all duration-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            onClick={handleUploadReceipt}
                                            disabled={!selectedFile || uploading}
                                            className="w-full !py-4 !rounded-2xl shadow-xl shadow-green-500/20"
                                            size="lg"
                                        >
                                            {uploading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-3"></div>
                                                    در حال پردازش...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={20} className="ml-2" />
                                                    تایید و ارسال نهایی رسید
                                                </>
                                            )}
                                        </Button>

                                        <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 italic leading-relaxed px-4">
                                            با کلیک بر روی دکمه فوق، تایید می‌کنید که اطلاعات واریز صحیح بوده و مسئولیت هرگونه مغایرت بر عهده شماست.
                                        </p>
                                    </div>
                                </div>
                            )}

                        {paymentRequest && (String(paymentRequest.status).toLowerCase() === '3' || String(paymentRequest.status).toLowerCase() === 'awaitingadminapproval') && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                <div className="text-center">
                                    <Clock size={48} className="mx-auto text-blue-500 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                                        رسید شما آپلود شد
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                                        رسید پرداخت شما در حال بررسی توسط ادمین است. نتیجه بررسی از طریق ایمیل و پیامک اطلاع‌رسانی خواهد شد.
                                    </p>

                                    {paymentRequest.receiptFileUrl && (
                                        <Button
                                            variant="outline"
                                            onClick={() => window.open(paymentRequest.receiptFileUrl, '_blank')}
                                            className="flex items-center gap-2"
                                        >
                                            <Eye size={16} />
                                            مشاهده رسید آپلود شده
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {paymentRequest && (String(paymentRequest.status).toLowerCase() === '4' || String(paymentRequest.status).toLowerCase() === 'paid') && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                <div className="text-center">
                                    <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                                        پرداخت تایید شد
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                                        پرداخت شما با موفقیت تایید شد و دسترسی به دوره برای شما فعال گردید.
                                    </p>
                                    <Button
                                        onClick={() => navigate('/profile?tab=courses')}
                                        className="flex items-center gap-2"
                                    >
                                        مشاهده دوره‌های من
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManualPayment;