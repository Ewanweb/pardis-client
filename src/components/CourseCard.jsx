import React from 'react';
import { BookOpen, User } from 'lucide-react';

const CourseCard = ({ course }) => {
    const formatPrice = (price) => new Intl.NumberFormat('fa-IR').format(price);
    return (
        <div className="group bg-white rounded-[1.5rem] overflow-hidden border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col h-full relative top-0 hover:-top-1">
            <div className="relative aspect-[16/10] overflow-hidden m-2 rounded-2xl">
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
                <img
                    src={course.thumbnail || "https://via.placeholder.com/640x360?text=Academy"}
                    alt={course.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-3 right-3 z-20 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-indigo-700 shadow-sm flex items-center gap-1">
                        <BookOpen size={12} />
                        {course.category?.title || 'عمومی'}
                    </span>
                </div>
            </div>

            <div className="px-5 pb-5 pt-2 flex flex-col flex-grow">
                <h3 className="text-lg font-black text-slate-800 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">
                    {course.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-5 leading-relaxed flex-grow">
                    {course.seo?.meta_description || course.description.substring(0, 100) + '...'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 ring-2 ring-white">
                            <User size={14} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 truncate max-w-[100px]">
                            {course.instructor?.name || 'مدرس دوره'}
                        </span>
                    </div>

                    <div className="flex flex-col items-end">
                        {course.price === 0 ? (
                            <span className="text-emerald-600 font-black text-lg">رایگان!</span>
                        ) : (
                            <div className="text-right">
                                <span className="text-lg font-black text-slate-800">{formatPrice(course.price)}</span>
                                <span className="text-[10px] text-slate-400 mr-1 font-bold">تومان</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CourseCard;