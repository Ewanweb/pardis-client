import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, BookOpen, Users, Award, LogOut, Mail, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-bold text-sm ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}>
        <Icon size={20} />
        <span>{label}</span>
    </Link>
);

const AdminLayout = ({ children }) => {
    const { user, logout, hasRole } = useAuth(); // hasRole را اینجا استفاده میکنیم
    const navigate = useNavigate();
    const location = useLocation().pathname;

    return (
        <div className="min-h-screen bg-slate-50 flex" dir="rtl">
            <aside className="w-64 bg-white border-l border-slate-100 hidden lg:flex flex-col fixed h-full z-20">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                        <GraduationCap size={22} />
                    </div>
                    <span className="text-lg font-black text-slate-800">پنل مدیریت</span>
                </div>

                <div className="px-4 space-y-1 mt-4 flex-grow">
                    {/* همه می‌بینند */}
                    <SidebarItem icon={LayoutDashboard} label="داشبورد" to="/admin" active={location === '/admin'} />

                    {/* ادمین، منیجر و مدرس می‌بینند */}
                    {hasRole(['Admin', 'Manager', 'Instructor']) && (
                        <SidebarItem icon={BookOpen} label="مدیریت دوره‌ها" to="/admin/courses" active={location.includes('/admin/courses')} />
                    )}

                    {/* فقط ادمین و منیجر می‌بینند */}
                    {hasRole(['Admin', 'Manager']) && (
                        <SidebarItem icon={Award} label="دسته‌بندی‌ها" to="/admin/categories" active={location.includes('/admin/categories')} />
                    )}

                    {/* فقط منیجر می‌بیند (طبق روت لاراول برای تغییر نقش) */}
                    {hasRole(['Manager']) && (
                        <SidebarItem icon={Users} label="مدیریت کاربران" to="/admin/users" active={location.includes('/admin/users')} />
                    )}
                </div>

                <div className="p-4 border-t border-slate-50">
                    <div className="bg-slate-50 rounded-xl p-4 mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-700 truncate">{user?.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{user?.roles?.[0]}</p>
                        </div>
                    </div>
                    <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-500 hover:bg-red-50 transition-colors font-bold text-sm">
                        <LogOut size={20} />
                        <span>خروج از حساب</span>
                    </button>
                </div>
            </aside>

            <main className="flex-grow lg:mr-64 p-4 lg:p-8">
                {/* ... (هدر موبایل مثل قبل) ... */}
                {children}
            </main>
        </div>
    );
};
export default AdminLayout;