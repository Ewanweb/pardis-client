import React from 'react';
import { GraduationCap } from 'lucide-react';

const AuthLayout = ({ title, subtitle, children }) => (
    // ✅ اضافه شدن dark:bg-slate-950 برای پس‌زمینه کل صفحه
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300" dir="rtl">

        {/* پس‌زمینه متحرک (Blobs) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-primary/20 dark:bg-primary/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-[20%] right-[20%] w-96 h-96 bg-purple-200/40 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>

        {/* ✅ کارت وسط صفحه: اضافه شدن dark:bg-slate-900 و بوردر تیره */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 p-8 md:p-10 w-full max-w-lg relative z-10 transition-all duration-300">
            <div className="text-center mb-8">
                {/* آیکون لوگو */}
                <div className="inline-flex p-3 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light mb-4 shadow-inner">
                    <GraduationCap size={32} />
                </div>
                {/* تیتر و زیرعنوان */}
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">{title}</h1>
                <p className="text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>
            {children}
        </div>
    </div>
);

export default AuthLayout;