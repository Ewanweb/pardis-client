import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User, LogOut, Sun, Moon, ChevronDown, Menu, X, Layers, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Button } from './UI';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { mode, toggleMode, colorTheme, setColorTheme } = useTheme();
    const navigate = useNavigate();

    // استیت‌ها
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [catMenuOpen, setCatMenuOpen] = useState(false);
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);

    // دریافت دسته‌بندی‌ها و تنظیم اسکرول
    useEffect(() => {
        api.get('home/categories').then(res => {
            setCategories(res.data.data);
        }).catch(err => console.error("Error loading categories:", err));

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCategoryClick = (catSlug) => {
        setCatMenuOpen(false);
        if (catSlug) {
            navigate(`/category/${catSlug}`);
        } else {
            navigate('/'); // بازگشت به صفحه اصلی (همه دوره‌ها)
        }
    };

    // لیست رنگ‌های ایرانی برای پالت
    const themes = [
        { id: 'blue', name: 'آبی ایرانی', color: '#1C39BB' },
        { id: 'green', name: 'سبز ایرانی', color: '#00A693' },
        { id: 'orange', name: 'نارنجی ایرانی', color: '#E25822' },
        { id: 'red', name: 'قرمز ایرانی', color: '#CC3333' },
        { id: 'pink', name: 'صورتی ایرانی', color: '#F77FBE' },
    ];

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled
            ? 'bg-gradient-to-r from-white/95 via-white/90 to-white/95 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-900/95 backdrop-blur-xl shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20 border-b border-slate-200/50 dark:border-slate-800/50 py-3'
            : 'bg-gradient-to-r from-transparent via-white/5 to-transparent dark:from-transparent dark:via-slate-900/5 dark:to-transparent py-6'
            }`}>
            <div className="container mx-auto px-4 flex items-center justify-between">

                {/* --- LOGO --- */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 group-hover:shadow-2xl group-hover:shadow-indigo-500/40 transition-all duration-500 transform group-hover:rotate-6 group-hover:scale-110">
                            <GraduationCap size={28} strokeWidth={2.5} />
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 blur transition-all duration-500"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent tracking-tight">آکادمی پردیس</span>
                        <span className="text-[10px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent -mt-1">Pardis Academy</span>
                    </div>
                </Link>

                {/* --- DESKTOP MENU --- */}
                <div className="hidden md:flex items-center gap-1 p-2 bg-gradient-to-r from-slate-50/90 via-white/80 to-slate-50/90 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-600/40 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20">
                    <Link to="/" className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-gradient-to-r hover:from-white hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 hover:shadow-lg hover:shadow-slate-200/30 dark:hover:shadow-slate-800/30 transition-all duration-300 transform hover:scale-105">
                        صفحه اصلی
                    </Link>

                    {/* Categories Dropdown */}
                    <div className="relative group">
                        <button
                            className="flex items-center gap-1 px-5 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all"
                            onClick={() => setCatMenuOpen(!catMenuOpen)}
                            onMouseEnter={() => setCatMenuOpen(true)}
                        >
                            دوره‌ها
                            <ChevronDown size={14} className={`transition-transform duration-200 ${catMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Body */}
                        <div
                            className={`absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 transition-all duration-200 transform origin-top-right ${catMenuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
                            onMouseLeave={() => setCatMenuOpen(false)}
                        >
                            <div className="mb-2 px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                                دسته‌بندی‌ها
                            </div>
                            <button onClick={() => handleCategoryClick('')} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-primary-light/20 dark:hover:bg-slate-700 hover:text-primary rounded-xl transition-colors text-right">
                                <Layers size={16} />
                                همه دوره‌ها
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.slug)}
                                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-primary-light/20 dark:hover:bg-slate-700 hover:text-primary rounded-xl transition-colors text-right"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    {cat.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Admin Link (Only for Admins/Managers) */}
                    {user && (user.roles?.includes('Admin') || user.roles?.includes('Manager') || user.roles?.includes('Instructor')) && (
                        <Link to="/admin" className="px-5 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all">
                            پنل مدیریت
                        </Link>
                    )}
                    {user && (
                        <Link to="/profile" className="px-5 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all">
                            پروفایل
                        </Link>
                    )}
                </div>

                {/* --- ACTIONS --- */}
                <div className="flex items-center gap-2">

                    {/* ✅ دکمه تغییر رنگ (Palette) */}
                    <div className="relative z-50">
                        <button
                            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                            className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group relative"
                            title="تغییر رنگ تم"
                        >
                            <Palette size={20} className="text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors" />
                        </button>

                        {/* منوی انتخاب رنگ */}
                        {themeMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setThemeMenuOpen(false)}></div>
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-left">
                                    <div className="mb-2 px-2 py-1 text-xs font-bold text-slate-400">انتخاب رنگ قالب</div>
                                    {themes.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => { setColorTheme(t.id); setThemeMenuOpen(false); }}
                                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${colorTheme === t.id ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                        >
                                            <span className="w-5 h-5 rounded-full shadow-sm ring-1 ring-slate-200 dark:ring-slate-600" style={{ backgroundColor: t.color }}></span>
                                            {t.name}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* دکمه دارک مود */}
                    <button
                        onClick={toggleMode}
                        className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={mode === 'dark' ? 'روشن کردن' : 'تاریک کردن'}
                    >
                        {mode === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-900" />}
                    </button>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

                    {/* پروفایل کاربر یا دکمه ورود */}
                    {user ? (
                        <div className="flex items-center gap-3 pl-1 pr-4 py-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full shadow-sm hover:border-primary-light/50 transition-colors">
                            <div className="text-right hidden lg:block">
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{user.fullName}</p>
                                <p className="text-[10px] text-slate-400">کاربر فعال</p>

                            </div>
                            <div className="w-9 h-9 bg-primary-light/20 dark:bg-slate-700 rounded-full flex items-center justify-center text-primary dark:text-primary border border-primary-light/20 dark:border-slate-600">
                                <User size={18} />
                            </div>
                            <button onClick={() => { logout(); navigate('/'); }} className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="خروج">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="hidden sm:inline-flex px-4 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary-light/10 dark:hover:bg-slate-800 text-sm transition-colors">
                                ورود
                            </Link>
                            <Link to="/register">
                                <Button className="!px-5 !py-2.5 !text-sm !rounded-xl !bg-primary hover:!bg-primary-hover !shadow-lg !shadow-primary/30 border-none text-white">ثبت نام</Button>
                            </Link>
                        </div>
                    )}

                    {/* دکمه منوی موبایل */}
                    <button className="md:hidden p-2 text-slate-600 dark:text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* --- MOBILE MENU (منوی موبایل) --- */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 animate-in slide-in-from-top-5">
                    <div className="flex flex-col gap-2">
                        <Link to="/" className="px-4 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileMenuOpen(false)}>صفحه اصلی</Link>

                        <div className="px-4 py-2">
                            <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">دسته‌بندی‌ها</span>
                            <div className="grid grid-cols-2 gap-2">
                                {categories.map(cat => (
                                    <button key={cat.id} onClick={() => { handleCategoryClick(cat.id); setMobileMenuOpen(false); }} className="text-right text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary py-1">
                                        {cat.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {user && (user.roles?.includes('Admin') || user.roles?.includes('Manager')) && (
                            <Link to="/admin" className="px-4 py-3 rounded-xl font-bold text-primary bg-primary-light/10" onClick={() => setMobileMenuOpen(false)}>
                                ورود به پنل مدیریت
                            </Link>
                        )}

                        {!user && (
                            <div className="grid grid-cols-2 gap-3 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-3 font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl">ورود</Link>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-center py-3 font-bold text-white bg-primary rounded-xl">ثبت نام</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;