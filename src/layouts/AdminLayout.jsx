import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, BookOpen, Users, Award, LogOut, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ✅ اصلاح رنگ‌های حالت فعال برای کنتراست بهتر در Dark Mode
const SidebarItem = ({ icon: Icon, label, to, active }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-bold text-sm 
        ${active
            // 💡 اصلاح: برای Dark Mode از رنگ روشن‌تر indigo و shadow ظریف استفاده شد
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 dark:bg-indigo-700 dark:text-indigo-100 dark:shadow-indigo-900/40'
            : 'text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
        }`}
    >
        <Icon size={20} />
        <span>{label}</span>
    </Link>
);

const ROLE_LABELS = {
    'Manager': 'مدیر ارشد',
    'Admin': 'ادمین',
    'Instructor': 'مدرس',
    'Student': 'دانشجو',
    'User': 'کاربر'
};

const AdminLayout = ({ children }) => {
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation().pathname;

    const userRolesPersian = user?.roles?.map(role => ROLE_LABELS[role] || role).join('، ');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300" dir="rtl">

            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 hidden lg:flex flex-col fixed h-full z-20 transition-colors duration-300">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                        <GraduationCap size={22} />
                    </div>
                    <span className="text-lg font-black text-slate-800 dark:text-white">پنل مدیریت</span>
                </div>

                <div className="px-4 space-y-1 mt-4 flex-grow">
                    <SidebarItem icon={LayoutDashboard} label="داشبورد" to="/admin" active={location === '/admin'} />

                    {/* مسیر فعلی شما /admin/categories است، پس باید فعال باشد */}
                    {hasRole(['Admin', 'Manager', 'Instructor']) && (
                        <SidebarItem icon={BookOpen} label="مدیریت دوره‌ها" to="/admin/courses" active={location.includes('/admin/courses')} />
                    )}

                    {hasRole(['Admin', 'Manager']) && (
                        <SidebarItem icon={Award} label="دسته‌بندی‌ها" to="/admin/categories" active={location.includes('/admin/categories')} />
                    )}

                    {hasRole(['Manager']) && (
                        <SidebarItem icon={Users} label="مدیریت کاربران" to="/admin/users" active={location.includes('/admin/users')} />
                    )}
                </div>

                <div className="p-4 border-t border-slate-50 dark:border-slate-800">
                    {/* باکس پروفایل کوچک پایین سایدبار */}
                    {/* 💡 اصلاح: افزایش روشنایی پس‌زمینه در Dark Mode به slate-800 */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-3 flex items-center gap-3 border border-slate-100 dark:border-slate-700 transition-colors">

                        {/* ✅ اصلاح رنگ نمایش کاراکتر اول اسم کاربر */}
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs">
                            {user?.name?.charAt(0)}
                        </div>

                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{user?.fullName || user?.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-medium">
                                {userRolesPersian}
                            </p>
                        </div>
                    </div>

                    {/* 💡 اصلاح: افزایش روشنایی text-red در Dark Mode برای کنتراست بهتر */}
                    <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-bold text-sm">
                        <LogOut size={20} />
                        <span>خروج</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-grow lg:mr-64 p-4 lg:p-8 transition-all duration-300">
                <header className="flex justify-between items-center mb-8">
                    <div className="hidden lg:block">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">خوش برگشتی، {user?.fullName || user?.name} 👋</h2>
                        <p className="text-slate-400 dark:text-slate-500 text-sm font-bold mt-1">امروز چه چیزی را مدیریت می‌کنیم؟</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* ✅ اصلاح رنگ باکس آیکون پیام‌ها */}
                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-400 shadow-sm relative transition-colors">
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                            <Mail size={18} />
                        </div>

                        {/* ✅ اصلاح رنگ باکس نمایش کاراکتر اول اسم کاربر در سربرگ */}
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-slate-700 rounded-full border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                            <div className="w-full h-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {children}
            </main>
        </div>
    );
};
export default AdminLayout;