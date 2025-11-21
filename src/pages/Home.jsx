import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, Users, BookOpen, Award, Clock, Phone, ArrowLeft } from 'lucide-react';
import { api } from '../context/AuthContext';
import { Button } from '../components/UI';
import CourseCard from '../components/CourseCard';

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/courses');
                setCourses(response.data.data);
            } catch (error) { console.error("Error:", error); }
            finally { setLoading(false); }
        };
        fetchCourses();
    }, []);

    return (
        <div className="bg-slate-50/50 min-h-screen pt-20"> {/* pt-20 برای هماهنگی با نوبار فیکس */}
            <div className="relative overflow-hidden pt-10 pb-24 lg:pb-32 bg-white rounded-b-[3rem] shadow-sm border-b border-slate-100">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mb-8 border border-indigo-100 shadow-sm animate-bounce-slow">
                        <Sparkles size={14} />
                        <span>دوره جدید لاراول ۱۱ منتشر شد</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-8 leading-[1.1]">
                        مهارت‌هایی که آینده شما را <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">متحول می‌کنند</span>
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-slate-500 leading-relaxed mb-10">
                        در آکادمی پردیس، تئوری را کنار بگذارید. اینجا با پروژه‌های واقعی و اساتید باتجربه، برای بازار کار آماده می‌شوید.
                    </p>
                    <div className="flex justify-center gap-4">
                        <a href="#courses"><Button icon={ChevronLeft} className="w-full sm:w-auto px-8 py-4 text-lg">شروع یادگیری</Button></a>
                    </div>

                    {/* Stats */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 border-t border-slate-100 pt-12">
                        {[{ label: 'دانشجو', value: '+۲,۰۰۰' }, { label: 'دوره آموزشی', value: '+۵۰' }, { label: 'رضایت', value: '۹۸٪' }, { label: 'ساعت آموزش', value: '+۵k' }].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <span className="text-3xl font-black text-slate-800 mb-1">{stat.value}</span>
                                <span className="text-sm font-bold text-slate-400">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <section id="courses" className="py-20 container mx-auto px-4">
                <div className="flex items-end justify-between mb-12">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900">جدیدترین دوره‌ها</h2>
                    <a href="#" className="hidden md:flex items-center gap-2 text-slate-600 font-bold hover:text-indigo-600 transition-all hover:gap-3">مشاهده همه <ArrowLeft size={20} /></a>
                </div>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(n => <div key={n} className="bg-white rounded-[1.5rem] h-[420px] border border-slate-100 shadow-sm p-4 animate-pulse"><div className="h-56 bg-slate-100 rounded-2xl mb-5"></div><div className="h-6 bg-slate-100 rounded-lg w-3/4 mb-3"></div></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.length > 0 ? courses.map(course => <CourseCard key={course.id} course={course} />) : <div className="col-span-3 text-center py-10 text-slate-500">دوره‌ای یافت نشد.</div>}
                    </div>
                )}
            </section>
        </div>
    );
};
export default Home;