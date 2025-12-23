import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { verifyZarinpalPayment } from '../services/zarinpal';
import { Button } from '../components/UI';
import { useAlert } from '../hooks/useAlert';

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing'); // processing, success, failed
    const [paymentInfo, setPaymentInfo] = useState(null);
    const alert = useAlert();

    useEffect(() => {
        const processPayment = async () => {
            try {
                const authority = searchParams.get('Authority');
                const statusParam = searchParams.get('Status');

                if (!authority) {
                    setStatus('failed');
                    return;
                }

                if (statusParam === 'NOK') {
                    setStatus('failed');
                    setPaymentInfo({ message: 'پرداخت توسط کاربر لغو شد' });
                    return;
                }

                // Get payment amount from localStorage (stored during payment)
                const paymentData = JSON.parse(localStorage.getItem('pendingPayment') || '{}');

                if (!paymentData.amount) {
                    setStatus('failed');
                    setPaymentInfo({ message: 'اطلاعات پرداخت یافت نشد' });
                    return;
                }

                // Verify payment with ZarinPal
                const verifyResult = await verifyZarinpalPayment(authority, paymentData.amount);

                if (verifyResult.success) {
                    setStatus('success');
                    setPaymentInfo({
                        refId: verifyResult.refId,
                        amount: paymentData.amount,
                        courseName: paymentData.courseName
                    });

                    // Clear pending payment
                    localStorage.removeItem('pendingPayment');

                    alert.showSuccess('پرداخت با موفقیت انجام شد!');
                } else {
                    setStatus('failed');
                    setPaymentInfo({ message: verifyResult.message });
                }

            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus('failed');
                setPaymentInfo({ message: 'خطا در تأیید پرداخت' });
            }
        };

        processPayment();
    }, [searchParams]);

    if (status === 'processing') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                        در حال تأیید پرداخت...
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        لطفاً صبر کنید
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950">
            <Helmet>
                <title>{status === 'success' ? 'پرداخت موفق' : 'پرداخت ناموفق'}</title>
            </Helmet>

            <div className="container mx-auto px-4 max-w-2xl">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center">
                    {status === 'success' ? (
                        <>
                            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                                پرداخت موفقیت‌آمیز بود!
                            </h2>
                            {paymentInfo && (
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6">
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        کد پیگیری: {paymentInfo.refId}
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        مبلغ: {paymentInfo.amount?.toLocaleString()} تومان
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                                پرداخت ناموفق بود
                            </h2>
                            {paymentInfo?.message && (
                                <p className="text-red-600 dark:text-red-400 mb-6">
                                    {paymentInfo.message}
                                </p>
                            )}
                        </>
                    )}

                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => navigate('/')} variant="outline">
                            صفحه اصلی
                        </Button>
                        {status === 'success' ? (
                            <Button onClick={() => navigate('/profile?tab=courses')}>
                                مشاهده دوره‌های من
                            </Button>
                        ) : (
                            <Button onClick={() => navigate(-1)}>
                                تلاش مجدد
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCallback;