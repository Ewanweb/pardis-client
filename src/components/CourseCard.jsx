import React from 'react';
import { Users, BookOpen } from 'lucide-react';

const CourseCard = ({ course }) => {
    const formatPrice = (price) => new Intl.NumberFormat('fa-IR').format(price);

    const handleImageError = (e) => {
        e.target.src = "https://placehold.co/600x400/1e1b4b/FFF?text=Pardis+Academy";
    };

    return (
        <div className="group bg-white dark:bg-slate-900 rounded-[1.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col h-full relative top-0 hover:-top-1">
            <div className="relative aspect-[16/10] overflow-hidden m-2 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>

                <img
                    src={course.thumbnail || "https://placehold.co/600x400/1e1b4b/FFF?text=No+Image"}
                    alt={course.title}
                    referrerPolicy="no-referrer"
                    onError={handleImageError}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                <div className="absolute top-3 right-3 z-20 flex gap-2">
                    <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-indigo-700 dark:text-indigo-300 shadow-sm flex items-center gap-1">
                        <BookOpen size={12} />
                        {course.category?.title || 'عمومی'}
                    </span>
                </div>
            </div>

            <div className="px-5 pb-5 pt-2 flex flex-col flex-grow">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {course.title}
                </h3>

                <div className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-5 leading-relaxed flex-grow"
                     dangerouslySetInnerHTML={{ __html: course.description?.substring(0, 100) + '...' }}>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800 mt-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300 ring-2 ring-white dark:ring-slate-800">
                            <span className="text-xs font-bold">{course.instructor?.name ? course.instructor.name.charAt(0) : 'U'}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate max-w-[100px]">
                            {course.instructor?.name || 'مدرس دوره'}
                        </span>
                    </div>

                    <div className="flex flex-col items-end">
                        {course.price === 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-black text-lg">رایگان!</span>
                        ) : (
                            <div className="text-right">
                                <span className="text-lg font-black text-slate-800 dark:text-slate-100">{formatPrice(course.price)}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 mr-1 font-bold">تومان</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;