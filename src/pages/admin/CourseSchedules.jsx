import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Calendar, CalendarDays, CheckCircle2, Clock, Edit, Eye, FileText, MapPin, Plus, Trash2, Users } from 'lucide-react';
import StudentAttendanceReport from '../../components/StudentAttendanceReport';
import { Button } from '../../components/UI';
import { apiClient } from '../../services/api';
import { DAY_NAMES, getDayName, formatTimeRange, formatFullSchedule } from '../../services/Libs';
import { useAlert } from '../../hooks/useAlert';
const CourseSchedules = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [students, setStudents] = useState([]);
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [reportModal, setReportModal] = useState({ show: false, studentId: null, studentName: '' });
    const alert = useAlert();
    const [formData, setFormData] = useState({
        title: '',
        dayOfWeek: 0,
        startTime: '',
        endTime: '',
        maxCapacity: 20,
        description: ''
    });
    useEffect(() => {
        fetchCourseAndSchedules();
    }, [courseId]);
    // تابع جداگانه برای fetch کردن فقط زمان‌بندی‌ها
    const testSchedulesAPI = async () => {
        const loadingId = alert.showLoading('در حال تست API...');
        try {
            const result = await apiClient.get(`/courses/${courseId}/schedules`);
            if (result.success) {
                const schedulesData = result.data || [];
                alert.showSuccess(`✅ API کار می‌کند! ${schedulesData.length} زمان‌بندی دریافت شد`);
                const processedSchedules = schedulesData.map(schedule => ({
                    ...schedule,
                    enrolledCount: schedule.enrolledCount || 0,
                    remainingCapacity: (schedule.maxCapacity || 0) - (schedule.enrolledCount || 0),
                    hasCapacity: (schedule.enrolledCount || 0) < (schedule.maxCapacity || 0),
                    fullScheduleText: formatFullSchedule(schedule.dayOfWeek, schedule.startTime, schedule.endTime)
                }));
                setSchedules(processedSchedules);
            } catch (error) {
                console.error('❌ Schedules API Error:', error);
                if (error.response?.status === 405) {
                    alert.showError('❌ Backend Issue: GET schedules endpoint پیاده‌سازی نشده (405)');
                    console.warn('🔧 Backend needs to implement: GET /courses/{courseId}/schedules');
                    console.info('📝 Current schedules are managed locally until backend is fixed');
                } else {
                    alert.showError(`❌ خطای API: ${error.response?.status || 'نامشخص'}`);
                }
            }
        };
        const fetchCourseAndSchedules = async () => {
            try {
                setLoading(true);
                // دریافت اطلاعات دوره
                const coursesResult = await apiClient.get('/courses', {
                    showErrorAlert: true
                });
                if (coursesResult.success) {
                    const allCourses = coursesResult.data || [];
                    const courseData = allCourses.find(course =>
                        course.id === courseId ||
                        course.id.toString() === courseId ||
                        course.id.toString().toLowerCase() === courseId.toLowerCase()
                    );
                    if (courseData) {
                        setCourse(courseData);
                        // تلاش برای بارگذاری خودکار زمان‌بندی‌ها
                        try {
                            const schedulesResult = await apiClient.get(`/courses/${courseId}/schedules`, {
                                showErrorAlert: false
                            });
                            if (schedulesResult.success) {
                                const schedulesData = schedulesResult.data || [];
                                const processedSchedules = schedulesData.map(schedule => ({
                                    ...schedule,
                                    enrolledCount: schedule.enrolledCount || 0,
                                    remainingCapacity: (schedule.maxCapacity || 0) - (schedule.enrolledCount || 0),
                                    hasCapacity: (schedule.enrolledCount || 0) < (schedule.maxCapacity || 0),
                                    fullScheduleText: formatFullSchedule(schedule.dayOfWeek, schedule.startTime, schedule.endTime)
                                }));
                                setSchedules(processedSchedules);
                                if (schedulesData.length > 0) {
                                    alert.showSuccess(`${schedulesData.length} زمان‌بندی بارگذاری شد`);
                                }
                            } else {
                                console.warn('⚠️ Backend API Issue: GET /courses/' + courseId + '/schedules returns error');
                                console.info('💡 Using local state management for schedules until backend implements this endpoint');
                                alert.showInfo('💡 برای مشاهده زمان‌بندی‌ها، دکمه تست API را بزنید');
                            }
                        } catch (schedulesError) {
                            console.warn('Error loading schedules:', schedulesError);
                            setSchedules([]);
                        }
                    } else {
                        // اگر دوره پیدا نشد، یک دوره موقت ایجاد کن
                        setCourse({
                            id: courseId,
                            title: `دوره با ID: ${courseId}`,
                            schedules: []
                        });
                        setSchedules([]);
                        alert.showNotFoundError('دوره - لطفاً از لیست دوره‌ها وارد شوید');
                    }
                }
            } finally {
                setLoading(false);
            }
        };
        const handleCreateSchedule = async (e) => {
            e.preventDefault();
            if (!formData.title.trim()) {
                alert.showValidationError('عنوان زمان‌بندی الزامی است');
                return;
            }
            if (!formData.startTime || !formData.endTime) {
                alert.showValidationError('زمان شروع و پایان الزامی است');
                return;
            }
            if (formData.startTime >= formData.endTime) {
                alert.showValidationError('زمان شروع باید کمتر از زمان پایان باشد');
                return;
            }
            const scheduleData = {
                ...formData,
                courseId: courseId
            };
            const result = await apiClient.post(`/courses/${courseId}/schedules`, scheduleData, {
                successMessage: 'زمان‌بندی با موفقیت ایجاد شد'
            });
            if (result.success) {
                // اضافه کردن فیلدهای محاسبه شده به زمان‌بندی جدید
                const newSchedule = {
                    ...result.data,
                    enrolledCount: 0,
                    remainingCapacity: result.data.maxCapacity || formData.maxCapacity,
                    hasCapacity: true,
                    fullScheduleText: formatFullSchedule(
                        result.data.dayOfWeek || formData.dayOfWeek,
                        result.data.startTime || formData.startTime,
                        result.data.endTime || formData.endTime
                    )
                };
                setSchedules(prev => [...prev, newSchedule]);
                setShowCreateModal(false);
                resetForm();
                // دوباره fetch کن تا مطمئن شوی schedules بروز هستند
                setTimeout(() => {
                    fetchCourseAndSchedules();
                }, 500);
            }
        } catch (error) {
            console.error('Error creating schedule:', error);
            alert.showError(error.response?.data?.message || 'خطا در ایجاد زمان‌بندی');
        }
    };
    const handleViewStudents = async (schedule) => {
        try {
            setSelectedSchedule(schedule);
            setStudents([]); // ابتدا لیست را خالی کن
            // 1. Fetch Students
            const studentsResult = await apiClient.get(`/courses/${courseId}/schedules/${schedule.id}/students`);
            const studentsData = studentsResult.success ? (studentsResult.data || []) : [];
            let finalStudents = Array.isArray(studentsData) ? studentsData : [];
            // 2. Fetch Sessions & Attendance Stats
            if (finalStudents.length > 0) {
                try {
                    // Get all sessions for this schedule
                    const sessionsResult = await apiClient.get(`/admin/Attendance/sessions/schedule/${schedule.id}`);
                    const sessions = sessionsResult.success ? (sessionsResult.data || []) : [];
                    if (sessions.length > 0) {
                        // Fetch attendance for all sessions in parallel
                        const attendancePromises = sessions.map(session =>
                            apiClient.get(`/admin/Attendance/session/${session.id}`)
                                .then(res => res.success ? (res.data || []) : [])
                                .catch(() => [])
                        );
                        const allAttendances = await Promise.all(attendancePromises);
                        // Calculate stats per student
                        const studentStats = {};
                        allAttendances.forEach(sessionRecords => {
                            if (Array.isArray(sessionRecords)) {
                                sessionRecords.forEach(record => {
                                    const sId = record.studentId;
                                    if (!studentStats[sId]) {
                                        studentStats[sId] = { attended: 0, absent: 0 };
                                    }
                                    if (record.status === 'Present' || record.status === 'Late') {
                                        studentStats[sId].attended++;
                                    } else if (record.status === 'Absent') {
                                        studentStats[sId].absent++;
                                    }
                                });
                            }
                        });
                        // Merge stats into students array
                        finalStudents = finalStudents.map(student => {
                            const stats = studentStats[student.userId || student.id] || { attended: 0, absent: 0 };
                            return {
                                ...student,
                                attendedSessions: stats.attended,
                                absentSessions: stats.absent
                            };
                        });
                    }
                } catch (err) {
                    console.error('Error fetching attendance stats:', err);
                    // Continue with students list even if stats fail
                }
            }
            setStudents(finalStudents);
            setShowStudentsModal(true);
            if (finalStudents.length === 0) {
                alert.showInfo('هیچ دانشجویی در این زمان‌بندی ثبت‌نام نکرده است');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            // در صورت خطای 404 یا عدم وجود داده
            if (error.response?.status === 404) {
                setStudents([]);
                setShowStudentsModal(true);
                alert.showInfo('هیچ دانشجویی در این زمان‌بندی ثبت‌نام نکرده است');
            } else {
                alert.showError('خطا در دریافت لیست دانشجویان');
            }
        }
    };
    const resetForm = () => {
        setFormData({
            title: '',
            dayOfWeek: 0,
            startTime: '',
            endTime: '',
            maxCapacity: 20,
            description: ''
        });
    };
    const handleEditSchedule = (schedule) => {
        setEditingSchedule(schedule);
        setFormData({
            title: schedule.title || '',
            dayOfWeek: schedule.dayOfWeek || 0,
            startTime: schedule.startTime || '',
            endTime: schedule.endTime || '',
            maxCapacity: schedule.maxCapacity || 20,
            description: schedule.description || ''
        });
        setShowEditModal(true);
    };
    const handleUpdateSchedule = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert.showValidationError('عنوان زمان‌بندی الزامی است');
            return;
        }
        if (!formData.startTime || !formData.endTime) {
            alert.showValidationError('زمان شروع و پایان الزامی است');
            return;
        }
        if (formData.startTime >= formData.endTime) {
            alert.showValidationError('زمان شروع باید کمتر از زمان پایان باشد');
            return;
        }
        try {
            const scheduleData = {
                ...formData,
                courseId: courseId
            };
            const response = await apiClient.put(`/courses/${courseId}/schedules/${editingSchedule.id}`, scheduleData, {
                successMessage: 'زمان‌بندی با موفقیت بروزرسانی شد'
            });
            if (response.success && response.data) {
                // بروزرسانی schedule در لیست
                const updatedSchedule = {
                    ...response.data,
                    enrolledCount: editingSchedule.enrolledCount || 0,
                    remainingCapacity: (response.data.maxCapacity || formData.maxCapacity) - (editingSchedule.enrolledCount || 0),
                    hasCapacity: (editingSchedule.enrolledCount || 0) < (response.data.maxCapacity || formData.maxCapacity),
                    fullScheduleText: formatFullSchedule(
                        response.data.dayOfWeek || formData.dayOfWeek,
                        response.data.startTime || formData.startTime,
                        response.data.endTime || formData.endTime
                    )
                };
                setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? updatedSchedule : s));
                setShowEditModal(false);
                setEditingSchedule(null);
                resetForm();
            }
        } catch (error) {
            console.error('Error updating schedule:', error);
            // خطا خودکار توسط apiClient نمایش داده می‌شود
        }
    };
    const handleDeleteSchedule = async (schedule) => {
        if (!window.confirm(`آیا مطمئن هستید که می‌خواهید زمان‌بندی "${schedule.title}" را حذف کنید؟\n\nتوجه: این عمل غیرقابل بازگشت است و تمام ثبت‌نام‌های مربوط به این زمان‌بندی نیز حذف خواهد شد.`)) {
            return;
        }
        try {
            const result = await apiClient.delete(`/courses/${courseId}/schedules/${schedule.id}`, {
                successMessage: 'زمان‌بندی با موفقیت حذف شد'
            });
            if (result.success) {
                // حذف از لیست محلی
                setSchedules(prev => prev.filter(s => s.id !== schedule.id));
            }
        } catch (error) {
            console.error('Error deleting schedule:', error);
            // خطا خودکار توسط apiClient نمایش داده می‌شود
        }
    };
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
            {/* Error Alert */}
            {apiError && (
                <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
                    <APIErrorAlert
                        error={apiError}
                        onRetry={() => {
                            setApiError(null);
                            clearError();
                            fetchCourseAndSchedules();
                        }}
                        onClose={() => {
                            setApiError(null);
                            clearError();
                        }}
                    />
                </div>
            )}
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 mb-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                مدیریت زمان‌بندی دوره
                            </h1>
                            <p className="text-slate-600 dark:text-slate-300">
                                {course?.title}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            <Button
                                onClick={testSchedulesAPI}
                                variant="outline"
                                className="!px-4 !py-3"
                                title="تست API Backend"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </Button>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="!px-6 !py-3"
                            >
                                <Plus size={20} className="ml-2" />
                                زمان‌بندی جدید
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Schedules List */}
                <div className="grid gap-6">
                    {schedules.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
                            <Calendar className="mx-auto text-slate-400 mb-4" size={64} />
                            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">
                                هیچ زمان‌بندی تعریف نشده
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-4">
                                برای این دوره هنوز زمان‌بندی ایجاد نشده است
                            </p>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                                <h4 className="text-red-800 dark:text-red-200 font-bold text-sm mb-2">⚠️ مشکل Backend API</h4>
                                <p className="text-red-700 dark:text-red-300 text-sm mb-2">
                                    Endpoint <code>GET /courses/{courseId}/schedules</code> پیاده‌سازی نشده (خطای 405)
                                </p>
                                <p className="text-red-600 dark:text-red-400 text-xs">
                                    زمان‌بندی‌های ایجاد شده فقط تا زمان رفرش صفحه نمایش داده می‌شوند
                                </p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                                <p className="text-blue-700 dark:text-blue-300 text-sm">
                                    💡 می‌توانید زمان‌بندی جدید ایجاد کنید، اما بعد از رفرش صفحه نمایش داده نخواهد شد تا Backend تصحیح شود.
                                </p>
                            </div>
                            <div className="flex gap-3 justify-center">
                                <Button onClick={testSchedulesAPI} variant="outline">
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    بروزرسانی
                                </Button>
                                <Button onClick={() => setShowCreateModal(true)}>
                                    <Plus size={20} className="ml-2" />
                                    ایجاد اولین زمان‌بندی
                                </Button>
                            </div>
                        </div>
                    ) : (
                        schedules.map((schedule) => (
                            <div
                                key={schedule.id}
                                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                                {schedule.title}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${schedule.isActive
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                {schedule.isActive ? 'فعال' : 'غیرفعال'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                <Calendar size={16} className="text-indigo-600" />
                                                <span>{schedule.fullScheduleText}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                <Users size={16} className="text-primary" />
                                                <span>{schedule.enrolledCount}/{schedule.maxCapacity} نفر</span>
                                            </div>
                                            {schedule.description && (
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                    <MapPin size={16} className="text-primary" />
                                                    <span>{schedule.description}</span>
                                                </div>
                                            )}
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                <span>ظرفیت</span>
                                                <span>{schedule.remainingCapacity} جای خالی</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-300 ${schedule.enrolledCount / schedule.maxCapacity > 0.8
                                                        ? 'bg-red-500'
                                                        : schedule.enrolledCount / schedule.maxCapacity > 0.6
                                                            ? 'bg-amber-500'
                                                            : 'bg-emerald-500'
                                                        }`}
                                                    style={{
                                                        width: `${(schedule.enrolledCount / schedule.maxCapacity) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mr-6">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewStudents(schedule)}
                                        >
                                            <Eye size={16} className="ml-1" />
                                            دانشجویان
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditSchedule(schedule)}
                                            className="!text-slate-500 hover:!text-primary"
                                            title="ویرایش زمان‌بندی"
                                        >
                                            <Edit size={16} />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteSchedule(schedule)}
                                            className="!text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20"
                                            title="حذف زمان‌بندی"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {/* Create Schedule Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                ایجاد زمان‌بندی جدید
                            </h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCreateSchedule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    عنوان زمان‌بندی
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                    placeholder="مثال: گروه صبح"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    روز هفته
                                </label>
                                <select
                                    value={formData.dayOfWeek}
                                    onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                >
                                    {Object.entries(DAY_NAMES).map(([value, name]) => (
                                        <option key={value} value={value}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        زمان شروع
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        زمان پایان
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    حداکثر ظرفیت
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={formData.maxCapacity}
                                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    توضیحات (اختیاری)
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                    placeholder="مثال: کلاس حضوری"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">
                                    ایجاد زمان‌بندی
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1"
                                >
                                    انصراف
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Edit Schedule Modal */}
            {showEditModal && editingSchedule && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                ویرایش زمان‌بندی
                            </h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingSchedule(null);
                                    resetForm();
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleUpdateSchedule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    عنوان زمان‌بندی
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                    placeholder="مثال: گروه صبح"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    روز هفته
                                </label>
                                <select
                                    value={formData.dayOfWeek}
                                    onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                >
                                    {Object.entries(DAY_NAMES).map(([value, name]) => (
                                        <option key={value} value={value}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        زمان شروع
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        زمان پایان
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    حداکثر ظرفیت
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={formData.maxCapacity}
                                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    توضیحات (اختیاری)
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                    placeholder="مثال: کلاس حضوری"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">
                                    بروزرسانی زمان‌بندی
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingSchedule(null);
                                        resetForm();
                                    }}
                                    className="flex-1"
                                >
                                    انصراف
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Enhanced Students Modal */}
            {showStudentsModal && selectedSchedule && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">
                                        دانشجویان {selectedSchedule.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-indigo-100">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            <span>{selectedSchedule.fullScheduleText}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={16} />
                                            <span>{students.length} / {selectedSchedule.maxCapacity} نفر</span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowStudentsModal(false)}
                                    className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </Button>
                            </div>
                        </div>
                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {students.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Users className="text-slate-400" size={48} />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-3">
                                        هیچ دانشجویی ثبت‌نام نکرده
                                    </h4>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                        در این زمان‌بندی هنوز کسی ثبت‌نام نکرده است. دانشجویان می‌توانند از طریق صفحه دوره ثبت‌نام کنند.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Statistics Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                                                    <CheckCircle2 size={20} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">فعال</p>
                                                    <p className="text-emerald-800 dark:text-emerald-200 text-xl font-bold">
                                                        {students.filter(s => s.status === 'Active').length}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                                                    <Clock size={20} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">متوسط حضور</p>
                                                    <p className="text-amber-800 dark:text-amber-200 text-xl font-bold">
                                                        {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + (s.attendedSessions || 0), 0) / students.length) : 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                                    <Users size={20} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">کل دانشجویان</p>
                                                    <p className="text-blue-800 dark:text-blue-200 text-xl font-bold">{students.length}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">ظرفیت باقی</p>
                                                    <p className="text-purple-800 dark:text-purple-200 text-xl font-bold">
                                                        {selectedSchedule.maxCapacity - students.length}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Students Grid */}
                                    <div className="grid gap-4">
                                        {students.map((student, index) => (
                                            <div key={student.userId || index} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        {/* Avatar */}
                                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                            {student.fullName ? student.fullName.charAt(0) : 'N'}
                                                        </div>
                                                        {/* Student Info */}
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-slate-800 dark:text-white text-lg">
                                                                {student.fullName || 'نام نامشخص'}
                                                            </h4>
                                                            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 mt-1">
                                                                <div className="flex items-center gap-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                                    </svg>
                                                                    <span>{student.email || 'ایمیل نامشخص'}</span>
                                                                </div>
                                                                {student.mobile && (
                                                                    <div className="flex items-center gap-1">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                        </svg>
                                                                        <span>{student.mobile}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Status and Stats */}
                                                    <div className="flex items-center gap-4">
                                                        {/* Actions */}
                                                        <div>
                                                            <button
                                                                onClick={() => setReportModal({
                                                                    show: true,
                                                                    studentId: student.userId || student.id,
                                                                    studentName: student.fullName
                                                                })}
                                                                className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
                                                                title="مشاهده گزارش حضور و غیاب"
                                                            >
                                                                <FileText size={18} />
                                                                <span className="hidden sm:inline">گزارش</span>
                                                            </button>
                                                        </div>
                                                        {/* Attendance Stats */}
                                                        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700">
                                                            <div className="flex items-center gap-1" title="تعداد حضور">
                                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{student.attendedSessions || 0}</span>
                                                            </div>
                                                            <span className="text-slate-300 dark:text-slate-600">|</span>
                                                            <div className="flex items-center gap-1" title="تعداد غیبت">
                                                                <AlertCircle size={14} className="text-red-500" />
                                                                <span className="text-red-500 dark:text-red-400 font-bold">{student.absentSessions || 0}</span>
                                                            </div>
                                                            {(student.attendedSessions > 0 || student.absentSessions > 0) && (
                                                                <>
                                                                    <span className="text-slate-300 dark:text-slate-600">|</span>
                                                                    <div className="flex items-center gap-1" title="درصد حضور">
                                                                        <span className={`text-xs font-bold ${((student.attendedSessions || 0) / ((student.attendedSessions || 0) + (student.absentSessions || 0)) * 100) >= 75
                                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                                            : ((student.attendedSessions || 0) / ((student.attendedSessions || 0) + (student.absentSessions || 0)) * 100) >= 50
                                                                                ? 'text-amber-600 dark:text-amber-400'
                                                                                : 'text-red-600 dark:text-red-400'
                                                                            }`}>
                                                                            {Math.round((student.attendedSessions || 0) / ((student.attendedSessions || 0) + (student.absentSessions || 0)) * 100)}%
                                                                        </span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                        {/* Enrollment Date */}
                                                        <div className="text-center">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">تاریخ ثبت‌نام</p>
                                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                {student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString('fa-IR') : 'نامشخص'}
                                                            </p>
                                                        </div>
                                                        {/* Status Badge */}
                                                        <div>
                                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${student.status === 'Active'
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                : student.status === 'Transferred'
                                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                    : student.status === 'Withdrawn'
                                                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                                }`}>
                                                                {student.status === 'Active' ? 'فعال' :
                                                                    student.status === 'Transferred' ? 'انتقال یافته' :
                                                                        student.status === 'Withdrawn' ? 'انصراف' :
                                                                            student.status || 'نامشخص'}
                                                            </span>
                                                        </div>
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
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Report Modal */}
            {reportModal.show && (
                <StudentAttendanceReport
                    studentId={reportModal.studentId}
                    studentName={reportModal.studentName}
                    courseId={courseId}
                    onClose={() => setReportModal({ show: false, studentId: null, studentName: '' })}
                />
            )}
        </div>
    );
};
export default CourseSchedules;