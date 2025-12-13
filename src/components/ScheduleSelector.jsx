import React, { useState } from 'react';
import { Clock, Users, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './UI';
import { getDayName, formatTimeRange } from '../services/Libs';

const ScheduleSelector = ({ schedules, onScheduleSelect, selectedScheduleId, loading = false }) => {
    const [hoveredSchedule, setHoveredSchedule] = useState(null);

    if (!schedules || schedules.length === 0) {
        return (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center">
                <AlertCircle className="mx-auto text-amber-500 mb-3" size={48} />
                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">
                    زمان‌بندی تعریف نشده
                </h3>
                <p className="text-amber-600 dark:text-amber-300 text-sm">
                    برای این دوره هنوز زمان‌بندی تعریف نشده است. لطفاً بعداً مراجعه کنید.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
                <Clock className="text-primary" size={20} />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    انتخاب زمان برگزاری
                </h3>
            </div>

            <div className="grid gap-4">
                {schedules.map((schedule) => (
                    <div
                        key={schedule.id}
                        className={`relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${selectedScheduleId === schedule.id
                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 bg-white dark:bg-slate-800'
                            } ${!schedule.hasCapacity ? 'opacity-60 cursor-not-allowed' : ''}`}
                        onClick={() => schedule.hasCapacity && onScheduleSelect(schedule.id)}
                        onMouseEnter={() => setHoveredSchedule(schedule.id)}
                        onMouseLeave={() => setHoveredSchedule(null)}
                    >
                        {/* انتخاب شده */}
                        {selectedScheduleId === schedule.id && (
                            <div className="absolute top-3 left-3">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={16} className="text-white" />
                                </div>
                            </div>
                        )}

                        {/* عدم ظرفیت */}
                        {!schedule.hasCapacity && (
                            <div className="absolute top-3 left-3">
                                <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                                    تکمیل
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <h4 className="font-bold text-lg text-slate-800 dark:text-white">
                                        {schedule.title}
                                    </h4>
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                                        {schedule.fullScheduleText}
                                    </span>
                                </div>

                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                        <Clock size={16} className="text-primary" />
                                        <span>{formatTimeRange(schedule.startTime, schedule.endTime)}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                        <Users size={16} className="text-primary" />
                                        <span>
                                            {schedule.enrolledCount}/{schedule.maxCapacity} نفر
                                        </span>
                                    </div>

                                    {schedule.description && (
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                            <MapPin size={16} className="text-primary" />
                                            <span>{schedule.description}</span>
                                        </div>
                                    )}
                                </div>

                                {/* نوار پیشرفت ظرفیت */}
                                <div className="mt-4">
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
                        </div>

                        {/* Hover Effect */}
                        {hoveredSchedule === schedule.id && schedule.hasCapacity && (
                            <div className="absolute inset-0 bg-primary/5 rounded-2xl pointer-events-none"></div>
                        )}
                    </div>
                ))}
            </div>

            {selectedScheduleId && (
                <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 size={16} />
                        <span className="text-sm font-medium">
                            زمان‌بندی انتخاب شده: {schedules.find(s => s.id === selectedScheduleId)?.fullScheduleText}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleSelector;