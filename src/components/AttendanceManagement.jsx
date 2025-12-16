import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle2, XCircle, AlertCircle, Plus, Edit2, Trash2, Save, X, User, CalendarDays, Timer } from 'lucide-react';
import { Button, Badge } from './UI';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatDate, formatTimeRange, DAY_NAMES } from '../services/Libs';
import { APIErrorAlert } from './Alert';
import toast from 'react-hot-toast';

const AttendanceManagement = ({ courseId, courseName }) => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [attendances, setAttendances] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [showSessionForm, setShowSessionForm] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [apiError, setApiError] = useState(null);

    const [sessionForm, setSessionForm] = useState({
        title: '',
        sessionDate: '',
        duration: '90',
        sessionNumber: 1
    });

    useEffect(() => {
        fetchSessions();
        fetchStudents();
    }, [courseId]);

    const fetchSessions = async () => {
        try {
            // Use the correct endpoint from Swagger documentation
            const response = await api.get(`/admin/Attendance/sessions/course/${courseId}`);

            // بر اساس پاسخ API، داده در response.data.data است
            if (response.data?.success && response.data?.data) {
                const sessionsData = response.data.data;
                setSessions(Array.isArray(sessionsData) ? sessionsData : []);
            } else {
                setSessions([]);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
            setApiError(error);
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            // Since this endpoint doesn't exist yet, we'll use a placeholder
            // This will be updated when the backend endpoint is implemented
            setStudents([]);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchAttendance = async (sessionId) => {
        setAttendanceLoading(true);
        try {
            // Use the correct endpoint from Swagger documentation
            const response = await api.get(`/admin/Attendance/session/${sessionId}`);
            setAttendances(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setApiError(error);
        } finally {
            setAttendanceLoading(false);
        }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();

        if (!sessionForm.title.trim() || !sessionForm.sessionDate) {
            toast.error('لطفاً تمام فیلدهای ضروری را پر کنید');
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
                }
            } else {
                // Create new session using POST endpoint
                const sessionData = {
                    courseId: courseId,
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
                    toast.success('جلسه ایجاد شد - در حال بارگذاری مجدد...');
                }
            }

            setSessionForm({ title: '', sessionDate: '', duration: '90', sessionNumber: 1 });
            setShowSessionForm(false);
            setEditingSession(null);

            // کمی صبر کن تا جلسه در دیتابیس ذخیره شود
            setTimeout(async () => {
                await fetchSessions();
            }, 1000);
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
            await fetchSessions();
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

        try {
            const attendanceData = {
                sessionId: selectedSession.id,
                studentId,
                status,
                recordedByUserId: user.id
            };

            // Check if attendance already exists
            const existingAttendance = attendances.find(a => a.studentId === studentId);

            if (existingAttendance) {
                await api.put(`/admin/attendance/${existingAttendance.id}`, {
                    ...attendanceData,
                    id: existingAttendance.id
                });
            } else {
                await api.post('/admin/attendance/session/' + selectedSession.id, attendanceData);
            }

            await fetchAttendance(selectedSession.id);
            toast.success('حضور و غیاب ثبت شد');
        } catch (error) {
            toast.error('خطا در ثبت حضور و غیاب');
        }
    };

    const getAttendanceStatus = (studentId) => {
        const attendance = attendances.find(a => a.studentId === studentId);
        return attendance?.status || 'NotRecorded';
    };

    const getAttendanceStats = () => {
        if (!selectedSession || attendances.length === 0) return { present: 0, absent: 0, late: 0, total: students.length };

        const present = attendances.filter(a => a.status === 'Present').length;
        const absent = attendances.filter(a => a.status === 'Absent').length;
        const late = attendances.filter(a => a.status === 'Late').length;

        return { present, absent, late, total: students.length };
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            Present: { color: 'emerald', text: 'حاضر', icon: CheckCircle2 },
            Absent: { color: 'red', text: 'غایب', icon: XCircle },
            Late: { color: 'amber', text: 'تأخیر', icon: AlertCircle },
            NotRecorded: { color: 'slate', text: 'ثبت نشده', icon: Clock }
        };

        const config = statusConfig[status] || statusConfig.NotRecorded;
        const IconComponent = config.icon;

        return (
            <Badge color={config.color} size="sm" className="flex items-center gap-1">
                <IconComponent size={12} />
                {config.text}
            </Badge>
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
                        fetchSessions();
                    }}
                    onClose={() => setApiError(null)}
                />
            )}

            {/* Header */}
            <div className="bg-gradient-to-br from-white via-slate-50/30 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                مدیریت حضور و غیاب
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {courseName} - {sessions.length} جلسه
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={() => {
                                setApiError(null);
                                fetchSessions();
                            }}
                            variant="outline"
                            size="sm"
                            className="!px-4 !py-2"
                        >
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            بارگذاری مجدد
                        </Button>
                        <Button
                            onClick={() => setShowSessionForm(true)}
                            size="sm"
                            className="!px-4 !py-2"
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
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                        {editingSession ? 'ویرایش جلسه' : 'ایجاد جلسه جدید'}
                    </h4>

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
                            <Button type="submit" size="sm">
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
                                    setSessionForm({ title: '', sessionDate: '', duration: '90', sessionNumber: 1 });
                                }}
                            >
                                انصراف
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid lg:grid-cols-12 gap-6">
                {/* Sessions List */}
                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <CalendarDays size={20} />
                            جلسات دوره
                        </h4>

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
                                                        setSessionForm({
                                                            title: session.title,
                                                            sessionDate: new Date(session.sessionDate).toISOString().slice(0, 16),
                                                            duration: session.duration?.split(':')[0] || '90',
                                                            sessionNumber: session.sessionNumber
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

                {/* Attendance Management */}
                <div className="lg:col-span-8">
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
                            ) : students.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="mx-auto text-slate-400 mb-4" size={48} />
                                    <p className="text-slate-500 dark:text-slate-400">
                                        هیچ دانشجویی در این دوره ثبت‌نام نکرده است
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {Array.isArray(students) && students.map((student) => {
                                        const status = getAttendanceStatus(student.id);
                                        return (
                                            <div
                                                key={student.id}
                                                className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl"
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
                                                    {getStatusBadge(status)}

                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleAttendanceChange(student.id, 'Present')}
                                                            className={`p-2 rounded-lg transition-colors ${status === 'Present'
                                                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20'
                                                                : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-900/20'
                                                                }`}
                                                        >
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAttendanceChange(student.id, 'Late')}
                                                            className={`p-2 rounded-lg transition-colors ${status === 'Late'
                                                                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20'
                                                                : 'bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-600 dark:bg-slate-800 dark:hover:bg-amber-900/20'
                                                                }`}
                                                        >
                                                            <AlertCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAttendanceChange(student.id, 'Absent')}
                                                            className={`p-2 rounded-lg transition-colors ${status === 'Absent'
                                                                ? 'bg-red-100 text-red-600 dark:bg-red-900/20'
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