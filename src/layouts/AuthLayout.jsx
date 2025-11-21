import React from 'react';
import { GraduationCap } from 'lucide-react';

const AuthLayout = ({ title, subtitle, children }) => (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 font-sans" dir="rtl">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-[20%] right-[20%] w-96 h-96 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-white p-8 md:p-10 w-full max-w-lg relative z-10">
            <div className="text-center mb-8">
                <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 shadow-inner">
                    <GraduationCap size={32} />
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 tracking-tight">{title}</h1>
                <p className="text-slate-500">{subtitle}</p>
            </div>
            {children}
        </div>
    </div>
);

export default AuthLayout;