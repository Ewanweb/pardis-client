import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Users, CheckCircle2, XCircle, AlertCircle, Plus, Edit2, Trash2, Save, CalendarDays, Timer } from 'lucide-react';
import { Button, Badge } from './UI';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatDate, DAY_NAMES } from '../services/Libs';
import { APIErrorAlert } from './Alert';
import toast from 'react-hot-toast';

const AttendanceManagement = ({ courseId, courseName }) => {
    const { user } = useAuth();

    // States for schedules and sessions
    const [schedules, setSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);

    // States for attendance and students
    const [attendances, setAttendances] = useState([]);
    const [students, setStudents] = useState([]);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    // Form states
    const [showSessionForm, setShowSessionForm] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [apiError, setApiError] = useState(null);

    const [sessionForm, setSessionForm] = useState({
        title: '',
        sessionDate: '',
        duration: '90',
        sessionNumber: 1,
        scheduleId: null
    });

    const fetchSchedules = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/courses/${courseId}/schedules`);
            const schedulesData = response.data?.data || response.data || [];

            const processedSchedules = schedulesData.map(schedule => ({
                ...schedule,
                enrolledCount: schedule.enrolledCount || 0,
                remainingCapacity: (schedule.maxCapacity || 0) - (schedule.enrolledCount || 0),
                hasCapacity: (schedule.enrolledCount || 0) < (schedule.maxCapacity || 0),
                fullScheduleText: `${DAY_NAMES[schedule.dayOfWeek]} ${schedule.startTime}-${schedule.endTime}`
            }));

            setSchedules(Array.isArray(processedSchedules) ? processedSchedules : []);
        } catch (error) {
            console.error('Error fetching schedules:', error);
            setApiError(error);
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    }, [courseId]);
    // دریافت دانشجویان یک زمان‌بندی خاص
    const fetchScheduleStudents = async (scheduleId) => {
        try {
            setStudentsLoading(true);
            const response = await api.get(`/courses/${courseId}/schedules/${scheduleId}/students`);
            const studentsData = response.data?.data || response.data || [];
            setStudents(Array.isArray(studentsData) ? studentsData : []);
        } catch (error) {
            console.error('Error fetching schedule students:', error);
            setStudents([]);
        } finally {
            setStudentsLoading(false);
        }
    };

    // دریافت جلسات یک زمان‌بندی خاص
    const fetchScheduleSessions = async (scheduleId) => {
        try {
            const response = await api.get(`/admin/Attendance/sessions/schedule/${scheduleId}`);

            if (response.data?.success && response.data?.data) {
                const sessionsData = response.data.data;
                const validSessions = Array.isArray(sessionsData) ? sessionsData : [];
                setSessions(validSessions);
            } else {
                setSessions([]);
            }
        } catch (error) {
            console.error('Error fetching schedule sessions:', error);
            setSessions([]);
        }
    };

    const fetchAttendance = async (sessionId) => {
        setAttendanceLoading(true);
        try {
            const response = await api.get(`/admin/Attendance/session/${sessionId}`);
            const attendanceData = response.data?.data;

            if (Array.isArray(attendanceData)) {
                // Normalize data to ensure studentId exists
                const normalizedData = attendanceData.map(record => ({
                    ...record,
                    studentId: record.studentId || record.student?.id || record.userId
                }));
                setAttendances(normalizedData);
            } else {
                setAttendances([]);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setApiError(error);
            setAttendances([]);
        } finally {
            setAttendanceLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    useEffect(() => {
        if (selectedSchedule) {
            fetchScheduleStudents(selectedSchedule.id);
            fetchScheduleSessions(selectedSchedule.id);
        }
    }, [selectedSchedule]);
    const handleCreateSession = async (e) => {
        e.preventDefault();

        if (!sessionForm.title.trim() || !sessionForm.sessionDate) {
            toast.error('لطفاً تمام فیلدهای ضروری را پر کنید');
            return;
        }

        if (!selectedSchedule && !editingSession) {
            toast.error('ابتدا یک زمان‌بندی انتخاب کنید');
            return;
        }

        try {
            // Convert duration from minutes to TimeSpan format (HH:MM:SS)
            const durationMinutes = parseInt(sessionForm.duration);
            const hours = Math.floor(durationMinutes / 60);
            const minutes = durationMinutes % 60;
            const durationTimeSpan = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;

            if (editingSession) {
                // Update session using PUT endpoint
                const updateData = {
                    title: sessionForm.title.trim(),
                    sessionDate: new Date(sessionForm.sessionDate).toISOString(),
                    duration: durationTimeSpan
                };

                const response = await api.put(`/admin/Attendance/sessions/${editingSession.id}`, updateData);

                if (response.data?.data) {
                    setSessions(prev => prev.map(s => s.id === editingSession.id ? response.data.data : s));
                    toast.success('جلسه با موفقیت بروزرسانی شد');

                    // بعد از ویرایش موفق، لیست را به‌روزرسانی کن
                    if (selectedSchedule) {
                        await fetchScheduleSessions(selectedSchedule.id);
                    }
                }
            } else {
                // Create new session using POST endpoint
                const sessionData = {
                    courseId: courseId,
                    scheduleId: selectedSchedule?.id || sessionForm.scheduleId,
                    title: sessionForm.title.trim(),
                    sessionDate: new Date(sessionForm.sessionDate).toISOString(),
                    duration: durationTimeSpan,
                    sessionNumber: parseInt(sessionForm.sessionNumber)
                };

                const response = await api.post('/admin/Attendance/sessions', sessionData);

                // بر اساس پاسخ API، داده در response.data.data است
                if (response.data?.success && response.data?.data) {
                    const newSession = {
                        ...response.data.data,
                        totalStudents: 0,
                        presentStudents: 0,
                        absentStudents: 0
                    };
                    setSessions(prev => [...prev, newSession]);
                    toast.success('جلسه با موفقیت ایجاد شد');
                } else {
                    toast.success('جلسه ایجاد شد');
                }

                // بلافاصله بعد از ایجاد موفق، لیست جلسات را به‌روزرسانی کن
                if (selectedSchedule) {
                    await fetchScheduleSessions(selectedSchedule.id);
                }
            }

            setSessionForm({ title: '', sessionDate: '', duration: '90', sessionNumber: 1, scheduleId: null });
            setShowSessionForm(false);
            setEditingSession(null);
        } catch (error) {
            const message = error.response?.data?.message || 'خطا در ایجاد جلسه';
            toast.error(message);
        }
    };
    const handleDeleteSession = async (sessionId) => {
        if (!window.confirm('آیا مطمئن هستید که می‌خواهید این جلسه را حذف کنید؟')) {
            return;
        }

        try {
            await api.delete(`/admin/Attendance/sessions/${sessionId}`);
            toast.success('جلسه حذف شد');

            if (selectedSchedule) {
                await fetchScheduleSessions(selectedSchedule.id);
            }

            if (selectedSession?.id === sessionId) {
                setSelectedSession(null);
                setAttendances([]);
            }
        } catch (error) {
            toast.error('خطا در حذف جلسه');
        }
    };

    const handleAttendanceChange = async (studentId, status) => {
        if (!selectedSession) return;

        // Check if attendance is already recorded for this student
        const existingAttendance = attendances.find(a => a.studentId === studentId);
        if (existingAttendance && existingAttendance.status && existingAttendance.status !== 'NotRecorded') {
            toast.warning('حضور و غیاب این دانشجو قبلاً ثبت شده است');
            return;
        }

        // Optimistic UI: immediately update local state
        const previousAttendances = [...attendances];
        const existingIndex = attendances.findIndex(a => a.studentId === studentId);

        if (existingIndex !== -1) {
            // Update existing attendance optimistically
            const updatedAttendances = [...attendances];
            updatedAttendances[existingIndex] = {
                ...updatedAttendances[existingIndex],
                status,
                checkInTime: new Date().toISOString(),
                isRecorded: true
            };
            setAttendances(updatedAttendances);
        } else {
            // Add new attendance optimistically
            const newAttendance = {
                id: `temp-${Date.now()}`,
                studentId,
                status,
                checkInTime: new Date().toISOString(),
                note: '',
                isRecorded: true
            };
            setAttendances([...attendances, newAttendance]);
        }

        try {
            const attendanceData = {
                studentId,
                status,
                checkInTime: new Date().toISOString(),
                note: ''
            };

            let response;
            if (existingAttendance && existingAttendance.id && !existingAttendance.id.toString().startsWith('temp-')) {
                // Update existing attendance
                response = await api.put(`/admin/Attendance/${existingAttendance.id}`, {
                    status,
                    checkInTime: new Date().toISOString(),
                    note: ''
                });
            } else {
                // Create new attendance
                response = await api.post(`/admin/Attendance/session/${selectedSession.id}`, attendanceData);
            }

            // Update with real server data if available (to get real ID)
            const serverData = response?.data?.data;
            if (serverData) {
                setAttendances(prev => prev.map(a =>
                    a.studentId === studentId
                        ? {
                            ...a,
                            id: serverData.id || a.id,
                            status: serverData.status || status,
                            isRecorded: true,
                            checkInTime: serverData.checkInTime || a.checkInTime
                        }
                        : a
                ));
            }

            toast.success('حضور و غیاب ثبت شد');
        } catch (error) {
            console.error('Error updating attendance:', error);
            // Revert to previous state on error
            setAttendances(previousAttendances);
            toast.error('خطا در ثبت حضور و غیاب');
        }
    };

    const getAttendanceStatus = (studentId) => {
        if (!Array.isArray(attendances)) return { status: 'NotRecorded', isRecorded: false };
        const attendance = attendances.find(a => a.studentId === studentId);
        if (attendance && attendance.status && attendance.status !== 'NotRecorded') {
            return { status: attendance.status, isRecorded: true };
        }
        return { status: 'NotRecorded', isRecorded: false };
    };

    const getAttendanceStats = () => {
        if (!selectedSession || !Array.isArray(attendances) || attendances.length === 0) {
            return { present: 0, absent: 0, late: 0, total: Array.isArray(students) ? students.length : 0 };
        }

        const present = attendances.filter(a => a.status === 'Present').length;
        const absent = attendances.filter(a => a.status === 'Absent').length;
        const late = attendances.filter(a => a.status === 'Late').length;

        return { present, absent, late, total: Array.isArray(students) ? students.length : 0 };
    };
    const getStatusBadge = (status, isRecorded) => {
        const statusConfig = {
            Present: { color: 'emerald', text: 'حاضر', icon: CheckCircle2 },
            Absent: { color: 'red', text: 'غایب', icon: XCircle },
            Late: { color: 'amber', text: 'تأخیر', icon: AlertCircle },
            NotRecorded: { color: 'slate', text: 'ثبت نشده', icon: Clock }
        };

        const config = statusConfig[status] || statusConfig.NotRecorded;
        const IconComponent = config.icon;

        return (
            <div className="flex items-center gap-2">
                <Badge color={config.color} size="sm" className="flex items-center gap-1">
                    <IconComponent size={12} />
                    {config.text}
                </Badge>
                {isRecorded && (
                    <Badge color="indigo" size="sm" className="flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        ثبت شده
                    </Badge>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const stats = getAttendanceStats();

    return (
        <div className="space-y-6">
            {/* Error Alert */}
            {apiError && (
                <APIErrorAlert
                    error={apiError}
                    onRetry={() => {
                        setApiError(null);
                        fetchSchedules();
                    }}
                    onClose={() => setApiError(null)}
                />
            )}

            {/* Header */}
            <div className="bg-gradient-to-br from-white via-slate-50/30 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20 backdrop-blur-sm p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                مدیریت حضور و غیاب
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {courseName} - {schedules.length} زمان‌بندی
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={async () => {
                                setApiError(null);
                                setLoading(true);
                                await fetchSchedules();
                                if (selectedSchedule) {
                                    await fetchScheduleStudents(selectedSchedule.id);
                                    await fetchScheduleSessions(selectedSchedule.id);
                                }
                                toast.success('داده‌ها به‌روزرسانی شد');
                            }}
                            variant="outline"
                            size="sm"
                            className="!px-4 !py-2"
                            disabled={loading}
                        >
                            <svg className={`w-4 h-4 ml-1 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {loading ? 'در حال بارگذاری...' : 'بارگذاری مجدد'}
                        </Button>
                        <Button
                            onClick={() => setShowSessionForm(true)}
                            size="sm"
                            className="!px-4 !py-2"
                            disabled={!selectedSchedule}
                            title={!selectedSchedule ? "ابتدا یک زمان‌بندی انتخاب کنید" : ""}
                        >
                            <Plus size={16} className="ml-1" />
                            جلسه جدید
                        </Button>
                    </div>
                </div>
            </div>
            {/* Session Form */}
            {showSessionForm && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                                {editingSession ? 'ویرایش جلسه' : 'ایجاد جلسه جدید'}
                            </h4>
                            {selectedSchedule && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    برای زمان‌بندی: {selectedSchedule.title} ({selectedSchedule.fullScheduleText})
                                </p>
                            )}
                        </div>
                        {!selectedSchedule && (
                            <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-lg">
                                ابتدا زمان‌بندی انتخاب کنید
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleCreateSession} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    عنوان جلسه
                                </label>
                                <input
                                    type="text"
                                    value={sessionForm.title}
                                    onChange={(e) => setSessionForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="مثال: جلسه اول - مقدمات"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    شماره جلسه
                                </label>
                                <input
                                    type="number"
                                    value={sessionForm.sessionNumber}
                                    onChange={(e) => setSessionForm(prev => ({ ...prev, sessionNumber: e.target.value }))}
                                    min="1"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    تاریخ و زمان
                                </label>
                                <input
                                    type="datetime-local"
                                    value={sessionForm.sessionDate}
                                    onChange={(e) => setSessionForm(prev => ({ ...prev, sessionDate: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    مدت زمان (دقیقه)
                                </label>
                                <select
                                    value={sessionForm.duration}
                                    onChange={(e) => setSessionForm(prev => ({ ...prev, duration: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="60">60 دقیقه</option>
                                    <option value="90">90 دقیقه</option>
                                    <option value="120">120 دقیقه</option>
                                    <option value="150">150 دقیقه</option>
                                    <option value="180">180 دقیقه</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                size="sm"
                                disabled={!selectedSchedule && !editingSession}
                            >
                                <Save size={16} className="ml-1" />
                                {editingSession ? 'ویرایش جلسه' : 'ایجاد جلسه'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setShowSessionForm(false);
                                    setEditingSession(null);
                                    setSessionForm({ title: '', sessionDate: '', duration: '90', sessionNumber: 1, scheduleId: null });
                                }}
                            >
                                انصراف
                            </Button>
                        </div>
                    </form>
                </div>
            )}
            <div className="grid lg:grid-cols-12 gap-6">
                {/* Schedules List */}
                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Clock size={20} />
                            زمان‌بندی‌های دوره
                        </h4>

                        {schedules.length === 0 ? (
                            <div className="text-center py-8">
                                <Clock className="mx-auto text-slate-400 mb-4" size={48} />
                                <p className="text-slate-500 dark:text-slate-400">
                                    هنوز زمان‌بندی‌ای تعریف نشده است
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {Array.isArray(schedules) && schedules.map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedSchedule?.id === schedule.id
                                            ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                        onClick={() => {
                                            setSelectedSchedule(schedule);
                                            setSelectedSession(null);
                                            setAttendances([]);
                                        }}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h5 className="font-bold text-slate-800 dark:text-white">
                                                    {schedule.title}
                                                </h5>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {schedule.fullScheduleText}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Users size={12} />
                                                {schedule.enrolledCount}/{schedule.maxCapacity} نفر
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${schedule.hasCapacity
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                {schedule.hasCapacity ? 'ظرفیت دارد' : 'تکمیل شده'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {/* Sessions List for Selected Schedule */}
                {selectedSchedule && (
                    <div className="lg:col-span-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <CalendarDays size={20} />
                                    جلسات {selectedSchedule.title}
                                </h4>
                                <Button
                                    onClick={() => {
                                        setSessionForm(prev => ({ ...prev, scheduleId: selectedSchedule.id }));
                                        setShowSessionForm(true);
                                    }}
                                    size="sm"
                                    className="!px-3 !py-1.5"
                                >
                                    <Plus size={14} className="ml-1" />
                                    جلسه جدید
                                </Button>
                            </div>

                            {sessions.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="mx-auto text-slate-400 mb-4" size={48} />
                                    <p className="text-slate-500 dark:text-slate-400">
                                        هنوز جلسه‌ای تعریف نشده است
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {Array.isArray(sessions) && sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedSession?.id === session.id
                                                ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}
                                            onClick={() => {
                                                setSelectedSession(session);
                                                fetchAttendance(session.id);
                                            }}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h5 className="font-bold text-slate-800 dark:text-white">
                                                        جلسه {session.sessionNumber}
                                                    </h5>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {session.title}
                                                    </p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingSession(session);
                                                            const d = new Date(session.sessionDate);
                                                            const localDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                                                            const durParts = session.duration?.split(':');
                                                            const durMins = durParts ? (parseInt(durParts[0]) * 60 + parseInt(durParts[1])).toString() : '90';

                                                            setSessionForm({
                                                                title: session.title,
                                                                sessionDate: localDate,
                                                                duration: durMins,
                                                                sessionNumber: session.sessionNumber,
                                                                scheduleId: selectedSchedule.id
                                                            });
                                                            setShowSessionForm(true);
                                                        }}
                                                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteSession(session.id);
                                                        }}
                                                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {formatDate(session.sessionDate)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Timer size={12} />
                                                    {session.duration?.split(':')[0] || '90'} دقیقه
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Attendance Management */}
                <div className={selectedSchedule ? "lg:col-span-4" : "lg:col-span-8"}>
                    {selectedSession ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                                        حضور و غیاب - جلسه {selectedSession.sessionNumber}
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {selectedSession.title} - {formatDate(selectedSession.sessionDate)}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="flex gap-2">
                                    <Badge color="emerald" size="sm">حاضر: {stats.present}</Badge>
                                    <Badge color="red" size="sm">غایب: {stats.absent}</Badge>
                                    <Badge color="amber" size="sm">تأخیر: {stats.late}</Badge>
                                </div>
                            </div>

                            {attendanceLoading ? (
                                <div className="animate-pulse space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    ))}
                                </div>
                            ) : studentsLoading ? (
                                <div className="animate-pulse space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    ))}
                                </div>
                            ) : students.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="mx-auto text-slate-400 mb-4" size={48} />
                                    <p className="text-slate-500 dark:text-slate-400">
                                        هیچ دانشجویی در این زمان‌بندی ثبت‌نام نکرده است
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {Array.isArray(students) && students.map((student) => {
                                        const { status, isRecorded } = getAttendanceStatus(student.userId || student.id);
                                        return (
                                            <div
                                                key={student.userId || student.id}
                                                className={`flex items-center justify-between p-4 border rounded-xl ${isRecorded
                                                    ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-900/10'
                                                    : 'border-slate-200 dark:border-slate-700'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-bold">
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

                                                <div className="flex items-center gap-3">
                                                    {getStatusBadge(status, isRecorded)}

                                                    {isRecorded && (
                                                        <button
                                                            onClick={() => {
                                                                // Remove the attendance record to allow re-recording
                                                                setAttendances(prev => prev.filter(a => a.studentId !== (student.userId || student.id)));
                                                                toast.info('می‌توانید مجدداً حضور و غیاب را ثبت کنید');
                                                            }}
                                                            className="text-xs px-2 py-1 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors dark:bg-indigo-900/20 dark:text-indigo-400"
                                                            title="ویرایش حضور و غیاب"
                                                        >
                                                            <Edit2 size={12} className="inline ml-1" />
                                                            ویرایش
                                                        </button>
                                                    )}

                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleAttendanceChange(student.userId || student.id, 'Present')}
                                                            disabled={isRecorded}
                                                            title={isRecorded ? 'حضور و غیاب قبلاً ثبت شده است' : 'حاضر'}
                                                            className={`p-2 rounded-lg transition-colors ${status === 'Present'
                                                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 ring-2 ring-emerald-300'
                                                                : isRecorded
                                                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                                                                    : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-900/20'
                                                                }`}
                                                        >
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAttendanceChange(student.userId || student.id, 'Late')}
                                                            disabled={isRecorded}
                                                            title={isRecorded ? 'حضور و غیاب قبلاً ثبت شده است' : 'تأخیر'}
                                                            className={`p-2 rounded-lg transition-colors ${status === 'Late'
                                                                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 ring-2 ring-amber-300'
                                                                : isRecorded
                                                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                                                                    : 'bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-600 dark:bg-slate-800 dark:hover:bg-amber-900/20'
                                                                }`}
                                                        >
                                                            <AlertCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAttendanceChange(student.userId || student.id, 'Absent')}
                                                            disabled={isRecorded}
                                                            title={isRecorded ? 'حضور و غیاب قبلاً ثبت شده است' : 'غایب'}
                                                            className={`p-2 rounded-lg transition-colors ${status === 'Absent'
                                                                ? 'bg-red-100 text-red-600 dark:bg-red-900/20 ring-2 ring-red-300'
                                                                : isRecorded
                                                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                                                                    : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-red-900/20'
                                                                }`}
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : !selectedSchedule ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                            <Clock className="mx-auto text-slate-400 mb-4" size={48} />
                            <h4 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">
                                زمان‌بندی انتخاب نشده
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400">
                                ابتدا یکی از زمان‌بندی‌های دوره را انتخاب کنید
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                            <Calendar className="mx-auto text-slate-400 mb-4" size={48} />
                            <h4 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">
                                جلسه‌ای انتخاب نشده
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400">
                                برای مدیریت حضور و غیاب، یکی از جلسات را انتخاب کنید
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceManagement;