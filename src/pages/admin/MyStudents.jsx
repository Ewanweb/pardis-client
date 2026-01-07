import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Download, Eye, Mail, Phone, Calendar, BookOpen, TrendingUp, UserCheck, Clock, Award } from 'lucide-react';
import { Button, Badge } from '../../components/UI';
import { apiClient } from '../../services/api';
import { formatDate } from '../../services/Libs';
import { useAuth } from '../../context/AuthContext';

const MyStudents = () => {
    const { user } = useAuth();
    const [students, setStudents] = React.useState([]);
    const [courses, setCourses] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedCourse, setSelectedCourse] = React.useState('all');
    const [stats, setStats] = React.useState({
        totalStudents: 0,
        activeCourses: 0,
        completionRate: 0,
        averageProgress: 0
    });

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch instructor's courses first
            const coursesResult = await apiClient.get('/admin/courses/my-courses', {
                showErrorAlert: false
            });

            if (coursesResult.success) {
                const coursesData = Array.isArray(coursesResult.data) ? coursesResult.data : [];
                setCourses(coursesData);

                // Fetch students for all courses
                const studentsPromises = coursesData.map(course =>
                    apiClient.get(`/admin/courses/${course.id}/students`, {
                        showErrorAlert: false
                    })
                );

                const studentsResults = await Promise.all(studentsPromises);

                // Combine all students with course info
                const allStudents = [];
                studentsResults.forEach((result, index) => {
                    if (result.success && result.data) {
                        const courseStudents = result.data.map(student => ({
                            ...student,
                            courseName: coursesData[index].title,
                            courseId: coursesData[index].id
                        }));
                        allStudents.push(...courseStudents);
                    }
                });

                setStudents(allStudents);

                // Calculate stats
                const uniqueStudents = new Set(allStudents.map(s => s.studentId)).size;
                const completedCount = allStudents.filter(s => s.isCompleted).length;
                const completionRate = allStudents.length > 0 ? (completedCount / allStudents.length) * 100 : 0;

                setStats({
                    totalStudents: uniqueStudents,
                    activeCourses: coursesData.length,
                    completionRate: Math.round(completionRate),
                    averageProgress: Math.round(allStudents.reduce((sum, s) => sum + (s.progress || 0), 0) / allStudents.length || 0)
                });
            } else {
                // If API call fails, ensure courses is still an array
                setCourses([]);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            // Ensure state is properly set even on error
            setCourses([]);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse = selectedCourse === 'all' || student.courseId === selectedCourse;
        return matchesSearch && matchesCourse;
    });

    const getStatusBadge = (student) => {
        if (student.isCompleted) {
            return <Badge color="emerald" size="sm" className="flex items-center gap-1">
                <Award size={12} />
                تکمیل شده
            </Badge>;
        } else if (student.progress > 50) {
            return <Badge color="blue" size="sm" className="flex items-center gap-1">
                <TrendingUp size={12} />
                در حال پیشرفت
            </Badge>;
        } else {
            return <Badge color="amber" size="sm" className="flex items-center gap-1">
                <Clock size={12} />
                شروع کرده
            </Badge>;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                        ))}
                    </div>
                    <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                        <Users size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">دانشجویان من</h1>
                        <p className="text-slate-500 dark:text-slate-400">مدیریت و پیگیری دانشجویان دوره‌های شما</p>
                    </div>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Download size={16} />
                    خروجی Excel
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">کل دانشجویان</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalStudents}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <Users size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">دوره‌های فعال</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.activeCourses}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                            <BookOpen size={24} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">نرخ تکمیل</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.completionRate}%</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            <Award size={24} className="text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">میانگین پیشرفت</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.averageProgress}%</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} className="text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="جستجو در نام، ایمیل..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="md:w-64">
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="all">همه دوره‌ها</option>
                            {Array.isArray(courses) && courses.map(course => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        لیست دانشجویان ({filteredStudents.length})
                    </h3>
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="mx-auto text-slate-400 mb-4" size={48} />
                        <p className="text-slate-500 dark:text-slate-400">
                            {searchTerm || selectedCourse !== 'all' ? 'دانشجویی با این فیلتر یافت نشد' : 'هنوز دانشجویی ثبت‌نام نکرده است'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="text-right px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">دانشجو</th>
                                    <th className="text-right px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">دوره</th>
                                    <th className="text-right px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">وضعیت</th>
                                    <th className="text-right px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">پیشرفت</th>
                                    <th className="text-right px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">تاریخ ثبت‌نام</th>
                                    <th className="text-right px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">عملیات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredStudents.map((student, index) => (
                                    <tr key={`${student.studentId}-${student.courseId}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                                    {student.studentName?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800 dark:text-white">
                                                        {student.studentName || 'نام نامشخص'}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {student.studentEmail}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-800 dark:text-white">
                                                {student.courseName}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(student)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                    <div
                                                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${student.progress || 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                    {student.progress || 0}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {formatDate(student.enrollmentDate)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="outline">
                                                    <Eye size={14} />
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    <Mail size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyStudents;