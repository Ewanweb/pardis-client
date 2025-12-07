import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, Clock, Star } from 'lucide-react';
import { getImageUrl, formatPrice } from '../services/Libs'; // فرض بر این است که توابع کمکی اینجا هستند
// اگر فایل Libs را نساختید، توابع را همینجا تعریف کنید (در پایین فایل توضیح دادم)

const CourseCard = ({ course }) => {

    // هندل کردن نام مدرس (ممکن است name یا fullName باشد)
    const instructorName = course.instructor?.fullName || course.instructor?.name || 'مدرس ناشناس';

    // هندل کردن تصویر پیش‌فرض در صورت نبود عکس
    const thumbnailSrc = getImageUrl(course.thumbnail) || "https://placehold.co/600x400/1e1b4b/FFF?text=Pardis+Academy";

    return (
        <Link
            to={`/course/${course.slug}`}
            className="group flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500"
        >
            {/* --- بخش تصویر --- */}
            <div className="relative aspect-video m-2 overflow-hidden rounded-[1.5rem]">
                <img
                    src={thumbnailSrc}
                    alt={course.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => e.target.src = "https://placehold.co/600x400/1e1b4b/FFF?text=No+Image"}
                />

                {/* لایه تیره روی عکس در هاور */}
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300"></div>

                {/* بج (Badge) دسته‌بندی */}
                <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-bold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-indigo-600 dark:text-indigo-400 shadow-sm border border-white/20 flex items-center gap-1">
                        <BookOpen size={12} />
                        {course.category?.title || 'عمومی'}
                    </span>
                </div>
            </div>

            {/* --- بخش محتوا --- */}
            <div className="flex flex-col flex-grow p-5 pt-2">
                {/* عنوان */}
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {course.title}
                </h3>

                {/* مدرس */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {instructorName.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                        {instructorName}
                    </span>
                </div>

                {/* فوتر کارت (قیمت و آمار) */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">

                    {/* امتیاز یا وضعیت (اختیاری) */}
                    <div className="flex items-center gap-1 text-amber-400">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">4.8</span>
                    </div>

                    {/* قیمت */}
                    <div className="text-right">
                        {course.price === 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-black text-lg">رایگان!</span>
                        ) : (
                            <div className="flex items-center gap-1">
                                <span className="text-lg font-black text-slate-800 dark:text-white">
                                    {formatPrice(course.price)}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">تومان</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CourseCard;