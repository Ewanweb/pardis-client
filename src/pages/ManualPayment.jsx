import React, { useState, useEffect } from 'react';
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
    const [uploading, setUploading] = useState(false);
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

            // اگر اطلاعات پرداخت در state نیست، از API دریافت کن
            if (!paymentRequest) {
                // TODO: Add API endpoint to get payment request details
                // const paymentResult = await apiClient.get(`/payments/manual/${paymentId}`);
                // if (paymentResult.success) {
                //     setPaymentRequest(paymentResult.data);
                // }
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            alert.showError('خطا در دریافت اطلاعات');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // اعتبارسنجی فایل
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!allowedTypes.includes(file.type)) {
                alert.showError('فقط فایل‌های JPG، PNG و PDF مجاز هستند');
                return;
            }

            if (file.size > maxSize) {
                alert.showError('حداکثر سایز فایل 5 مگابایت است');
                return;
            }

            setSelectedFile(file);
        }
    };

    const handleUploadReceipt = async () => {
        if (!selectedFile) {
            alert.showError('لطفاً فایل رسید را انتخاب کنید');
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append('ReceiptFile', selectedFile);

            const result = await apiClient.post(`/payments/manual/${paymentId}/receipt`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (result.success) {
                setPaymentRequest(result.data);
                toast.success('رسید با موفقیت آپلود شد');

                // هدایت به صفحه وضعیت پرداخت
                setTimeout(() => {
                    navigate('/profile?tab=payments');
                }, 2000);
            } else {
                throw new Error(result.message || 'خطا در آپلود رسید');
            }

        } catch (error) {
            console.error('Upload error:', error);
            alert.showError(error.response?.data?.message || error.message || 'خطا در آپلود رسید');
        } finally {
            setUploading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('کپی شد');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 0: // PendingReceipt
                return (
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                        <Clock size={16} />
                        در انتظار آپلود رسید
                    </div>
                );
            case 1: // PendingApproval
                return (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        <Clock size={16} />
                        در انتظار تایید ادمین
                    </div>
                );
            case 2: // Approved
                return (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        <CheckCircle2 size={16} />
                        تایید شده
                    </div>
                );
            case 3: // Rejected
                return (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        <XCircle size={16} />
                        رد شده
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">در حال بارگذاری...</p>
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

                                {paymentRequest.status === 3 && paymentRequest.rejectReason && (
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
                        {paymentRequest && paymentRequest.status === 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Upload className="text-green-500" />
                                    آپلود رسید پرداخت
                                </h2>

                                <div className="space-y-4">
                                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center">
                                        <input
                                            type="file"
                                            id="receipt-file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="receipt-file"
                                            className="cursor-pointer block"
                                        >
                                            <Upload size={48} className="mx-auto text-slate-400 mb-4" />
                                            <p className="text-slate-600 dark:text-slate-400 mb-2">
                                                کلیک کنید یا فایل را اینجا بکشید
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                فرمت‌های مجاز: JPG, PNG, PDF (حداکثر 5MB)
                                            </p>
                                        </label>
                                    </div>

                                    {selectedFile && (
                                        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                            <CheckCircle2 size={20} className="text-green-500" />
                                            <div className="flex-1">
                                                <p className="font-medium text-green-800 dark:text-green-200">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-sm text-green-600 dark:text-green-300">
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleUploadReceipt}
                                        disabled={!selectedFile || uploading}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                در حال آپلود...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={20} className="mr-2" />
                                                آپلود رسید
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {paymentRequest && paymentRequest.status === 1 && (
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

                        {paymentRequest && paymentRequest.status === 2 && (
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