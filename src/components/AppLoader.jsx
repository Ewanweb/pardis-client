import React from 'react';
import { GraduationCap } from 'lucide-react';

const AppLoader = ({ isFadingOut }) => (
    <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md transition-opacity duration-500 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
    >
        <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shadow-lg shadow-primary/20">
                    <GraduationCap className="h-10 w-10 text-primary" strokeWidth={2.4} />
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-primary/40 animate-pulse" aria-hidden="true"></div>
                <div className="absolute -inset-3 rounded-3xl border border-primary/30 animate-[spin_6s_linear_infinite]" aria-hidden="true"></div>
            </div>

            <div>
                <p className="text-lg font-black text-slate-900 dark:text-slate-100">آکادمی پردیس توس</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">در حال آماده‌سازی تجربه شما...</p>
            </div>

            <div className="flex items-center gap-2" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce"></span>
            </div>
        </div>
    </div>
);

export default AppLoader;
