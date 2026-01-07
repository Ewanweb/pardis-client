import { useState, useEffect } from 'react';
import { BookOpen, Clock, Award, TrendingUp, Calendar, Play, CheckCircle2, Users, Target, BarChart3 } from 'lucide-react';
import { Button, Badge } from '../../components/UI';
import { apiClient } from '../../services/api';
import { formatDate, getImageUrl } from '../../services/Libs';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        enrolledCourses: 0,
        completedCourses: 0,
        totalProgress: 0,
        studyHours: 0
    });
    const [courses, setCourses] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch user's enrolled courses
            const coursesResult = await apiClient.get('/courses/my-enrollments', {
                showErrorAlert: false
            });

            if (coursesResult.success) {
                const userCourses = coursesResult.data || [];
                setCourses(userCourses);

                // Calculate stats
                const enrolled = userCourses.length;
                const completed = userCourses.filter(c => c.isCompleted).length;
                const totalProgress = userCourses.reduce((sum, c) => sum + (c.progress || 0), 0);
                const avgProgress = enrolled > 0 ? Math.round(totalProgress / enrolled) : 0;

                setStats({
                    enrolledCourses: enrolled,
                    completedCourses: completed,
                    totalProgress: avgProgress,
                    studyHours: Math.round(enrolled * 2.5) // Mock calculation
                });

                // Mock recent activity
                setRecentActivity([
                    {
                        id: 1,
                        type: 'lesson_completed',
                        title: 'تکمیل درس جاوا اسکریپت پیشرفته',
                        course: 'دوره برنامه‌نویسی وب',
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: 2,
                        type: 'quiz_passed',
                        title: 'قبولی در آزمون React Hooks',
                        course: 'دوره React پیشرفته',
                        timestamp: new Date(Date.now() - 86400000).toISOString()
                    }
                ]);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'emerald';
        if (progress >= 50) return 'blue';
        if (progress >= 20) return 'amber';
        return 'slate';
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'lesson_completed':
                return <CheckCircle2 size={16} className="text-emerald-500" />;
            case 'quiz_passed':
                return <Award size={16} className="text-blue-500" />;
            case 'course_enrolled':
                return <BookOpen size={16} className="text-indigo-500" />;
            default:
                return <Clock size={16} className="text-slate-500" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <Navbar />
                <div className="pt-28 pb-20">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                                <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Navbar />

            <div className="pt-28 pb-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                            سلام {user?.fullName || user?.name} 👋
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            به داشبورد یادگیری خود خوش آمدید. امروز چه چیزی یاد می‌گیریم؟
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">دوره‌های من</p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.enrolledCourses}</p>
                                </div>
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                    <BookOpen size={24} className="text-indigo-600 dark:text-indigo-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">تکمیل شده</p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.completedCourses}</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                    <Award size={24} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">میانگین پیشرفت</p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalProgress}%</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                    <TrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">ساعات مطالعه</p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.studyHours}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                    <Clock size={24} className="text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* My Courses */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">دوره‌های من</h2>
                                    <Button variant="outline" size="sm">
                                        مشاهده همه
                                    </Button>
                                </div>

                                {courses.length === 0 ? (
                                    <div className="text-center py-12">
                                        <BookOpen className="mx-auto text-slate-400 mb-4" size={48} />
                                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                                            هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید
                                        </p>
                                        <Button onClick={() => window.location.href = '/courses'}>
                                            مشاهده دوره‌ها
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {courses.slice(0, 3).map((course) => (
                                            <div key={course.id} className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                                                    <img
                                                        src={getImageUrl(course.thumbnail)}
                                                        alt={course.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => e.target.src = "https://placehold.co/400x300/1e1b4b/FFF?text=Course"}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-slate-800 dark:text-white mb-1 line-clamp-1">
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                                        مدرس: {course.instructor?.fullName || 'نامشخص'}
                                                    </p>

                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                            <div
                                                                className={`bg-${getProgressColor(course.progress || 0)}-500 h-2 rounded-full transition-all duration-300`}
                                                                style={{ width: `${course.progress || 0}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                            {course.progress || 0}%
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {course.isCompleted ? (
                                                        <Badge color="emerald" className="flex items-center gap-1">
                                                            <Award size={12} />
                                                            تکمیل شده
                                                        </Badge>
                                                    ) : (
                                                        <Button size="sm" className="flex items-center gap-1">
                                                            <Play size={12} />
                                                            ادامه
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity & Quick Actions */}
                        <div className="space-y-6">
                            {/* Recent Activity */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">فعالیت‌های اخیر</h3>

                                {recentActivity.length === 0 ? (
                                    <div className="text-center py-8">
                                        <BarChart3 className="mx-auto text-slate-400 mb-2" size={32} />
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            فعالیتی ثبت نشده است
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {recentActivity.map((activity) => (
                                            <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getActivityIcon(activity.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                                                        {activity.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {activity.course}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {formatDate(activity.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">دسترسی سریع</h3>

                                <div className="space-y-2">
                                    <Button variant="outline" className="w-full justify-start">
                                        <BookOpen size={16} className="ml-2" />
                                        مشاهده همه دوره‌ها
                                    </Button>

                                    <Button variant="outline" className="w-full justify-start">
                                        <Calendar size={16} className="ml-2" />
                                        برنامه کلاس‌ها
                                    </Button>

                                    <Button variant="outline" className="w-full justify-start">
                                        <Award size={16} className="ml-2" />
                                        گواهینامه‌ها
                                    </Button>

                                    <Button variant="outline" className="w-full justify-start">
                                        <Users size={16} className="ml-2" />
                                        انجمن دانشجویان
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default StudentDashboard;