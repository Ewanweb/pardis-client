import React from 'react';

const PageSkeleton = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Header skeleton */}
            <div className="h-16 bg-slate-100 dark:bg-slate-800 animate-pulse" />

            {/* Content skeleton */}
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    {/* Title skeleton */}
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/3" />

                    {/* Content blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 animate-pulse">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageSkeleton;