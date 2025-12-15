import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, MessageCircle, Calendar, DollarSign, Users, TrendingUp, CheckCircle2, AlertTriangle, Clock, Star, Eye, Edit2, Trash2, Filter } from 'lucide-react';
import { Button, Badge } from '../../components/UI';
import { AdminCard } from '../../components/AdminCard';
import AttendanceManagement from '../../components/AttendanceManagement';
import StudentFinancialProfile from '../../components/StudentFinancialProfile';
import { api } from '../../services/api';
import { formatPrice, formatDate } from '../../services/Libs';
import { APIErrorAlert } from '../../components/Alert';
import toast from 'react-hot-toast';

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
    }, [courseId]);

    useEffect(() => {
        if (activeTab === 'comments') {
            fetchComments();
        } else if (activeTab === 'students') {
            fetchStudents();
        }
    }, [activeTab, commentFilter]);

    const fetchCourse = async () => {
        try {
            const response = await api.get(`/admin/courses/${courseId}`);
            setCourse(response.data?.data);
        } catch (error) {
            console.error('Error fetching course:', error);
            setApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Fetch various stats from different endpoints
            const [studentsRes, commentsRes, paymentsRes] = await Promise.allSettled([
                api.get(`/admin/courses/${courseId}/students`),
                api.get(`/admin/comments/course/${courseId}/stats`),
                api.get(`/admin/courses/${courseId}/financial-summary`)
            ]);

            const studentsData = studentsRes.status === 'fulfilled' ? studentsRes.value.data?.data || [] : [];
            const commentsData = commentsRes.status === 'fulfilled' ? commentsRes.value.data?.data : {};
            const paymentsData = paymentsRes.status === 'fulfilled' ? paymentsRes.value.data?.data : {};

            setStats({
                totalStudents: studentsData.length,
                totalRevenue: paymentsData.totalRevenue || 0,
                pendingPayments: paymentsData.pendingAmount || 0,
                averageRating: commentsData.averageRating || 0,
                totalComments: commentsData.totalComments || 0,
                attendanceRate: paymentsData.attendanceRate || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchComments = async () => {
        setCommentsLoading(true);
        try {
            const endpoint = commentFilter === 'all'
                ? `/admin/comments/course/${courseId}`
                : `/admin/comments/pending`;

            const response = await api.get(endpoint);
            let commentsData = response.data?.data || [];

            if (commentFilter !== 'all') {
                commentsData = commentsData.filter(c => c.courseId === courseId);
            }

            setComments(commentsData);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setApiError(error);
        } finally {
            setCommentsLoading(false);
        }
    };

    const fetchStudents = async () => {
        setStudentsLoading(true);
        try {
            const response = await api.get(`/admin/courses/${courseId}/students`);
            setStudents(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
            setApiError(error);
        } finally {
            setStudentsLoading(false);
        }
    };

    const handleCommentReview = async (commentId, status, adminNote = '') => {
        try {
            await api.put(`/admin/comments/${commentId}/review`, {
                status,
                adminNote
            });

            toast.success(`نظر ${status === 'Approved' ? 'تأیید' : 'رد'} شد`);
            await fetchComments();
            await fetchStats();
        } catch (error) {
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

    const getStatusBadge = (status) => {
        const statusConfig = {
            Pending: { color: 'amber', text: 'در انتظار تأیید' },
            Approved: { color: 'emerald', text: 'تأیید شده' },
            Rejected: { color: 'red', text: 'رد شده' }
        };

        const config = statusConfig[status] || statusConfig.Pending;
        return <Badge color={config.color} size="sm">{config.text}</Badge>;
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        مدیریت LMS - {course.title}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        مدیریت جامع سیستم یادگیری دوره
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div className="border-b border-slate-200 dark:border-slate-700">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', label: 'خلاصه', icon: BookOpen },
                            { id: 'comments', label: 'نظرات', icon: MessageCircle },
                            { id: 'attendance', label: 'حضور و غیاب', icon: Calendar },
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
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {comment.user?.fullName?.charAt(0) || 'ک'}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-slate-800 dark:text-white">
                                                            {comment.user?.fullName || 'کاربر'}
                                                        </h5>
                                                        <div className="flex items-center gap-2">
                                                            {renderStars(comment.rating)}
                                                            {getStatusBadge(comment.status)}
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

                                            {comment.status === 'Pending' && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleCommentReview(comment.id, 'Approved')}
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
                                                            handleCommentReview(comment.id, 'Rejected', note || '');
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
                                    {students.map((student) => (
                                        <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {student.fullName?.charAt(0) || 'د'}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-slate-800 dark:text-white">
                                                        {student.fullName || 'دانشجو'}
                                                    </h5>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {student.email}
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