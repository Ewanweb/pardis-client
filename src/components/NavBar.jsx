import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './UI';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm py-3' : 'bg-transparent py-5'}`}>
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300 transform group-hover:rotate-3">
                        <GraduationCap size={26} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-slate-800 tracking-tight">آکادمی پردیس</span>
                        <span className="text-[10px] font-bold text-indigo-500 -mt-1">Pardis Academy</span>
                    </div>
                </Link>

                <div className="hidden md:flex items-center gap-1 p-1.5 bg-slate-50/80 backdrop-blur rounded-2xl border border-slate-200/60">
                    {[
                        { name: 'صفحه اصلی', link: '/' },
                        { name: 'دوره‌های آموزشی', link: '/#courses' },
                        ...(user && (user.roles?.includes('Admin') || user.roles?.includes('Manager')) ? [{ name: 'پنل مدیریت', link: '/admin' }] : [])
                    ].map((item) => (
                        <a key={item.name} href={item.link} className="px-5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-indigo-700 hover:bg-white hover:shadow-sm transition-all">
                            {item.name}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-3 pl-1 pr-4 py-1 bg-white border border-slate-100 rounded-full shadow-sm">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-slate-700">{user.name}</p>
                                <p className="text-[10px] text-slate-400">کاربر</p>
                            </div>
                            <div className="w-9 h-9 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <User size={18} />
                            </div>
                            <button onClick={() => { logout(); navigate('/'); }} className="p-2 rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="hidden md:inline-flex font-bold text-slate-600 hover:text-indigo-600 text-sm transition-colors">
                                ورود به حساب
                            </Link>
                            <Link to="/register">
                                <Button className="!px-5 !py-2.5 !text-sm !rounded-lg shadow-none">ثبت نام رایگان</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};
export default Navbar;