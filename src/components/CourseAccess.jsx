import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    Video,
    AlertTriangle,
    ShoppingCart,
    Plus,
    CheckCircle2,
    Clock,
    Award,
    Calendar
} from 'lucide-react';
import { Button } from './UI';
import { formatDate } from '../services/Libs';

/**
 * کامپوننت نمایش اطلاعات دسترسی دوره بر اساس CourseType
 * @param {Object} props
 * @param {Object} props.course - اطلاعات دوره
 * @param {boolean} props.isPurchased - آیا کاربر دوره را خریده؟
 * @param {boolean} props.isInCart - آیا دوره در سبد خرید است؟
 * @param {Function} props.onAddToCart - تابع اضافه کردن به سبد
 * @param {boolean} props.addingToCart - وضعیت loading اضافه کردن به سبد
 */
const CourseAccess = ({
    course,
    isPurchased,
    isInCart,
    onAddToCart,
    addingToCart = false
}) => {
    const navigate = useNavigate();
    const { type: courseType, access } = course;

    // برای کاربران غیرخریدار - فقط CTA خرید
    if (!isPurchased) {
        return (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <ShoppingCart size={20} className="text-primary" />
                    خرید دوره
                </h3>

                <div className="space-y-3">
                    {isInCart ? (
                        <Button
                            variant="outline"
                            className="w-full !py-3 !text-base !rounded-xl border-2 border-primary text-primary hover:bg-primary/5"
                            onClick={() => navigate('/cart')}
                        >
                            <ShoppingCart className="ml-2" size={18} />
                            مشاهده سبد خرید
                        </Button>
                    ) : (
                        <Button
                            className="w-full !py-3 !text-base !rounded-xl"
                            onClick={onAddToCart}
                            disabled={addingToCart}
                        >
                            {addingToCart ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2"></div>
                                    در حال اضافه کردن...
                                </>
                            ) : (
                                <>
                                    <Plus className="ml-2" size={18} />
                                    افزودن به سبد خرید
                                </>
                            )}
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        className="w-full !py-2 !text-sm !rounded-lg"
                        onClick={() => navigate(`/checkout/${course.slug}`)}
                    >
                        خرید مستقیم
                    </Button>
                </div>
            </div>
        );
    }

    // برای کاربران خریدار
    return (
        <div className="space-y-6">
            {/* وضعیت دسترسی */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    دسترسی به دوره
                </h3>

                {/* بررسی مسدود بودن دسترسی */}
                {access?.isAccessBlocked ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
                        <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
                        <div>
                            <p className="text-red-700 dark:text-red-300 font-medium">
                                دسترسی شما به این دوره موقتاً مسدود شده است
                            </p>
                            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                                برای رفع مسدودیت با پشتیبانی تماس بگیرید
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* دسترسی حضوری */}
                        {(courseType === 'InPerson' || courseType === 'Hybrid') && access?.classLocation && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="text-blue-700 dark:text-blue-300 font-medium mb-1">
                                            محل برگزاری کلاس
                                        </p>
                                        <p className="text-blue-600 dark:text-blue-400 text-sm leading-relaxed">
                                            {access.classLocation}
                                        </p>
                                        {access.seatNumber && (
                                            <p className="text-blue-500 dark:text-blue-400 text-xs mt-2 font-medium">
                                                شماره صندلی: {access.seatNumber}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* دسترسی آنلاین */}
                        {(courseType === 'Online' || courseType === 'Hybrid') && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                                {access?.liveUrl ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Video className="text-emerald-500" size={20} />
                                            <div>
                                                <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                                                    کلاس آنلاین آماده است
                                                </p>
                                                <p className="text-emerald-600 dark:text-emerald-400 text-sm">
                                                    برای ورود به کلاس کلیک کنید
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700 !rounded-lg"
                                            onClick={() => window.open(access.liveUrl, '_blank')}
                                        >
                                            <Video className="ml-1" size={16} />
                                            ورود به کلاس
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Clock className="text-amber-500" size={20} />
                                        <div>
                                            <p className="text-amber-700 dark:text-amber-300 font-medium">
                                                لینک کلاس هنوز آماده نشده
                                            </p>
                                            <p className="text-amber-600 dark:text-amber-400 text-sm">
                                                لینک دسترسی قبل از شروع کلاس ارسال می‌شود
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* اطلاعات پیشرفت */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Award size={20} className="text-amber-500" />
                    پیشرفت شما
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">تاریخ ثبت‌نام:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                            {formatDate(access?.enrolledAt)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">وضعیت:</span>
                        <span className={`font-medium px-2 py-1 rounded-lg text-xs ${access?.isCompleted
                                ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                                : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            }`}>
                            {access?.isCompleted ? 'تکمیل شده' : 'در حال مطالعه'}
                        </span>
                    </div>

                    {access?.finalGrade && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">نمره نهایی:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                                {access.finalGrade}/100
                            </span>
                        </div>
                    )}

                    {access?.certificateCode && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                            <div className="flex items-center gap-2">
                                <Award className="text-amber-500" size={16} />
                                <span className="text-amber-700 dark:text-amber-300 font-medium text-sm">
                                    گواهینامه: {access.certificateCode}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseAccess;