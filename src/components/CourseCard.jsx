import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, Clock, Star } from 'lucide-react';
import { getImageUrl, formatPrice } from '../services/Libs';
import LazyImage from './LazyImage';

const CourseCard = ({ course }) => {

    // هندل کردن نام مدرس (ممکن است name یا fullName باشد)
    const instructorName = useMemo(
        () => course.instructor?.fullName || course.instructor?.name || 'مدرس ناشناس',
        [course.instructor?.fullName, course.instructor?.name]
    );

    // هندل کردن تصویر پیش‌فرض در صورت نبود عکس
    const thumbnailSrc = useMemo(
        () => getImageUrl(course.thumbnail) || "https://placehold.co/600x400/1e1b4b/FFF?text=Pardis+Academy",
        [course.thumbnail]
    );

    // نمایش زمان‌بندی
    const scheduleText = useMemo(() => {
        if (course.schedules && course.schedules.length > 0) {
            return course.schedules[0].fullScheduleText || course.schedules[0].timeRange;
        }
        return course.schedule || null;
    }, [course.schedule, course.schedules]);

    return (
        <Link
            to={`/course/${course.slug}`}
            className="group flex flex-col h-full bg-gradient-to-br from-white via-slate-50/30 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20 hover:shadow-2xl hover:shadow-indigo-500/15 dark:hover:shadow-indigo-500/10 hover:-translate-y-3 hover:scale-[1.02] transition-all duration-500 backdrop-blur-sm"
        >
            {/* --- بخش تصویر --- */}
            <div className="relative aspect-video m-3 overflow-hidden rounded-[1.5rem] shadow-lg shadow-slate-200/30 dark:shadow-slate-900/30">
                <LazyImage
                    src={thumbnailSrc}
                    alt={course.title || 'دوره آموزشی'}
                    className="w-full h-full transform group-hover:scale-110 transition-transform duration-700"
                    width="406"
                    height="199"
                    onError={(e) => e.target.src = "https://placehold.co/600x400/1e1b4b/FFF?text=No+Image"}
                />

                {/* لایه تیره روی عکس در هاور */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/0 via-transparent to-slate-900/0 group-hover:from-slate-900/20 group-hover:to-indigo-900/10 transition-all duration-500"></div>

                {/* بج (Badge) دسته‌بندی */}
                <div className="absolute top-3 right-3">
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-gradient-to-r from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-xl text-primary-600 dark:text-primary-400 shadow-lg shadow-primary-500/20 border border-primary-200/30 dark:border-primary-800/30 flex items-center gap-1.5 group-hover:scale-105 transition-transform duration-300">
                        <BookOpen size={12} />
                        {course.category?.title || 'عمومی'}
                    </span>
                </div>

                {/* نمایش زمان‌بندی در گوشه پایین */}
                {scheduleText && (
                    <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-1 rounded-md text-[9px] font-bold bg-black/60 text-white backdrop-blur-sm flex items-center gap-1">
                            <Clock size={10} />
                            {scheduleText}
                        </span>
                    </div>
                )}
            </div>

            {/* --- بخش محتوا --- */}
            <div className="flex flex-col flex-grow p-5 pt-2">
                {/* عنوان */}
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-2 line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {course.title}
                </h3>

                {/* مدرس */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {instructorName.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-text-tertiary dark:text-slate-400 truncate">
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

export default React.memo(CourseCard);
