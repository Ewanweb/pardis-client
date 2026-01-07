import { X, Receipt } from 'lucide-react';
import { Button } from '../../../../components/UI';
import { getImageUrl } from '../../../../services/Libs';

export const ReceiptPreviewModal = ({
    isOpen,
    onClose,
    receiptUrl,
    paymentInfo
}) => {
    if (!isOpen) return null;

    const openReceiptInNewTab = () => {
        window.open(receiptUrl, '_blank');
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-100 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Receipt className="text-blue-600" size={24} />
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                مشاهده رسید پرداخت
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {paymentInfo.studentName} - {paymentInfo.orderNumber}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Receipt Image */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                        <img
                            src={getImageUrl(receiptUrl)}
                            alt="رسید پرداخت"
                            className="max-w-full max-h-96 mx-auto rounded-lg shadow-sm"
                            onError={(e) => {
                                const target = e.target;
                                target.style.display = 'none';
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'text-red-500 p-8';
                                errorDiv.innerHTML = '<p>خطا در بارگذاری تصویر رسید</p>';
                                target.parentNode?.appendChild(errorDiv);
                            }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={openReceiptInNewTab}
                        className="flex-1"
                    >
                        <Receipt size={16} className="ml-2" />
                        باز کردن در تب جدید
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        بستن
                    </Button>
                </div>
            </div>
        </div>
    );
};