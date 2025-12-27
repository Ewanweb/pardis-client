import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, MessageCircle, Calendar, DollarSign, Users, TrendingUp, CheckCircle2, AlertTriangle, Star, Eye, Filter, CalendarDays } from 'lucide-react';
import { Button, Badge } from '../../components/UI';
import { AdminCard } from '../../components/AdminCard';
import AttendanceManagement from '../../components/AttendanceManagement';
import StudentFinancialProfile from '../../components/StudentFinancialProfile';
import { api } from '../../services/api';
import { formatPrice, formatDate, getImageUrl } from '../../services/Libs';
import { APIErrorAlert } from '../../components/Alert';
import BackendStatus from '../../components/BackendStatus';
import toast from 'react-hot-toast';

const getDayName = (dayOfWeek) => {
    const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
    return days[dayOfWeek] || 'نامشخص';
};

const ScheduleCard = ({ schedule, courseId }) => {
    const [scheduleStudents, setScheduleStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [showStudents, setShowStudents] = useState(false);

    const handleViewStudents = async () => {
        if (showStudents) {
            setShowStudents(false);
            return;
        }

        try {
            setStudentsLoading(true);
            const response = await api.get(`/courses/${courseId}/schedules/${schedule.id}/students`);
            const studentsData = response.data?.data || response.data || [];

            setScheduleStudents(Array.isArray(studentsData) ? studentsData : []);
            setShowStudents(true);

            if (studentsData.length === 0) {
                toast('هیچ دانشجویی در این زمان‌بندی ثبت‌نام نکرده است');
            }
        } catch (error) {
            console.error('Error fetching schedule students:', error);
            if (error.response?.status === 404) {
                setScheduleStudents([]);
                setShowStudents(true);
                toast('هیچ دانشجویی در این زمان‌بندی ثبت‌نام نکرده است');
            } else {
                toast.error('خطا در دریافت لیست دانشجویان');
            }
        } finally {
            setStudentsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <h4 className="text-xl font-bold text-slate-800 dark:text-white">
                                {schedule.title}
                            </h4>
                            <Badge color={schedule.isActive ? 'emerald' : 'red'} size="sm">
                                {schedule.isActive ? 'فعال' : 'غیرفعال'}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <Calendar size={16} className="text-indigo-600" />
                                <span>{getDayName(schedule.dayOfWeek)} {schedule.startTime} - {schedule.endTime}</span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <Users size={16} className="text-primary" />
                                <span>{schedule.enrolledCount || 0}/{schedule.maxCapacity} نفر</span>
                            </div>

                            {schedule.description && (
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <span className="text-sm">{schedule.description}</span>
                                </div>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                                <span>ظرفیت</span>
                                <span>{(schedule.maxCapacity || 0) - (schedule.enrolledCount || 0)} جای خالی</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${(schedule.enrolledCount || 0) / (schedule.maxCapacity || 1) > 0.8
                                        ? 'bg-red-500'
                                        : (schedule.enrolledCount || 0) / (schedule.maxCapacity || 1) > 0.6
                                            ? 'bg-amber-500'
                                            : 'bg-emerald-500'
                                        }`}
                                    style={{
                                        width: `${((schedule.enrolledCount || 0) / (schedule.maxCapacity || 1)) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mr-6">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleViewStudents}
                            disabled={studentsLoading}
                        >
                            {studentsLoading ? (
                                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin ml-1"></div>
                            ) : (
                                <Eye size={16} className="ml-1" />
                            )}
                            {showStudents ? 'مخفی کردن' : 'مشاهده دانشجویان'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Students List */}
            {showStudents && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-800/50">
                    <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-4">
                        دانشجویان ثبت‌نام شده ({scheduleStudents.length})
                    </h5>

                    {scheduleStudents.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="mx-auto text-slate-400 mb-4" size={48} />
                            <p className="text-slate-500 dark:text-slate-400">
                                هیچ دانشجویی در این زمان‌بندی ثبت‌نام نکرده است
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {scheduleStudents.map((student, index) => (
                                <div key={student.userId || index} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {student.fullName ? student.fullName.charAt(0) : 'N'}
                                            </div>

                                            {/* Student Info */}
                                            <div>
                                                <h6 className="font-bold text-slate-800 dark:text-white">
                                                    {student.fullName || 'نام نامشخص'}
                                                </h6>
                                                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                                                    <span>{student.email || 'ایمیل نامشخص'}</span>
                                                    {student.mobile && <span>{student.mobile}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status and Stats */}
                                        <div className="flex items-center gap-4">
                                            {/* Attendance */}
                                            <div className="text-center">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">حضور/غیاب</p>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-emerald-600 font-bold">{student.attendedSessions || 0}</span>
                                                    <span className="text-slate-400">/</span>
                                                    <span className="text-red-500 font-bold">{student.absentSessions || 0}</span>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <Badge
                                                color={
                                                    student.status === 'Active' ? 'emerald' :
                                                        student.status === 'Transferred' ? 'blue' :
                                                            student.status === 'Withdrawn' ? 'amber' : 'slate'
                                                }
                                                size="sm"
                                            >
                                                {student.status === 'Active' ? 'فعال' :
                                                    student.status === 'Transferred' ? 'انتقال یافته' :
                                                        student.status === 'Withdrawn' ? 'انصراف' :
                                                            student.status || 'نامشخص'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {student.instructorNotes && (
                                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">یادداشت مدرس:</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{student.instructorNotes}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const LMSManagement = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);

    // Comments state
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentFilter, setCommentFilter] = useState('all');

    // Students state
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Schedules state
    const [schedules, setSchedules] = useState([]);
    const [schedulesLoading, setSchedulesLoading] = useState(false);

    // Stats state
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        averageRating: 0,
        totalComments: 0,
        attendanceRate: 0
    });

    useEffect(() => {
        fetchCourse();
        fetchStats();
    }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (activeTab === 'comments') {
            fetchComments();
        } else if (activeTab === 'students') {
            fetchStudents();
        } else if (activeTab === 'schedules') {
            fetchSchedules();
        }
    }, [activeTab, commentFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchCourse = async () => {
        try {
            // Use the regular courses endpoint since admin-specific one doesn't exist
            const response = await api.get('/courses');
            const allCourses = response.data?.data || response.data || [];
            const foundCourse = Array.isArray(allCourses) ? allCourses.find(c => c.id === courseId) : null;
            setCourse(foundCourse);
        } catch (error) {
            console.error('Error fetching course:', error);
            setApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // استفاده از API های صحیح بر اساس Swagger
            const [commentsRes, financialRes, studentsRes] = await Promise.allSettled([
                api.get(`/admin/comments/course/${courseId}/stats`),
                api.get(`/courses/${courseId}/financial-summary`),
                api.get(`/courses/${courseId}/students`)
            ]);

            const commentsData = commentsRes.status === 'fulfilled' ? commentsRes.value.data?.data : {};
            const financialData = financialRes.status === 'fulfilled' ? financialRes.value.data?.data : {};
            const studentsData = studentsRes.status === 'fulfilled' ? studentsRes.value.data?.data : [];

            setStats({
                totalStudents: Array.isArray(studentsData) ? studentsData.length : 0,
                totalRevenue: financialData.totalRevenue || 0,
                pendingPayments: financialData.pendingPayments || 0,
                averageRating: commentsData.averageRating || 0,
                totalComments: commentsData.totalComments || 0,
                attendanceRate: financialData.attendanceRate || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Set empty stats if API calls fail
            setStats({
                totalStudents: 0,
                totalRevenue: 0,
                pendingPayments: 0,
                averageRating: 0,
                totalComments: 0,
                attendanceRate: 0
            });
        }
    };

    const fetchComments = async () => {
        setCommentsLoading(true);
        try {
            // اگر courseId موجود نباشد، لیست خالی برگردان
            if (!courseId) {
                setComments([]);
                return;
            }

            const endpoint = commentFilter === 'all'
                ? `/admin/comments/course/${courseId}`
                : `/admin/comments/pending`;

            const response = await api.get(endpoint);
            let commentsData = response.data?.data || response.data || [];

            // Ensure commentsData is always an array
            if (!Array.isArray(commentsData)) {
                commentsData = [];
            }

            if (commentFilter !== 'all') {
                commentsData = commentsData.filter(c => c.courseId === courseId);
            }

            setComments(commentsData);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setApiError(error);
            // در صورت خطا، لیست خالی نمایش بده
            setComments([]);
        } finally {
            setCommentsLoading(false);
        }
    };

    const fetchStudents = async () => {
        setStudentsLoading(true);
        try {
            // استفاده از API صحیح بر اساس Swagger
            const response = await api.get(`/courses/${courseId}/students`);
            const studentsData = response.data?.data || [];

            // اطمینان از اینکه داده‌ها آرایه هستند
            if (!Array.isArray(studentsData)) {
                setStudents([]);
            } else {
                setStudents(studentsData);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setApiError(error);
            // در صورت خطا، لیست خالی نمایش بده
            setStudents([]);
        } finally {
            setStudentsLoading(false);
        }
    };

    const fetchSchedules = async () => {
        setSchedulesLoading(true);
        try {
            // استفاده از API زمان‌بندی بر اساس Swagger
            const response = await api.get(`/courses/${courseId}/schedules`);
            const schedulesData = response.data?.data || [];

            // اطمینان از اینکه داده‌ها آرایه هستند
            if (!Array.isArray(schedulesData)) {
                setSchedules([]);
            } else {
                setSchedules(schedulesData);
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
            setApiError(error);
            // در صورت خطا، لیست خالی نمایش بده
            setSchedules([]);
        } finally {
            setSchedulesLoading(false);
        }
    };

    const handleCommentReview = async (commentId, newStatus, adminNote = '') => {
        try {
            // استفاده از API واقعی
            await api.put(`/admin/comments/${commentId}/review`, {
                status: newStatus, // 1 = Approved, 2 = Rejected
                adminNote
            });

            toast.success(`نظر ${newStatus === 1 ? 'تأیید' : 'رد'} شد`);

            // بارگذاری مجدد کامنت‌ها و آمار
            await fetchComments();
            await fetchStats();

        } catch (error) {
            console.error('Error in handleCommentReview:', error);
            toast.error('خطا در بررسی نظر');
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
                        className={`${star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                            }`}
                    />
                ))}
            </div>
        );
    };



    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="p-6 text-center">
                <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                    دوره یافت نشد
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                    دوره مورد نظر وجود ندارد یا حذف شده است
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Error Alert */}
            {apiError && (
                <APIErrorAlert
                    error={apiError}
                    onRetry={() => {
                        setApiError(null);
                        fetchCourse();
                        fetchStats();
                    }}
                    onClose={() => setApiError(null)}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                        مدیریت LMS - {course.title}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        مدیریت جامع سیستم یادگیری دوره
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AdminCard
                    title="دانشجویان"
                    value={stats.totalStudents}
                    icon={Users}
                    color="blue"
                    subtitle="نفر ثبت‌نام کرده"
                />
                <AdminCard
                    title="درآمد کل"
                    value={formatPrice(stats.totalRevenue)}
                    icon={TrendingUp}
                    color="emerald"
                    subtitle="تومان"
                />
                <AdminCard
                    title="معوقات"
                    value={formatPrice(stats.pendingPayments)}
                    icon={AlertTriangle}
                    color="red"
                    subtitle="تومان"
                />
                <AdminCard
                    title="میانگین امتیاز"
                    value={stats.averageRating.toFixed(1)}
                    icon={Star}
                    color="amber"
                    subtitle={`از ${stats.totalComments} نظر`}
                />
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                    <nav className="flex space-x-8 px-4 sm:px-6 min-w-max">
                        {[
                            { id: 'overview', label: 'خلاصه', icon: BookOpen },
                            { id: 'comments', label: 'نظرات', icon: MessageCircle },
                            { id: 'attendance', label: 'حضور و غیاب', icon: Calendar },
                            { id: 'schedules', label: 'زمان‌بندی', icon: CalendarDays },
                            { id: 'students', label: 'دانشجویان', icon: Users }
                        ].map((tab) => {
                            const IconComponent = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                                        }`}
                                >
                                    <IconComponent size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">

                            {/* Backend Status */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    وضعیت پیاده‌سازی بکند
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <BackendStatus
                                        feature="سیستم کامنت‌ها"
                                        status="available"
                                        message="API های کامنت پیاده‌سازی شده - /api/admin/comments/course/{courseId}"
                                    />
                                    <BackendStatus
                                        feature="مدیریت حضور و غیاب"
                                        status="available"
                                        message="API های حضور و غیاب پیاده‌سازی شده - /api/admin/Attendance"
                                    />
                                    <BackendStatus
                                        feature="سیستم پرداخت قسطی"
                                        status="available"
                                        message="API های پرداخت پیاده‌سازی شده - /api/admin/Payments"
                                    />
                                    <BackendStatus
                                        feature="مدیریت دانشجویان"
                                        status="available"
                                        message="API لیست دانشجویان پیاده‌سازی شده - /api/courses/{courseId}/students"
                                    />
                                    <BackendStatus
                                        feature="زمان‌بندی کلاس‌ها"
                                        status="available"
                                        message="API زمان‌بندی پیاده‌سازی شده - /api/courses/{courseId}/schedules"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Course Info */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                        اطلاعات دوره
                                    </h3>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">قیمت:</span>
                                            <span className="font-bold text-slate-800 dark:text-white">
                                                {formatPrice(course.price)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">تاریخ ایجاد:</span>
                                            <span className="font-bold text-slate-800 dark:text-white">
                                                {formatDate(course.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">وضعیت:</span>
                                            <Badge color={course.isActive ? 'emerald' : 'red'}>
                                                {course.isActive ? 'فعال' : 'غیرفعال'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                        آمار سریع
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <span className="text-blue-700 dark:text-blue-300">نرخ حضور</span>
                                            <span className="font-bold text-blue-800 dark:text-blue-200">
                                                {stats.attendanceRate}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                            <span className="text-emerald-700 dark:text-emerald-300">نرخ پرداخت</span>
                                            <span className="font-bold text-emerald-800 dark:text-emerald-200">
                                                {stats.totalRevenue > 0 ?
                                                    Math.round((stats.totalRevenue / (stats.totalRevenue + stats.pendingPayments)) * 100) : 0
                                                }%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                            <span className="text-amber-700 dark:text-amber-300">رضایت دانشجویان</span>
                                            <div className="flex items-center gap-2">
                                                {renderStars(Math.round(stats.averageRating))}
                                                <span className="font-bold text-amber-800 dark:text-amber-200">
                                                    {stats.averageRating.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Comments Tab */}
                    {activeTab === 'comments' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    مدیریت نظرات
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setApiError(null);
                                            fetchComments();
                                        }}
                                        disabled={commentsLoading}
                                    >
                                        {commentsLoading ? 'در حال بارگذاری...' : 'بارگذاری مجدد'}
                                    </Button>
                                    <Filter size={16} className="text-slate-400" />
                                    <select
                                        value={commentFilter}
                                        onChange={(e) => setCommentFilter(e.target.value)}
                                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                                    >
                                        <option value="all">همه نظرات</option>
                                        <option value="pending">در انتظار تأیید</option>
                                        <option value="approved">تأیید شده</option>
                                        <option value="rejected">رد شده</option>
                                    </select>
                                </div>
                            </div>

                            {commentsLoading ? (
                                <div className="animate-pulse space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    ))}
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageCircle className="mx-auto text-slate-400 mb-4" size={48} />
                                    <p className="text-slate-500 dark:text-slate-400">
                                        {commentFilter === 'all' ? 'هیچ نظری ثبت نشده است' : 'نظری در این دسته یافت نشد'}
                                    </p>
                                    {apiError && (
                                        <p className="text-xs text-red-500 mt-2">
                                            خطا در دریافت کامنت‌ها: {apiError.message}
                                        </p>
                                    )}

                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {Array.isArray(comments) && comments.map((comment) => (
                                        <div key={comment.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                                                        <div className="w-full h-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold">
                                                            {comment.studentName?.charAt(0) || 'ک'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-slate-800 dark:text-white">
                                                            {comment.studentName || 'کاربر'}
                                                        </h5>
                                                        <div className="flex items-center gap-2">
                                                            {renderStars(comment.rating)}
                                                            <Badge color={comment.status === 0 ? 'amber' : comment.status === 1 ? 'emerald' : 'red'} size="sm">
                                                                {comment.statusDisplay}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {formatDate(comment.createdAt)}
                                                </span>
                                            </div>

                                            <p className="text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                                                {comment.content}
                                            </p>

                                            {comment.adminNote && (
                                                <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                                        <strong>یادداشت ادمین:</strong> {comment.adminNote}
                                                    </p>
                                                </div>
                                            )}

                                            {comment.status === 0 && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleCommentReview(comment.id, 1)}
                                                        className="!bg-emerald-600 hover:!bg-emerald-700"
                                                    >
                                                        <CheckCircle2 size={14} className="ml-1" />
                                                        تأیید
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            const note = prompt('یادداشت (اختیاری):');
                                                            handleCommentReview(comment.id, 2, note || '');
                                                        }}
                                                        className="!text-red-600 !border-red-200 hover:!bg-red-50"
                                                    >
                                                        <AlertTriangle size={14} className="ml-1" />
                                                        رد
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Attendance Tab */}
                    {activeTab === 'attendance' && (
                        <AttendanceManagement courseId={courseId} courseName={course.title} />
                    )}

                    {/* Schedules Tab */}
                    {activeTab === 'schedules' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    زمان‌بندی کلاس‌ها
                                </h3>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setApiError(null);
                                        fetchSchedules();
                                    }}
                                    disabled={schedulesLoading}
                                >
                                    {schedulesLoading ? 'در حال بارگذاری...' : 'بارگذاری مجدد'}
                                </Button>
                            </div>

                            {schedulesLoading ? (
                                <div className="animate-pulse space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    ))}
                                </div>
                            ) : schedules.length === 0 ? (
                                <div className="text-center py-8">
                                    <CalendarDays className="mx-auto text-slate-400 mb-4" size={48} />
                                    <p className="text-slate-500 dark:text-slate-400">
                                        هیچ زمان‌بندی تعریف نشده است
                                    </p>
                                    {apiError && (
                                        <p className="text-xs text-red-500 mt-2">
                                            خطا در دریافت زمان‌بندی‌ها: {apiError.message}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {Array.isArray(schedules) && schedules.map((schedule) => (
                                        <ScheduleCard key={schedule.id} schedule={schedule} courseId={courseId} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Students Tab */}
                    {activeTab === 'students' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                مدیریت دانشجویان
                            </h3>

                            {studentsLoading ? (
                                <div className="animate-pulse space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    ))}
                                </div>
                            ) : students.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="mx-auto text-slate-400 mb-4" size={48} />
                                    <p className="text-slate-500 dark:text-slate-400">
                                        هیچ دانشجویی در این دوره ثبت‌نام نکرده است
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {Array.isArray(students) && students.map((student) => (
                                        <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                                                    {student.profileImage ? (
                                                        <img
                                                            src={getImageUrl(student.profileImage)}
                                                            alt={student.fullName || 'دانشجو'}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                // اگر عکس لود نشد، آواتار پیش‌فرض نمایش بده
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div
                                                        className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold"
                                                        style={{ display: student.profileImage ? 'none' : 'flex' }}
                                                    >
                                                        {student.fullName?.charAt(0) || 'د'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h5 className="font-bold text-slate-800 dark:text-white">
                                                            {student.fullName || 'دانشجو'}
                                                        </h5>
                                                        <Badge
                                                            color={student.enrollmentStatus === 'Active' ? 'emerald' :
                                                                student.enrollmentStatus === 'Suspended' ? 'amber' : 'red'}
                                                            size="sm"
                                                        >
                                                            {student.enrollmentStatus === 'Active' ? 'فعال' :
                                                                student.enrollmentStatus === 'Suspended' ? 'تعلیق' : 'لغو شده'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {student.email}
                                                    </p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                                        ثبت‌نام: {formatDate(student.enrollmentDate)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setSelectedStudent(student)}
                                                >
                                                    <DollarSign size={14} className="ml-1" />
                                                    پروفایل مالی
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Student Financial Profile Modal */}
            {selectedStudent && (
                <StudentFinancialProfile
                    studentId={selectedStudent.id}
                    studentName={selectedStudent.fullName}
                    onClose={() => setSelectedStudent(null)}
                />
            )}
        </div>
    );
};

export default LMSManagement;