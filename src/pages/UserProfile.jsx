import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { User, Mail, Phone, Lock, BookOpen, Award, Clock, Camera, Edit2, LogOut, Settings, LayoutDashboard, Shield, ChevronLeft, Calendar, CheckCircle2, TrendingUp, Zap, Activity, Bell, MapPin, Video, MonitorPlay, Hourglass, Radio, CreditCard, Monitor, Smartphone, Tablet, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/UI';
import { useAlert } from '../hooks/useAlert';
import { useCourses } from '../hooks/useCourses';
import { getImageUrl, translateRole } from '../services/Libs';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import InstallmentPayment from '../components/InstallmentPayment';
import SeoHead from '../components/Seo/SeoHead';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import Avatar from '../components/Avatar';
import UserAvatar from '../components/UserAvatar';





const UserProfile = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
    const navigate = useNavigate();
    const alert = useAlert();

    // استفاده از Hook جدید برای مدیریت دوره‌ها
    const {
        courses: myCourses,
        stats: courseStats,
        loading: coursesLoading,
        error: _coursesError,
        refreshCourses,
        getCategorizedCourses,
        checkEnrollmentStatus: _checkEnrollmentStatus,
        hasError: hasCoursesError,
        isEmpty: _hasNoCourses
    } = useCourses();

    const [formData, setFormData] = useState({
        name: user?.name || user?.fullName || '',
        email: user?.email || '',
        mobile: user?.mobile || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [myPayments, setMyPayments] = useState([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [authLogs, setAuthLogs] = useState([]);
    const [authLogsLoading, setAuthLogsLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'payments') {
            fetchPaymentHistory();
        }
        if (activeTab === 'security') {
            fetchAuthLogs();
        }
    }, [activeTab]);

    const fetchAuthLogs = async () => {
        setAuthLogsLoading(true);
        try {
            const result = await apiClient.get('/auth/authLog');
            if (result.success) {
                setAuthLogs(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching auth logs:', error);
        } finally {
            setAuthLogsLoading(false);
        }
    };

    const fetchPaymentHistory = async () => {
        setPaymentsLoading(true);
        try {
            const result = await apiClient.get('/me/payments');
            if (result.success) {
                setMyPayments(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching payment history:', error);
        } finally {
            setPaymentsLoading(false);
        }
    };

    const userRoleLabel = user?.roles?.[0] ? translateRole(user.roles[0]) : 'دانشجو';

    // دریافت دوره‌های دسته‌بندی شده
    const categorizedCourses = getCategorizedCourses();
    const safeActiveCourses = Array.isArray(categorizedCourses.active) ? categorizedCourses.active : [];
    const safeCompletedCourses = Array.isArray(categorizedCourses.completed) ? categorizedCourses.completed : [];

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

        // Defensive checks to prevent React error #130
        const safeLabel = label || '';
        const safeValue = value || '0';
        const safeColor = color || 'bg-primary-500';
        const safeBgClass = bgClass || 'bg-primary-500';

        return (
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group cursor-default">
                <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 group-hover:scale-125 transition-transform duration-700 ${safeBgClass}`}></div>
                <div className={`absolute -bottom-10 -left-10 w-24 h-24 rounded-full opacity-10 group-hover:scale-125 transition-transform duration-700 delay-75 ${safeBgClass}`}></div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{safeLabel}</span>
                        <h4 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{safeValue}</h4>
                        {trend && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full w-fit mt-1">
                                <TrendingUp size={10} /> {trend}
                            </span>
                        )}
                    </div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 ${safeColor}`}>
                        {getIcon()}
                    </div>
                </div>
            </div>
        );
    };

    // PropTypes for StatCard
    StatCard.propTypes = {
        iconType: PropTypes.oneOf(['courses', 'hours', 'certificates']),
        label: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        color: PropTypes.string,
        bgClass: PropTypes.string,
        trend: PropTypes.string
    };

    // ✅ کارت هوشمند دوره (بروزرسانی شده برای پشتیبانی از زمان‌بندی)
    const LiveCourseItem = ({ title, type, schedule, image, instructor, isCompleted, isStarted, location, slug, id, schedules }) => {
        const courseType = (type || 'Online').toLowerCase();

        // تنظیمات پیش‌فرض (آنلاین)
        let config = {
            badgeText: 'آنلاین (ویدیو)',
            badgeColor: 'bg-primary-500/90 text-white',
            icon: MonitorPlay,
            iconColor: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600',
            locationTitle: 'پلتفرم برگزاری',
            locationValue: location || 'اسپات پلیر / سایت',
            actionText: 'مشاهده دوره',
            actionIcon: Zap,
            btnClass: 'bg-primary-600 hover:bg-primary-700',
            isLocal: false
        };

        if (courseType === 'inperson') {
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
        } else if (courseType === 'hybrid') {
            config = {
                badgeText: 'ترکیبی (آنلاین + حضوری)',
                badgeColor: 'bg-sky-500/90 text-white animate-pulse',
                icon: Radio,
                iconColor: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600',
                locationTitle: 'محل برگزاری',
                locationValue: location || 'آنلاین + حضوری',
                actionText: 'مشاهده جزئیات',
                actionIcon: Video,
                btnClass: 'bg-sky-600 hover:bg-sky-700',
                isLocal: false
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
                                <span className={`flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg ${isCompleted ? 'text-secondary-600' : isStarted ? 'text-primary-600' : 'text-amber-500'}`}>
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

    // PropTypes for LiveCourseItem
    LiveCourseItem.propTypes = {
        title: PropTypes.string.isRequired,
        type: PropTypes.string,
        schedule: PropTypes.string,
        image: PropTypes.string,
        instructor: PropTypes.string,
        isCompleted: PropTypes.bool,
        isStarted: PropTypes.bool,
        location: PropTypes.string,
        slug: PropTypes.string,
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        schedules: PropTypes.array
    };

    const TabButton = ({ id, label, active, onClick }) => {
        const getIcon = () => {
            switch (id) {
                case 'overview':
                    return <Activity size={20} />;
                case 'courses':
                    return <BookOpen size={20} />;
                case 'payments':
                    return <CreditCard size={20} />;
                case 'security':
                    return <Shield size={20} />;
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

    // PropTypes for TabButton
    TabButton.propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        active: PropTypes.bool.isRequired,
        onClick: PropTypes.func.isRequired
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
            alert.showSuccess('اطلاعات با موفقیت ذخیره شد ✨');
        } catch {
            alert.showError('خطا در بروزرسانی اطلاعات');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SeoHead
                title="پروفایل کاربری | آکادمی پردیس توس"
                description="مدیریت دوره‌ها، اطلاعات حساب کاربری و وضعیت پرداخت‌ها."
                noIndex
                noFollow
            />
            <div className="min-h-screen pt-28 pb-20 bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-300 font-sans selection:bg-primary selection:text-white">

                {/* Background Decor */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px]"></div>
                    <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-500/5 blur-[120px]"></div>
                </div>

                <div className="container mx-auto px-4 max-w-7xl relative z-10">

                    {/* 1. HEADER & COVER */}
                    <div className="relative mb-16 animate-in fade-in slide-in-from-top-8 duration-1000">
                        <div className="h-64 md:h-80 bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 rounded-[3rem] relative overflow-hidden shadow-2xl shadow-slate-900/20 border border-white/10">
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
                                        <UserAvatar
                                            user={user}
                                            size="3xl"
                                            className="!w-full !h-full !rounded-none"
                                        />
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
                                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">عضو فعال آکادمی پردیس توس</p>
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
                                        onClick={() => setIsProfileEditModalOpen(true)}
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
                                        <TabButton id="payments" label="پرداخت‌ها" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
                                        <TabButton id="security" label="امنیت و ورود" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
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
                                        <StatCard
                                            iconType="courses"
                                            label="کلاس‌های فعال"
                                            value={courseStats.active}
                                            color="bg-primary-500"
                                            bgClass="bg-primary-500"
                                            trend={courseStats.active > 0 ? `${courseStats.active} فعال` : null}
                                        />
                                        <StatCard
                                            iconType="hours"
                                            label="ساعات آموزش"
                                            value={`${courseStats.totalHours}h`}
                                            color="bg-amber-500"
                                            bgClass="bg-amber-500"
                                            trend={courseStats.totalHours > 0 ? `${courseStats.totalHours} ساعت` : null}
                                        />
                                        <StatCard
                                            iconType="certificates"
                                            label="گواهی‌نامه‌ها"
                                            value={courseStats.certificates}
                                            color="bg-emerald-500"
                                            bgClass="bg-emerald-500"
                                            trend={courseStats.certificates > 0 ? `${courseStats.certificates} گواهی` : null}
                                        />
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
                                            {Array.isArray(safeActiveCourses) && safeActiveCourses.slice(0, 2).map(course => (
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
                                                    location={course.location || (course.type === 'InPerson' ? 'محل نامشخص' : 'لینک نامشخص')}
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

                                    {/* Header با دکمه تازه‌سازی */}
                                    <div className="flex items-center justify-between mb-8 px-2">
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                                <BookOpen size={28} className="text-primary-500" />
                                                کلاس‌های من
                                            </h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                                مدیریت و مشاهده دوره‌های ثبت‌نام شده
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {hasCoursesError && (
                                                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-xl text-sm font-medium">
                                                    خطا در بارگذاری
                                                </div>
                                            )}
                                            <Button
                                                variant="outline"
                                                onClick={refreshCourses}
                                                disabled={coursesLoading}
                                                className="!px-4 !py-2 !text-sm"
                                            >
                                                {coursesLoading ? (
                                                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    '🔄 تازه‌سازی'
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* نمایش آمار کلی */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                                            <div className="text-2xl font-bold text-primary-600">{courseStats.total}</div>
                                            <div className="text-xs text-slate-500">کل دوره‌ها</div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                                            <div className="text-2xl font-bold text-emerald-600">{courseStats.active}</div>
                                            <div className="text-xs text-slate-500">فعال</div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                                            <div className="text-2xl font-bold text-amber-600">{courseStats.completed}</div>
                                            <div className="text-xs text-slate-500">تکمیل شده</div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                                            <div className="text-2xl font-bold text-purple-600">{courseStats.totalHours}h</div>
                                            <div className="text-xs text-slate-500">ساعات آموزش</div>
                                        </div>
                                    </div>

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
                                            <div className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-2xl border border-primary-100 dark:border-primary-800 text-sm font-bold shadow-sm">
                                                {courseStats.active} کلاس فعال
                                            </div>
                                        </div>

                                        {safeActiveCourses.length > 0 ? (
                                            <div className="grid gap-8">
                                                {safeActiveCourses.map(course => (
                                                    <LiveCourseItem
                                                        key={course.id}
                                                        id={course.id}
                                                        slug={course.slug}
                                                        title={course.title}
                                                        instructor={course.instructor?.fullName || course.instructor?.name || 'مدرس'}
                                                        type={course.type || 'online'}
                                                        location={course.location}
                                                        isStarted={course.isStarted}
                                                        isCompleted={course.isCompleted}
                                                        status="active"
                                                        schedule={course.schedule || 'برنامه زمانی ندارد'}
                                                        schedules={course.schedules || []}
                                                        image={course.thumbnail}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <BookOpen size={32} className="text-slate-400" />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                                    هیچ دوره فعالی ندارید
                                                </h3>
                                                <p className="text-slate-500 dark:text-slate-400 mb-6">
                                                    {coursesLoading ? 'در حال بارگذاری...' : 'برای شروع یادگیری، در دوره‌ای ثبت‌نام کنید'}
                                                </p>
                                                {!coursesLoading && (
                                                    <Button
                                                        onClick={() => navigate('/')}
                                                        className="!px-8 !py-3"
                                                    >
                                                        مشاهده دوره‌ها
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* 2. دوره‌های تکمیل شده */}
                                    {safeCompletedCourses.length > 0 && (
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
                                                    {safeCompletedCourses.length} دوره
                                                </div>
                                            </div>
                                            <div className="grid gap-8">
                                                {safeCompletedCourses.map(course => (
                                                    <LiveCourseItem
                                                        key={course.id}
                                                        id={course.id}
                                                        slug={course.slug}
                                                        title={course.title}
                                                        instructor={course.instructor?.fullName || course.instructor?.name || 'مدرس'}
                                                        type={course.type || 'online'}
                                                        location={course.location}
                                                        isCompleted={true}
                                                        status="completed"
                                                        schedule="پایان یافته"
                                                        schedules={course.schedules || []}
                                                        image={course.thumbnail}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB: PAYMENTS */}
                            {activeTab === 'payments' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                                        <div className="flex items-center gap-5 mb-8">
                                            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 dark:bg-slate-800 flex items-center justify-center text-emerald-500 shadow-inner">
                                                <CreditCard size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-800 dark:text-white">مدیریت پرداخت‌ها</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">وضعیت پرداخت‌ها و اقساط دوره‌های شما</p>
                                            </div>
                                        </div>

                                        {/* Transaction History Section */}
                                        <div className="mb-12">
                                            <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-6">تاریخچه تراکنش‌ها و سفارش‌ها</h4>

                                            {paymentsLoading ? (
                                                <div className="flex justify-center py-10">
                                                    <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                                                </div>
                                            ) : myPayments.length === 0 ? (
                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-center border border-dashed border-slate-300 dark:border-slate-600">
                                                    <p className="text-slate-500">تاریخچه تراکنشی یافت نشد</p>
                                                </div>
                                            ) : (
                                                <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-2xl">
                                                    <table className="w-full text-right border-collapse">
                                                        <thead>
                                                            <tr className="bg-slate-50 dark:bg-slate-800">
                                                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">سفارش/تراکنش</th>
                                                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">تاریخ</th>
                                                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">مبلغ</th>
                                                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">وضعیت</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                            {myPayments.map((order) => (
                                                                <React.Fragment key={order.orderId}>
                                                                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                                        <td className="p-4">
                                                                            <p className="font-bold text-slate-800 dark:text-white">{order.orderNumber}</p>
                                                                            <p className="text-xs text-slate-500">{order.courseCount} دوره</p>
                                                                        </td>
                                                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                                                            {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                                                                        </td>
                                                                        <td className="p-4 font-bold text-slate-800 dark:text-white text-sm">
                                                                            {order.totalAmount.toLocaleString()} تومان
                                                                        </td>
                                                                        <td className="p-4">
                                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                                                }`}>
                                                                                {order.statusText}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                    {/* Payment Attempts for this order */}
                                                                    {order.paymentAttempts && order.paymentAttempts.map(attempt => (
                                                                        <tr key={attempt.paymentAttemptId} className="bg-slate-50/30 dark:bg-slate-900/10 text-xs">
                                                                            <td className="p-2 pr-8 text-slate-500">
                                                                                ↳ {attempt.methodText} ({attempt.trackingCode})
                                                                            </td>
                                                                            <td className="p-2 text-slate-400">
                                                                                {new Date(attempt.createdAt).toLocaleDateString('fa-IR')}
                                                                            </td>
                                                                            <td className="p-2 text-slate-500">
                                                                                {attempt.amount.toLocaleString()} تومان
                                                                            </td>
                                                                            <td className="p-2">
                                                                                <span className={attempt.status === 4 ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                                                                                    {attempt.statusText}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </React.Fragment>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>

                                        <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-6">اقساط و جزئیات پرداخت</h4>


                                        {myCourses.length === 0 ? (
                                            <div className="text-center py-12">
                                                <CreditCard className="mx-auto text-slate-400 mb-4" size={48} />
                                                <h4 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">
                                                    هیچ دوره‌ای یافت نشد
                                                </h4>
                                                <p className="text-slate-500 dark:text-slate-400">
                                                    ابتدا در دوره‌ای ثبت‌نام کنید تا بتوانید پرداخت‌هایتان را مدیریت کنید
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {Array.isArray(myCourses) && myCourses.map((course) => (
                                                    <div key={course.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                                                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                                                                        {course.title}
                                                                    </h4>
                                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                        مدرس: {course.instructor?.fullName || course.instructor?.name || 'نامشخص'}
                                                                    </p>
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="text-sm text-slate-500 dark:text-slate-400">قیمت دوره</p>
                                                                    <p className="text-lg font-bold text-slate-800 dark:text-white">
                                                                        {course.price ? `${course.price.toLocaleString()} تومان` : 'رایگان'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Installment Payment Component */}
                                                        {course.enrollmentId && course.price > 0 && (
                                                            <div className="p-6">
                                                                <InstallmentPayment
                                                                    enrollmentId={course.enrollmentId}
                                                                    courseName={course.title}
                                                                    onPaymentSuccess={() => {
                                                                        // Refresh courses data after payment
                                                                        window.location.reload();
                                                                    }}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Free Course Message */}
                                                        {course.price === 0 && (
                                                            <div className="p-6 text-center">
                                                                <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={32} />
                                                                <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                                                                    این دوره رایگان است
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB: SETTINGS (Same as before) */}
                            {activeTab === 'security' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                                        <div className="flex items-center gap-5 mb-8">
                                            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 dark:bg-slate-800 flex items-center justify-center text-emerald-500 shadow-inner">
                                                <Shield size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-800 dark:text-white">امنیت و تاریخچه ورود</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">مشاهده آخرین ورودهای شما به سیستم</p>
                                            </div>
                                        </div>

                                        {authLogsLoading ? (
                                            <div className="flex justify-center py-10">
                                                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                                            </div>
                                        ) : authLogs.length === 0 ? (
                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center border border-dashed border-slate-300 dark:border-slate-600">
                                                <Shield size={48} className="mx-auto text-slate-400 mb-4" />
                                                <p className="text-slate-500 font-medium">تاریخچه ورودی یافت نشد</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {authLogs.map((log, index) => {
                                                    // تشخیص نوع دستگاه از Client
                                                    const getDeviceInfo = (client) => {
                                                        const lowerClient = (client || '').toLowerCase();
                                                        if (lowerClient.includes('mobile') || lowerClient.includes('android') || lowerClient.includes('iphone')) {
                                                            return { icon: Smartphone, label: 'موبایل', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' };
                                                        } else if (lowerClient.includes('tablet') || lowerClient.includes('ipad')) {
                                                            return { icon: Tablet, label: 'تبلت', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' };
                                                        } else if (lowerClient.includes('windows') || lowerClient.includes('mac') || lowerClient.includes('linux')) {
                                                            return { icon: Monitor, label: 'کامپیوتر', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
                                                        }
                                                        return { icon: Globe, label: 'مرورگر', color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800' };
                                                    };

                                                    const deviceInfo = getDeviceInfo(log.client);
                                                    const DeviceIcon = deviceInfo.icon;
                                                    const isRecent = index === 0;

                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`relative flex items-center gap-6 p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${isRecent
                                                                ? 'bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-primary-200 dark:border-primary-800 shadow-md'
                                                                : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800'
                                                                }`}
                                                        >
                                                            {isRecent && (
                                                                <div className="absolute top-3 left-3">
                                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary-500 text-white text-[10px] font-bold shadow-lg">
                                                                        <Activity size={10} />
                                                                        ورود فعلی
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Device Icon */}
                                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${deviceInfo.bg}`}>
                                                                <DeviceIcon size={24} className={deviceInfo.color} />
                                                            </div>

                                                            {/* Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <h4 className="font-bold text-slate-800 dark:text-white text-base">
                                                                        {deviceInfo.label}
                                                                    </h4>
                                                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                                        {log.client || 'نامشخص'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                                                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                                                        <Globe size={14} className="text-slate-400" />
                                                                        <span className="font-mono">{log.ip || 'نامشخص'}</span>
                                                                    </span>
                                                                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                                                        <Clock size={14} className="text-slate-400" />
                                                                        {log.createdAt ? new Date(log.createdAt).toLocaleString('fa-IR', {
                                                                            year: 'numeric',
                                                                            month: 'long',
                                                                            day: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        }) : 'نامشخص'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Status Indicator */}
                                                            <div className="shrink-0">
                                                                <div className={`w-3 h-3 rounded-full ${isRecent ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Security Tips */}
                                        <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                                    <Shield size={20} className="text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-amber-900 dark:text-amber-200 mb-2">نکات امنیتی</h4>
                                                    <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
                                                        <li>• اگر ورودی مشکوک مشاهده کردید، فوراً رمز عبور خود را تغییر دهید</li>
                                                        <li>• از رمز عبور قوی و منحصر به فرد استفاده کنید</li>
                                                        <li>• هرگز رمز عبور خود را با دیگران به اشتراک نگذارید</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                                            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                                <h4 className="text-base font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                                    <span className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-lg">
                                                        <Lock size={18} />
                                                    </span>
                                                    تغییر رمز عبور
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="relative group">
                                                        <input type="password" name="newPassword" placeholder="رمز عبور جدید" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-primary outline-none transition-all dark:text-white text-sm font-bold" />
                                                    </div>
                                                    <div className="relative group">
                                                        <input type="password" name="confirmPassword" placeholder="تکرار رمز عبور جدید" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-primary outline-none transition-all dark:text-white text-sm font-bold" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-6"><Button type="submit" disabled={loading} className="!px-10 !py-4 !rounded-2xl !text-base shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all">{loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</Button></div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div >

            {/* Profile Edit Modal */}
            < ProfileEditModal
                isOpen={isProfileEditModalOpen}
                onClose={() => setIsProfileEditModalOpen(false)}
            />
        </>
    );
};

export default UserProfile;
