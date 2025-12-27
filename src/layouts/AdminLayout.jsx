import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, BookOpen, Users, Award, LogOut, Mail, DollarSign, FileText, CreditCard, Menu, X, Layers, Home, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { translateRoles } from '../services/Libs';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl transition-all duration-300 font-bold text-sm group
        ${active
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
    >
        <Icon size={18} className="flex-shrink-0" />
        <span className="truncate">{label}</span>
    </Link>
);




const AdminLayout = ({ children }) => {
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation().pathname;
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    // Close sidebar on route change
    React.useEffect(() => {
        setSidebarOpen(false);
    }, [location]);

    // Close sidebar when clicking outside on mobile
    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const userRolesPersian = translateRoles(user?.roles);

    // تابع کمکی برای استخراج اولین حرف
    const getInitial = (user) => {
        const name = user?.fullName || user?.name || 'U';
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300" dir="rtl">

            {/* --- SIDEBAR --- */}
            {/* --- MOBILE OVERLAY --- */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* --- SIDEBAR --- */}
            <aside className={`fixed inset-y-0 right-0 z-40 w-64 sm:w-72 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                {/* Sidebar Header */}
                <div className="p-4 sm:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                            <GraduationCap size={window.innerWidth >= 640 ? 22 : 18} />
                        </div>
                        <span className="text-base sm:text-lg font-black text-slate-800 dark:text-white">پنل مدیریت</span>
                    </div>

                    {/* Close button for mobile */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Menu */}
                <div className="px-3 sm:px-4 space-y-1 mt-2 sm:mt-4 flex-grow overflow-y-auto">
                    {/* داشبورد */}
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="داشبورد"
                        to="/admin"
                        active={location === '/admin'}
                    />

                    {/* ✅ ۱. مدیریت دوره‌ها (مخصوص مدیران آموزشی و بالاتر) */}
                    {hasRole(['Admin', 'Manager', 'EducationManager', 'GeneralManager', 'DepartmentManager']) && (
                        <SidebarItem
                            icon={BookOpen}
                            label="مدیریت دوره‌ها"
                            to="/admin/courses"
                            active={location.startsWith('/admin/courses')}
                        />
                    )}

                    {/* ✅ ۲. دوره‌های من (مخصوص مدرسین و کارشناسان آموزش) */}
                    {hasRole(['Instructor', 'EducationExpert', 'CourseSupport']) && (
                        <SidebarItem
                            icon={GraduationCap}
                            label="دوره‌های من"
                            to="/admin/my-courses"
                            active={location.startsWith('/admin/my-courses')}
                        />
                    )}

                    {/* دسته‌بندی‌ها (مخصوص مدیران سیستم و آموزش) */}
                    {hasRole(['Admin', 'Manager', 'EducationManager', 'GeneralManager']) && (
                        <SidebarItem
                            icon={Award}
                            label="دسته‌بندی‌ها"
                            to="/admin/categories"
                            active={location.startsWith('/admin/categories')}
                        />
                    )}

                    {/* مدیریت اسلایدها و استوری‌ها (مخصوص مدیران محتوا و بالاتر) */}
                    {hasRole(['Admin', 'Manager', 'GeneralManager', 'EducationManager', 'ContentManager']) && (
                        <SidebarItem
                            icon={Layers}
                            label="اسلایدها و استوری‌ها"
                            to="/admin/sliders"
                            active={location.startsWith('/admin/sliders')}
                        />
                    )}

                    {/* مدیریت کاربران (مخصوص مدیران ارشد) */}
                    {hasRole(['Manager', 'GeneralManager', 'ITManager', 'DepartmentManager']) && (
                        <SidebarItem
                            icon={Users}
                            label="مدیریت کاربران"
                            to="/admin/users"
                            active={location.startsWith('/admin/users')}
                        />
                    )}

                    {/* بخش حسابداری (مخصوص نقش‌های مالی) */}
                    {hasRole(['Admin', 'Manager', 'GeneralManager', 'FinancialManager', 'Accountant']) && (
                        <>
                            <div className="px-4 py-2 mt-4 sm:mt-6 mb-2">
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    حسابداری و مالی
                                </span>
                            </div>

                            <SidebarItem
                                icon={DollarSign}
                                label="داشبورد مالی"
                                to="/admin/accounting"
                                active={location.startsWith('/admin/accounting')}
                            />

                            <SidebarItem
                                icon={CreditCard}
                                label="مدیریت پرداخت‌ها"
                                to="/admin/payments"
                                active={location.startsWith('/admin/payments')}
                            />

                            <SidebarItem
                                icon={FileText}
                                label="گزارش‌های مالی"
                                to="/admin/reports"
                                active={location.startsWith('/admin/reports')}
                            />
                        </>
                    )}
                </div>

                {/* User Profile Section */}
                <div className="p-3 sm:p-4 border-t border-slate-50 dark:border-slate-800 mt-auto">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-3 flex items-center gap-3 border border-slate-100 dark:border-slate-700 transition-colors">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs flex-shrink-0">
                            {getInitial(user)}
                        </div>
                        <div className="overflow-hidden min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{user?.fullName || user?.name}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate font-medium">
                                {userRolesPersian}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-bold text-sm"
                    >
                        <LogOut size={18} />
                        <span>خروج</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-grow lg:mr-64 xl:mr-72 p-3 sm:p-4 lg:p-6 xl:p-8 transition-all duration-300 min-w-0">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -mr-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex-shrink-0"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="hidden sm:block min-w-0 flex-1">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white truncate">
                                خوش برگشتی، {user?.fullName || user?.name} 👋
                            </h2>
                            <p className="text-slate-400 dark:text-slate-500 text-sm font-bold mt-1">امروز چه چیزی را مدیریت می‌کنیم؟</p>
                        </div>
                        <div className="sm:hidden min-w-0 flex-1">
                            <h2 className="text-lg font-black text-slate-800 dark:text-white truncate">
                                سلام، {user?.fullName?.split(' ')[0] || user?.name} 👋
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {/* دکمه بازگشت به صفحه اصلی */}
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm font-medium group"
                            title="بازگشت به صفحه اصلی"
                        >
                            <Home size={16} className="group-hover:scale-110 transition-transform duration-300" />
                            <span className="hidden sm:inline">صفحه اصلی</span>
                            <ExternalLink size={12} className="opacity-70" />
                        </button>

                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm relative transition-colors">
                            <span className="absolute top-1.5 right-2 sm:top-2 sm:right-2.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
                            <Mail size={window.innerWidth >= 640 ? 18 : 16} />
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 dark:bg-slate-800 rounded-full border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                            <div className="w-full h-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm">
                                {getInitial(user)}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="min-w-0">
                    {children}
                </div>
            </main>
        </div>
    );
};
export default AdminLayout;