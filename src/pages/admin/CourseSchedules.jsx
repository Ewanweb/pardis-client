import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, Users, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/UI';
import toast, { Toaster } from 'react-hot-toast';

const DAYS_OF_WEEK = [
    { value: 0, label: 'یکشنبه' },
    { value: 1, label: 'دوشنبه' },
    { value: 2, label: 'سه‌شنبه' },
    { value: 3, label: 'چهارشنبه' },
    { value: 4, label: 'پنج‌شنبه' },
    { value: 5, label: 'جمعه' },
    { value: 6, label: 'شنبه' }
];

const CourseSchedules = () => {
    const { courseId } = useParams();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        dayOfWeek: 0,
        startTime: '',
        endTime: '',
        maxCapacity: 20,
        description: ''
    });

    useEffect(() => {
        fetchSchedules();
    }, [courseId]);

    const fetchSchedules = async () => {
        try {
            const response = await api.get(`/courses/${courseId}/schedules`);
            setSchedules(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching schedules:', error);
            toast.error('خطا در دریافت زمان‌بندی‌ها');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSchedule) {
                await api.put(`/courses/${courseId}/schedules/${editingSchedule.id}`, formData);
                toast.success('زمان‌بندی بروزرسانی شد');
            } else {
                await api.post(`/courses/${courseId}/schedules`, formData);
                toast.success('زمان‌بندی جدید ایجاد شد');
            }
            fetchSchedules();
            resetForm();
        } catch (error) {
            toast.error('خطا در ذخیره زمان‌بندی');
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
        setEditingSchedule(null);
        setShowModal(false);
    };

    return (
        <div className="space-y-6">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">مدیریت زمان‌بندی دوره</h2>
                    <p className="text-slate-500 text-sm mt-1">تنظیم زمان‌های برگزاری کلاس‌ها</p>
                </div>
                <Button onClick={() => setShowModal(true)} icon={Plus}>
                    زمان‌بندی جدید
                </Button>
            </div>

            {/* Schedules List */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">در حال بارگذاری...</div>
                ) : schedules.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">هیچ زمان‌بندی تعریف نشده است</div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {schedules.map((schedule) => (
                            <div key={schedule.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
                                            <Calendar size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white">{schedule.title}</h3>
                                            <p className="text-sm text-slate-500">{schedule.fullScheduleText}</p>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Users size={12} />
                                                    {schedule.enrolledCount}/{schedule.maxCapacity} نفر
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {schedule.timeRange}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingSchedule(schedule);
                                                setFormData({
                                                    title: schedule.title,
                                                    dayOfWeek: schedule.dayOfWeek,
                                                    startTime: schedule.startTime,
                                                    endTime: schedule.endTime,
                                                    maxCapacity: schedule.maxCapacity,
                                                    description: schedule.description || ''
                                                });
                                                setShowModal(true);
                                            }}
                                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseSchedules;
{/* Modal */ }
{
    showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">
                        {editingSchedule ? 'ویرایش زمان‌بندی' : 'زمان‌بندی جدید'}
                    </h3>
                    <button onClick={resetForm} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">عنوان</label>
                        <input
                            type="text"
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="مثال: کلاس صبح"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">روز هفته</label>
                        <select
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                            value={formData.dayOfWeek}
                            onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                        >
                            {DAYS_OF_WEEK.map(day => (
                                <option key={day.value} value={day.value}>{day.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ساعت شروع</label>
                            <input
                                type="time"
                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ساعت پایان</label>
                            <input
                                type="time"
                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">حداکثر ظرفیت</label>
                        <input
                            type="number"
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                            value={formData.maxCapacity}
                            onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                            min="1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">توضیحات (اختیاری)</label>
                        <textarea
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none resize-none"
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="توضیحات اضافی..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                            انصراف
                        </Button>
                        <Button type="submit" className="flex-1" icon={Save}>
                            {editingSchedule ? 'بروزرسانی' : 'ایجاد'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}