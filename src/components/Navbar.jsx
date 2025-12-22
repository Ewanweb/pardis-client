import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User, LogOut, Sun, Moon, ChevronDown, Menu, X, Layers, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Button } from './UI';

const ADMIN_ROLES = new Set([
    'Admin',
    'Manager',
    'Instructor',
    'EducationManager',
    'FinancialManager',
    'ITManager',
    'MarketingManager',
    'Accountant',
    'GeneralManager',
    'DepartmentManager',
    'CourseSupport',
    'EducationExpert',
    'InternalManager'
]);

const THEMES = [
    { id: 'blue', name: 'آبی ایرانی', color: '#1C39BB' },
    { id: 'green', name: 'سبز ایرانی', color: '#00A693' },
    { id: 'orange', name: 'نارنجی ایرانی', color: '#E25822' },
    { id: 'red', name: 'قرمز ایرانی', color: '#CC3333' },
    { id: 'pink', name: 'صورتی ایرانی', color: '#F77FBE' },
];

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

        let ticking = false;
        const updateScroll = () => setScrolled(window.scrollY > 20);
        updateScroll();

        const handleScroll = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => {
                updateScroll();
                ticking = false;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCategoryClick = useCallback((catSlug) => {
        setCatMenuOpen(false);
        if (catSlug) {
            navigate(`/category/${catSlug}`);
        } else {
            navigate('/'); // بازگشت به صفحه اصلی (همه دوره‌ها)
        }
    }, [navigate]);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled
            ? 'bg-gradient-to-r from-white/95 via-white/90 to-white/95 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-900/95 backdrop-blur-xl shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20 border-b border-slate-200/50 dark:border-slate-800/50 py-3'
            : 'bg-gradient-to-r from-transparent via-white/5 to-transparent dark:from-transparent dark:via-slate-900/5 dark:to-transparent py-6'
            }`}>
            <div className="container mx-auto px-4 flex items-center justify-between">

                {/* --- LOGO --- */}
                <Link to="/" className="flex items-center gap-2 sm:gap-3 group touch-friendly">
                    <div className="relative">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg sm:shadow-xl shadow-indigo-500/25 group-hover:shadow-2xl group-hover:shadow-indigo-500/40 transition-all duration-500 transform group-hover:rotate-6 group-hover:scale-110">
                            <GraduationCap size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl opacity-20 group-hover:opacity-40 blur transition-all duration-500"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg sm:text-xl font-black bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent tracking-tight">آکادمی پردیس توس</span>
                        <span className="text-[9px] sm:text-[10px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent -mt-1 hidden xs:block">Pardis Tous Academy</span>
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
                            aria-label="منوی دسته‌بندی دوره‌ها"
                            aria-expanded={catMenuOpen}
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
                            <button onClick={() => handleCategoryClick('')} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-primary-light/20 dark:hover:bg-slate-700 hover:text-primary rounded-xl transition-colors text-right" aria-label="مشاهده همه دوره‌ها">
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

                    {/* Admin Link (برای تمام نقش‌های مدیریتی و آموزشی) */}
                    {user && user.roles?.some(role => ADMIN_ROLES.has(role)) && (
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
                <div className="flex items-center gap-1 sm:gap-2">

                    {/* ✅ دکمه تغییر رنگ (Palette) - مخفی در موبایل کوچک */}
                    <div className="relative z-50 hidden xs:block">
                        <button
                            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                            className="p-2 sm:p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group relative touch-friendly"
                            title="تغییر رنگ تم"
                            aria-label="انتخاب رنگ قالب"
                            aria-expanded={themeMenuOpen}
                        >
                            <Palette size={18} className="sm:w-5 sm:h-5 text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors" />
                        </button>

                        {/* منوی انتخاب رنگ */}
                        {themeMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setThemeMenuOpen(false)}></div>
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-left">
                                    <div className="mb-2 px-2 py-1 text-xs font-bold text-slate-400">انتخاب رنگ قالب</div>
                                    {THEMES.map(t => (
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
                        className="p-2 sm:p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-friendly"
                        title={mode === 'dark' ? 'روشن کردن' : 'تاریک کردن'}
                        aria-label={mode === 'dark' ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'}
                    >
                        {mode === 'dark' ? <Sun size={18} className="sm:w-5 sm:h-5 text-amber-400" /> : <Moon size={18} className="sm:w-5 sm:h-5 text-indigo-900" />}
                    </button>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

                    {/* پروفایل کاربر یا دکمه ورود */}
                    {user ? (
                        <div className="flex items-center gap-2 sm:gap-3 pl-1 pr-2 sm:pr-4 py-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full shadow-sm hover:border-primary-light/50 transition-colors">
                            <div className="text-right hidden lg:block">
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{user.fullName}</p>
                                <p className="text-[10px] text-slate-400">کاربر فعال</p>
                            </div>
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary-light/20 dark:bg-slate-700 rounded-full flex items-center justify-center text-primary dark:text-primary border border-primary-light/20 dark:border-slate-600">
                                <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </div>
                            <button onClick={() => { logout(); navigate('/'); }} className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors touch-friendly" title="خروج" aria-label="خروج از حساب کاربری">
                                <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Link to="/login" className="hidden sm:inline-flex px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary-light/10 dark:hover:bg-slate-800 text-sm transition-colors touch-friendly">
                                ورود
                            </Link>
                            <Link to="/register">
                                <Button className="!px-3 sm:!px-5 !py-2 sm:!py-2.5 !text-sm !rounded-lg sm:!rounded-xl !bg-primary hover:!bg-primary-hover !shadow-lg !shadow-primary/30 border-none text-white touch-friendly">ثبت نام</Button>
                            </Link>
                        </div>
                    )}

                    {/* دکمه منوی موبایل */}
                    <button className="md:hidden p-2 text-slate-600 dark:text-slate-300 touch-friendly" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="منوی موبایل" aria-expanded={mobileMenuOpen}>
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* --- MOBILE MENU (منوی موبایل) --- */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 mobile-padding mobile-optimized animate-in slide-in-from-top-5">
                    <div className="flex flex-col gap-2 py-4">
                        <Link to="/" className="px-4 py-4 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 touch-friendly" onClick={() => setMobileMenuOpen(false)}>صفحه اصلی</Link>

                        {user && (
                            <Link to="/profile" className="px-4 py-4 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 touch-friendly" onClick={() => setMobileMenuOpen(false)}>پروفایل من</Link>
                        )}

                        <div className="px-4 py-2">
                            <span className="text-xs font-bold text-slate-400 uppercase mb-3 block">دسته‌بندی‌ها</span>
                            <div className="space-y-2">
                                <button onClick={() => { handleCategoryClick(''); setMobileMenuOpen(false); }} className="flex items-center gap-2 w-full text-right text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary py-3 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 touch-friendly">
                                    <Layers size={16} />
                                    همه دوره‌ها
                                </button>
                                {categories.map(cat => (
                                    <button key={cat.id} onClick={() => { handleCategoryClick(cat.slug); setMobileMenuOpen(false); }} className="flex items-center gap-2 w-full text-right text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary py-3 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 touch-friendly">
                                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                                        {cat.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {user && user.roles?.some(role => ADMIN_ROLES.has(role)) && (
                                <Link to="/admin" className="px-4 py-4 rounded-xl font-bold text-primary bg-primary-light/10 touch-friendly" onClick={() => setMobileMenuOpen(false)}>
                                    ورود به پنل مدیریت
                                </Link>
                            )}

                        {/* منوی تم در موبایل */}
                        <div className="px-4 py-2 xs:hidden">
                            <span className="text-xs font-bold text-slate-400 uppercase mb-3 block">تم رنگی</span>
                            <div className="grid grid-cols-3 gap-2">
                                {THEMES.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => { setColorTheme(t.id); }}
                                        className={`flex items-center gap-2 p-3 rounded-lg text-xs font-bold transition-all touch-friendly ${colorTheme === t.id ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                    >
                                        <span className="w-4 h-4 rounded-full shadow-sm ring-1 ring-slate-200 dark:ring-slate-600" style={{ backgroundColor: t.color }}></span>
                                        <span className="hidden sm:inline">{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {!user && (
                            <div className="grid grid-cols-2 gap-3 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-4 font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl touch-friendly">ورود</Link>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-center py-4 font-bold text-white bg-primary rounded-xl touch-friendly">ثبت نام</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
