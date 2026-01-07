import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Button } from './UI';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, FileText, X } from 'lucide-react';
import { formatDate } from '../services/Libs';
import toast from 'react-hot-toast';

const StudentAttendanceReport = ({
    studentId,
    courseId,
    studentName,
    onClose
}) => {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                // GET /api/admin/Attendance/student/{studentId}/course/{courseId}
                const response = await api.get(`/admin/Attendance/student/${studentId}/course/${courseId}`);

                if (response.data?.data) {
                    setReportData(response.data.data);
                } else if (response.data?.success === false) {
                    toast.error(response.data.message || 'خطا در دریافت گزارش');
                }
            } catch (error) {
                console.error('Error fetching student attendance report:', error);
                toast.error('خطا در دریافت گزارش حضور و غیاب');
            } finally {
                setLoading(false);
            }
        };

        if (studentId && courseId) {
            fetchReport();
        }
    }, [studentId, courseId]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Present': return <CheckCircle2 size={18} className="text-emerald-500" />;
            case 'Absent': return <XCircle size={18} className="text-red-500" />;
            case 'Late': return <AlertCircle size={18} className="text-amber-500" />;
            default: return <Clock size={18} className="text-slate-400" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Present': return 'حاضر';
            case 'Absent': return 'غایب';
            case 'Late': return 'تأخیر';
            default: return 'نامشخص';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20';
            case 'Absent': return 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
            case 'Late': return 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20';
            default: return 'text-slate-700 bg-slate-50 dark:text-slate-400 dark:bg-slate-800';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <FileText className="text-indigo-500" size={24} />
                            گزارش حضور و غیاب
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            دانشجو: <span className="font-bold text-slate-700 dark:text-slate-300">{studentName}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500">در حال دریافت اطلاعات...</p>
                        </div>
                    ) : !reportData ? (
                        <div className="text-center py-12 text-slate-500">
                            اطلاعاتی یافت نشد
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                                    <p className="text-xs text-slate-500 mb-1">تعداد جلسات</p>
                                    <p className="text-xl font-bold text-slate-800 dark:text-white">{reportData.totalSessions || 0}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-center">
                                    <p className="text-xs text-emerald-600 mb-1">حاضر</p>
                                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{reportData.presentCount || 0}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-center">
                                    <p className="text-xs text-red-600 mb-1">غایب</p>
                                    <p className="text-xl font-bold text-red-700 dark:text-red-400">{reportData.absentCount || 0}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 text-center">
                                    <p className="text-xs text-amber-600 mb-1">تأخیر</p>
                                    <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{reportData.lateCount || 0}</p>
                                </div>
                            </div>

                            {/* Attendance Percentage */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">درصد حضور کل:</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                            style={{ width: `${reportData.attendancePercentage || 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                                        {Math.round(reportData.attendancePercentage || 0)}%
                                    </span>
                                </div>
                            </div>

                            {/* Detailed List */}
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white mb-3 text-sm">جزئیات جلسات</h4>
                                {(!reportData.details || reportData.details.length === 0) ? (
                                    <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                        هنوز جلسه‌ای برای این دانشجو ثبت نشده است
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {reportData.details.map((detail, index) => (
                                            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                                                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(detail.status)}`}>
                                                        {getStatusIcon(detail.status)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-slate-800 dark:text-white text-sm">
                                                                {detail.sessionTitle || `جلسه ${index + 1}`}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(detail.status)}`}>
                                                                {getStatusText(detail.status)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                <Calendar size={12} />
                                                                {formatDate(detail.sessionDate)}
                                                            </span>
                                                            {detail.checkInTime && (
                                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                    <Clock size={12} />
                                                                    {new Date(detail.checkInTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {detail.note && (
                                                    <div className="text-xs bg-slate-50 dark:bg-slate-900 p-2 rounded text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                                        {detail.note}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        بستن
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StudentAttendanceReport;
