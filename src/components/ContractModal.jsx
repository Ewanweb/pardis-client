import React, { useState } from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from './UI';
import { formatPrice } from '../services/Libs';

const ContractModal = ({ isOpen, onClose, onAccept, courses, user }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [acceptedContracts, setAcceptedContracts] = useState([]);

    if (!isOpen || !courses || courses.length === 0) return null;

    const currentCourse = courses[currentIndex];
    console.log('📄 Contract Modal - Current Course:', currentCourse);
    const isLastCourse = currentIndex === courses.length - 1;
    const hasAcceptedCurrent = acceptedContracts.includes(currentIndex);

    const handleAccept = () => {
        if (!hasAcceptedCurrent) {
            setAcceptedContracts([...acceptedContracts, currentIndex]);
        }

        if (isLastCourse) {
            // All contracts accepted
            onAccept();
        } else {
            // Move to next course
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleReject = () => {
        onClose();
        setCurrentIndex(0);
        setAcceptedContracts([]);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-slate-800 dark:to-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                            <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                قرارداد ثبت‌نام دوره
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                دوره {currentIndex + 1} از {courses.length}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleReject}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {/* Contract Header */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 text-center">
                            قرارداد ثبت‌نام در دوره آموزشی
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-500 dark:text-slate-400">نام هنرجو:</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-100 mr-2">
                                    {user?.fullName || 'کاربر'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500 dark:text-slate-400">نام آموزشگاه:</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-100 mr-2">
                                    آکادمی پردیس توس
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500 dark:text-slate-400">نام دوره:</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-100 mr-2">
                                    {currentCourse.titleSnapshot || currentCourse.title}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500 dark:text-slate-400">مبلغ دوره:</span>
                                <span className="font-semibold text-primary-600 dark:text-primary-400 mr-2">
                                    {currentCourse.unitPrice === 0 ? 'رایگان' : `${formatPrice(currentCourse.unitPrice)} تومان`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Contract Terms */}
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3">
                            شرایط و قوانین آموزشگاه:
                        </h4>
                        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            <p className="flex items-start gap-2">
                                <span className="text-primary-500 mt-1">•</span>
                                <span>هنرجو متعهد می‌شود که در کلاس‌های آموزشی حضور منظم داشته باشد و در صورت غیبت، آموزشگاه مسئولیتی در قبال جبران کلاس‌های از دست رفته ندارد.</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-primary-500 mt-1">•</span>
                                <span>شهریه پرداخت شده غیرقابل استرداد می‌باشد، مگر در موارد خاص که با تایید مدیریت آموزشگاه انجام شود.</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-primary-500 mt-1">•</span>
                                <span>هنرجو موظف است از تجهیزات و امکانات آموزشگاه با دقت استفاده کند و در صورت بروز هرگونه خسارت، مسئول جبران آن خواهد بود.</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-primary-500 mt-1">•</span>
                                <span>رعایت احترام متقابل بین هنرجویان و اساتید الزامی است و هرگونه رفتار نامناسب می‌تواند منجر به اخراج از دوره شود.</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-primary-500 mt-1">•</span>
                                <span>محتوای آموزشی دوره‌ها متعلق به آموزشگاه پردیس توس بوده و هرگونه کپی‌برداری، ضبط یا انتشار غیرمجاز آن پیگرد قانونی دارد.</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-primary-500 mt-1">•</span>
                                <span>آموزشگاه حق دارد در صورت نیاز، زمان‌بندی کلاس‌ها را با اطلاع قبلی به هنرجویان تغییر دهد.</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-primary-500 mt-1">•</span>
                                <span>گواهینامه پایان دوره تنها به هنرجویانی اعطا می‌شود که حداقل ۸۰٪ حضور در کلاس‌ها را داشته و آزمون‌های مربوطه را با موفقیت پشت سر گذاشته باشند.</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-primary-500 mt-1">•</span>
                                <span>هنرجو با ثبت‌نام در این دوره، تمامی قوانین و مقررات آموزشگاه را می‌پذیرد و متعهد به رعایت آن‌ها می‌شود.</span>
                            </p>
                        </div>

                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                                با کلیک بر روی دکمه "قوانین را می‌پذیرم"، شما تأیید می‌کنید که تمامی شرایط و قوانین فوق را مطالعه کرده و می‌پذیرید.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-4 p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <Button
                        onClick={handleReject}
                        variant="outline"
                        className="flex-1"
                    >
                        انصراف
                    </Button>
                    <Button
                        onClick={handleAccept}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        icon={CheckCircle2}
                    >
                        {isLastCourse ? 'قوانین را می‌پذیرم و ادامه' : 'قوانین را می‌پذیرم - دوره بعدی'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ContractModal;
