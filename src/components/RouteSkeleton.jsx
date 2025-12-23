import React from 'react';

const RouteSkeleton = ({ className = '' }) => (
    <div className={`w-full py-10 ${className}`} role="status" aria-live="polite" aria-busy="true">
        <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-6">
                <div className="h-6 w-36 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                <div className="h-10 w-2/3 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-40 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80"></div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default RouteSkeleton;
