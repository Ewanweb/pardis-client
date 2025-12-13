import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, BookOpen, Award, Clock, Camera, Edit2, LogOut, Settings, LayoutDashboard, Shield, ChevronLeft, Calendar, CheckCircle2, TrendingUp, Zap, Activity, Bell, MapPin, Video, MonitorPlay, Hourglass, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/UI';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { getImageUrl, translateRole } from '../services/Libs';
import { useNavigate } from 'react-router-dom';





const UserProfile = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // استیت دوره‌های من
    const [myCourses, setMyCourses] = useState([]);

    const [formData, setFormData] = useState({
        name: user?.name || user?.fullName || '',
        email: user?.email || '',
        mobile: user?.mobile || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const userRoleLabel = user?.roles?.[0] ? translateRole(user.roles[0]) : 'دانشجو';

    // دریافت دوره‌ها
    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const response = await api.get('/courses/my-enrollments');
                const data = response.data?.data || response.data || [];
                setMyCourses(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching my courses:", err);
                setMyCourses([]);
            }
        };

        fetchMyCourses();
    }, []);

    // تفکیک دوره‌ها
    const activeCourses = myCourses.filter(c => !c.isCompleted);
    const completedCourses = myCourses.filter(c => c.isCompleted);

    // --- کامپوننت‌های داخلی ---

    const StatCard = ({ iconType, label, value, color, bgClass, trend }) => {
        const getIcon = () => {
            switch (iconType) {
                case 'courses':
                    return <BookOpen size={28} strokeWidth={1.5} />;
                case 'hours':
                    return <Clock size={28} strokeWidth={1.5} />;
                case 'certificates':
                    return <Award size={28} strokeWidth={1.5} />;
                default:
                    return <User size={28} strokeWidth={1.5} />;
            }
        };

        return (
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group cursor-default">
                <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 group-hover:scale-125 transition-transform duration-700 ${bgClass}`}></div>
                <div className={`absolute -bottom-10 -left-10 w-24 h-24 rounded-full opacity-10 group-hover:scale-125 transition-transform duration-700 delay-75 ${bgClass}`}></div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</span>
                        <h4 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{value}</h4>
                        {trend && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full w-fit mt-1">
                                <TrendingUp size={10} /> {trend}
                            </span>
                        )}
                    </div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 ${color}`}>
                        {getIcon()}
                    </div>
                </div>
            </div>
        );
    };

    // ✅ کارت هوشمند دوره (بروزرسانی شده برای پشتیبانی از زمان‌بندی)
    const LiveCourseItem = ({ title, type, schedule, image, instructor, isCompleted, isStarted, location, slug, id, schedules }) => {
        const courseType = (type || 'online').toLowerCase();

        // تنظیمات پیش‌فرض (آنلاین)
        let config = {
            badgeText: 'آنلاین (ویدیو)',
            badgeColor: 'bg-indigo-500/90 text-white',
            icon: MonitorPlay,
            iconColor: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600',
            locationTitle: 'پلتفرم برگزاری',
            locationValue: location || 'اسپات پلیر / سایت',
            actionText: 'مشاهده دوره',
            actionIcon: Zap,
            btnClass: 'bg-indigo-600 hover:bg-indigo-700',
            isLocal: false
        };

        if (courseType === 'live') {
            config = {
                badgeText: 'لایو (وبینار)',
                badgeColor: 'bg-sky-500/90 text-white animate-pulse',
                icon: Radio,
                iconColor: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600',
                locationTitle: 'لینک وبینار',
                locationValue: location || 'اسکای‌روم',
                actionText: 'ورود به کلاس',
                actionIcon: Video,
                btnClass: 'bg-sky-600 hover:bg-sky-700',
                isLocal: false
            };
        } else if (courseType === 'local') {
            config = {
                badgeText: 'حضوری',
                badgeColor: 'bg-rose-500/90 text-white',
                icon: MapPin,
                iconColor: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600',
                locationTitle: 'محل برگزاری',
                locationValue: location || 'تهران (نامشخص)',
                actionText: 'مسیریابی',
                actionIcon: MapPin,
                btnClass: 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900',
                isLocal: true
            };
        }

        if (isCompleted) {
            config.badgeText = 'پایان یافته';
            config.badgeColor = 'bg-slate-600/90 text-white';
        }

        return (
            <div className={`flex flex-col md:flex-row gap-6 p-5 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group relative overflow-hidden ${isCompleted ? 'opacity-80 grayscale hover:grayscale-0' : ''}`}>

                {/* Image Section */}
                <div className="w-full md:w-56 h-48 md:h-auto min-h-[140px] rounded-[2rem] overflow-hidden shrink-0 relative shadow-md">
                    <img
                        src={getImageUrl(image) || "https://placehold.co/600x400/1e1b4b/FFF?text=Pardis"}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => e.target.src = "https://placehold.co/600x400/1e1b4b/FFF?text=Error"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>

                    {/* Badge */}
                    <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-md shadow-lg border border-white/10 ${config.badgeColor}`}>
                            <config.icon size={12} />
                            {config.badgeText}
                        </span>
                    </div>

                    {/* نمایش زمان‌بندی */}
                    {(schedules && schedules.length > 0) ? (
                        <div className="absolute bottom-3 right-3 text-white text-xs font-bold flex items-center gap-1.5">
                            <Calendar size={14} className="text-primary-light" />
                            {schedules[0].fullScheduleText || schedules[0].timeRange}
                        </div>
                    ) : schedule && (
                        <div className="absolute bottom-3 right-3 text-white text-xs font-bold flex items-center gap-1.5">
                            <Calendar size={14} className="text-primary-light" />
                            {schedule}
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col justify-center py-2 relative z-10">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h4 className="font-bold text-xl text-slate-800 dark:text-white line-clamp-1 mb-2 group-hover:text-primary transition-colors">{title}</h4>
                            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg"><User size={12} className="text-primary" /> {instructor}</span>

                                {/* ✅ نمایش وضعیت دقیق برگزاری */}
                                <span className={`flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg ${isCompleted ? 'text-emerald-600' : isStarted ? 'text-indigo-600' : 'text-amber-500'}`}>
                                    {isCompleted ? <CheckCircle2 size={12} /> : isStarted ? <Activity size={12} /> : <Hourglass size={12} />}
                                    {isCompleted ? 'تکمیل شده' : isStarted ? 'در حال برگزاری' : 'در انتظار شروع'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Location / Action Area */}
                    <div className="mt-auto bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.iconColor}`}>
                                <config.icon size={20} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                                    {config.locationTitle}
                                </p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-1" title={config.locationValue}>
                                    {config.locationValue}
                                </p>
                            </div>
                        </div>

                        {/* دکمه عملیات */}
                        {isCompleted ? (
                            <Button variant="outline" className="w-full sm:w-auto !px-6 !py-2.5 !text-xs !rounded-xl !border-emerald-500 !text-emerald-600 hover:!bg-emerald-50 dark:!bg-transparent dark:hover:!bg-emerald-900/20">
                                دریافت گواهینامه
                            </Button>
                        ) : courseType === 'online' ? (
                            <Button
                                onClick={() => navigate(`/course/${slug || id}`)}
                                className={`w-full sm:w-auto !px-6 !py-2.5 !text-xs !rounded-xl shadow-none ${config.btnClass}`}
                            >
                                <config.actionIcon size={14} className="ml-1" /> {config.actionText}
                            </Button>
                        ) : location ? (
                            <Button
                                onClick={() => window.open(location, '_blank')}
                                className={`w-full sm:w-auto !px-6 !py-2.5 !text-xs !rounded-xl shadow-none ${config.btnClass}`}
                            >
                                <config.actionIcon size={14} className="ml-1" /> {config.actionText}
                            </Button>
                        ) : (
                            <Button variant="outline" className="w-full sm:w-auto !px-6 !py-2.5 !text-xs !rounded-xl !border-slate-300 !text-slate-500 cursor-not-allowed opacity-50">
                                لینک در دسترس نیست
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const TabButton = ({ id, label, active, onClick }) => {
        const getIcon = () => {
            switch (id) {
                case 'overview':
                    return <Activity size={20} />;
                case 'courses':
                    return <BookOpen size={20} />;
                case 'settings':
                    return <Settings size={20} />;
                default:
                    return <User size={20} />;
            }
        };

        return (
            <button
                onClick={onClick}
                className={`group flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-sm w-full text-right relative overflow-hidden border
                ${active
                        ? 'bg-white dark:bg-slate-800 text-primary border-primary/10 shadow-lg shadow-primary/5'
                        : 'bg-transparent text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
            >
                {active && <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full"></div>}
                <div className={`p-2.5 rounded-xl transition-colors duration-300 ${active ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                    {getIcon()}
                </div>
                <span>{label}</span>
                {active && <ChevronLeft size={16} className="mr-auto text-primary animate-pulse" />}
            </button>
        );
    };

    // --- هندلرها ---

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1500));
            toast.success('اطلاعات با موفقیت ذخیره شد ✨');
        } catch {
            toast.error('خطا در بروزرسانی اطلاعات');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-28 pb-20 bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-300 font-sans selection:bg-primary selection:text-white">

            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px]"></div>
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-500/5 blur-[120px]"></div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">

                {/* 1. HEADER & COVER */}
                <div className="relative mb-16 animate-in fade-in slide-in-from-top-8 duration-1000">
                    <div className="h-64 md:h-80 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[3rem] relative overflow-hidden shadow-2xl shadow-slate-900/20 border border-white/10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/40 via-transparent to-transparent opacity-60"></div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-10 right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                        <div className="absolute top-8 right-8">
                            <div className="bg-black/30 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 text-white text-xs font-bold shadow-lg">
                                <Shield size={14} className="text-amber-400" />
                                <span>{userRoleLabel}</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 md:px-12">
                        <div className="flex flex-col md:flex-row items-end -mt-20 gap-8 relative z-20">
                            <div className="relative group">
                                <div className="w-36 h-36 md:w-48 md:h-48 rounded-[2.5rem] border-[6px] border-white dark:border-[#020617] bg-white dark:bg-slate-800 shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-500 ease-out overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-6xl font-black text-white drop-shadow-md select-none">
                                            {(user?.name || user?.fullName || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <button className="absolute bottom-2 -right-2 p-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-2xl shadow-lg hover:scale-110 hover:text-primary transition-all border-4 border-slate-50 dark:border-slate-950">
                                    <Camera size={22} />
                                </button>
                            </div>

                            <div className="flex-1 pb-6 text-center md:text-right space-y-4">
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                                        {user?.fullName || user?.name}
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">عضو فعال آکادمی پردیس</p>
                                </div>

                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold shadow-sm">
                                        <Mail size={18} className="text-slate-400" /> {user?.email}
                                    </span>
                                    <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold shadow-sm">
                                        <Phone size={18} className="text-slate-400" /> {user?.mobile || 'ثبت نشده'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3 pb-6 w-full md:w-auto justify-center">
                                <Button
                                    onClick={() => setActiveTab('settings')}
                                    className="!rounded-2xl !px-8 !py-4 shadow-xl shadow-primary/20 text-base"
                                    icon={Edit2}
                                >
                                    ویرایش پروفایل
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">

                    {/* 2. SIDEBAR NAVIGATION */}
                    <div className="lg:col-span-3">
                        <div className="sticky top-24 space-y-8">
                            <div className="bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 p-6 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/30 dark:shadow-slate-900/20 backdrop-blur-sm">
                                <p className="px-6 pt-4 pb-4 text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <LayoutDashboard size={14} /> منوی کاربری
                                </p>
                                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
                                    <TabButton id="overview" label="پیشخوان" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                                    <TabButton id="courses" label="کلاس‌های من" active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} />
                                    <TabButton id="settings" label="تنظیمات حساب" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />

                                    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-4 hidden lg:block"></div>

                                    <button onClick={logout} className="group flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 w-full text-right opacity-80 hover:opacity-100">
                                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                                            <LogOut size={20} />
                                        </div>
                                        <span>خروج از حساب</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. MAIN CONTENT AREA */}
                    <div className="lg:col-span-9">

                        {/* TAB: OVERVIEW */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <StatCard iconType="courses" label="کلاس‌های فعال" value={activeCourses.length} color="bg-indigo-500" bgClass="bg-indigo-500" trend={activeCourses.length} />
                                    <StatCard iconType="hours" label="ساعات حضور" value="0h" color="bg-amber-500" bgClass="bg-amber-500" trend="0" />
                                    <StatCard iconType="certificates" label="گواهی‌نامه‌ها" value={completedCourses.length} color="bg-emerald-500" bgClass="bg-emerald-500" />
                                </div>

                                <div className="bg-white dark:bg-slate-900 p-1 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <div className="p-8 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">دسترسی سریع</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">آخرین دوره‌هایی که در آن‌ها ثبت‌نام کرده‌اید</p>
                                        </div>
                                        <Button variant="ghost" className="!text-xs" onClick={() => setActiveTab('courses')}>مشاهده همه</Button>
                                    </div>
                                    <div className="grid gap-6 px-6 pb-6">
                                        {/* نمایش ۲ دوره آخر فعال به عنوان دسترسی سریع */}
                                        {activeCourses.slice(0, 2).map(course => (
                                            <LiveCourseItem
                                                key={course.id}
                                                id={course.id}
                                                slug={course.slug}
                                                title={course.title}
                                                instructor={course.instructor?.fullName || course.instructor?.name || 'مدرس'}
                                                // ✅ ارسال نوع دوره (live, local, online) از دیتابیس
                                                type={course.type || 'online'}
                                                // ✅ ارسال وضعیت‌های برگزاری
                                                isStarted={course.isStarted}
                                                isCompleted={course.isCompleted}
                                                status={course.isCompleted ? 'completed' : 'active'}
                                                schedule={course.schedule || 'برنامه زمانی ندارد'}
                                                // ✅ ارسال مکان برگزاری
                                                location={course.location || (course.type === 'local' ? 'تهران' : 'آنلاین')}
                                                // ✅ ارسال زمان‌بندی‌های دوره
                                                schedules={course.schedules || []}
                                                image={course.thumbnail}
                                            />
                                        ))}
                                        {myCourses.length === 0 && (
                                            <div className="text-center py-8 text-slate-400">هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: COURSES (My Classes) - UPDATED */}
                        {activeTab === 'courses' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

                                {/* 1. کلاس‌های فعال */}
                                <div>
                                    <div className="flex items-center justify-between mb-8 px-2">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                                                کلاس‌های فعال من
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">دوره‌هایی که در حال حاضر در آن‌ها شرکت می‌کنید</p>
                                        </div>
                                        <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-800 text-sm font-bold shadow-sm">
                                            {activeCourses.length} کلاس فعال
                                        </div>
                                    </div>

                                    {activeCourses.length > 0 ? (
                                        <div className="grid gap-8">
                                            {activeCourses.map(course => (
                                                <LiveCourseItem
                                                    key={course.id}
                                                    id={course.id}
                                                    slug={course.slug}
                                                    title={course.title}
                                                    instructor={course.instructor?.fullName || course.instructor?.name || 'مدرس'}
                                                    // ✅ نوع و مکان از دیتابیس
                                                    type={course.type || 'online'}
                                                    location={course.location}
                                                    // ✅ وضعیت دقیق
                                                    isStarted={course.isStarted}
                                                    isCompleted={course.isCompleted}
                                                    status="active" // چون در لیست فعال‌هاست
                                                    schedule={course.schedule || 'برنامه زمانی ندارد'}
                                                    // ✅ ارسال زمان‌بندی‌های دوره
                                                    schedules={course.schedules || []}
                                                    image={course.thumbnail}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50">
                                            <p className="text-slate-400 font-bold">هیچ کلاس فعالی ندارید.</p>
                                        </div>
                                    )}
                                </div>

                                {/* 2. دوره‌های تکمیل شده */}
                                {completedCourses.length > 0 && (
                                    <div className="opacity-75 hover:opacity-100 transition-opacity duration-500">
                                        <div className="flex items-center justify-between mb-8 px-2 border-t border-slate-200 dark:border-slate-800 pt-10 mt-2">
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                                    <Award size={24} className="text-amber-500" />
                                                    دوره‌های تکمیل شده
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">آرشیو دوره‌هایی که با موفقیت گذرانده‌اید</p>
                                            </div>
                                            <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-800 text-sm font-bold shadow-sm">
                                                {completedCourses.length} دوره
                                            </div>
                                        </div>
                                        <div className="grid gap-8">
                                            {completedCourses.map(course => (
                                                <LiveCourseItem
                                                    key={course.id}
                                                    id={course.id}
                                                    slug={course.slug}
                                                    title={course.title}
                                                    instructor={course.instructor?.fullName || course.instructor?.name || 'مدرس'}
                                                    type={course.type || 'online'}
                                                    location={course.location}
                                                    // ✅ وضعیت تکمیل شده
                                                    isCompleted={true}
                                                    status="completed"
                                                    schedule="پایان یافته"
                                                    // ✅ ارسال زمان‌بندی‌های دوره
                                                    schedules={course.schedules || []}
                                                    image={course.thumbnail}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB: SETTINGS (Same as before) */}
                        {activeTab === 'settings' && (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                                <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
                                    <div className="flex items-center gap-5 mb-10 pb-8 border-b border-slate-100 dark:border-slate-800">
                                        <div className="w-16 h-16 rounded-3xl bg-primary/10 dark:bg-slate-800 flex items-center justify-center text-primary shadow-inner"><Edit2 size={28} /></div>
                                        <div><h3 className="text-2xl font-black text-slate-800 dark:text-white">ویرایش اطلاعات</h3><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">اطلاعات شخصی و امنیتی خود را بروزرسانی کنید</p></div>
                                    </div>
                                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3"><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1"><User size={14} /> نام و نام خانوادگی</label><div className="relative group"><input name="name" value={formData.name} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-primary dark:focus:border-primary outline-none transition-all dark:text-white font-bold text-sm focus:shadow-xl focus:shadow-primary/10" /></div></div>
                                            <div className="space-y-3"><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1"><Phone size={14} /> شماره موبایل</label><div className="relative group"><input name="mobile" value={formData.mobile} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-primary dark:focus:border-primary outline-none transition-all dark:text-white font-bold text-sm focus:shadow-xl focus:shadow-primary/10" /></div></div>
                                        </div>
                                        <div className="space-y-3"><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1"><Mail size={14} /> ایمیل (غیرقابل تغییر)</label><div className="relative opacity-60"><input value={formData.email} readOnly className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-100 dark:border-slate-800 outline-none cursor-not-allowed dark:text-slate-400 font-bold dir-ltr text-left text-sm" /></div></div>
                                        <div className="pt-8 border-t border-slate-100 dark:border-slate-800"><h4 className="text-base font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><span className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-lg"><Lock size={18} /></span> تغییر رمز عبور</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="relative group"><input type="password" name="newPassword" placeholder="رمز عبور جدید" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-primary outline-none transition-all dark:text-white text-sm font-bold" /></div><div className="relative group"><input type="password" name="confirmPassword" placeholder="تکرار رمز عبور جدید" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-primary outline-none transition-all dark:text-white text-sm font-bold" /></div></div></div>
                                        <div className="flex justify-end pt-6"><Button type="submit" disabled={loading} className="!px-10 !py-4 !rounded-2xl !text-base shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all">{loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</Button></div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;