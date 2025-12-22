import React from 'react';

const CourseGridSkeleton = ({ items = 4 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" role="status" aria-live="polite" aria-busy="true">
        {Array.from({ length: items }).map((_, index) => (
            <div
                key={`course-skeleton-${index}`}
                className="bg-white dark:bg-slate-900 rounded-[2rem] h-[420px] border border-slate-100 dark:border-slate-800 shadow-sm p-5 animate-pulse"
            >
                <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-5"></div>
                <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-full mb-2"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-2/3"></div>
            </div>
        ))}
    </div>
);

export default CourseGridSkeleton;
