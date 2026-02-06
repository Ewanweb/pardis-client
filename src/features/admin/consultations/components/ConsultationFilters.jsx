import { Search, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';

export const ConsultationFilters = ({ filters, onFiltersChange, stats }) => {
    const [searchInput, setSearchInput] = useState(filters.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== filters.search) {
                onFiltersChange({ search: searchInput });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput, filters.search, onFiltersChange]);

    const statusOptions = [
        { value: 'all', label: 'همه', count: stats.total },
        { value: '0', label: 'در انتظار', count: stats.pending },
        { value: '1', label: 'تماس گرفته شده', count: stats.contacted },
        { value: '2', label: 'تکمیل شده', count: stats.completed },
        { value: '3', label: 'لغو شده', count: stats.cancelled }
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="جستجو بر اساس نام، شماره تماس، ایمیل یا دوره..."
                    className="w-full pr-12 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
            </div>

            {/* Status Filter */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={16} className="text-slate-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        فیلتر بر اساس وضعیت
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onFiltersChange({ status: option.value })}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filters.status === option.value
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {option.label}
                            {option.count !== undefined && (
                                <span className="mr-1.5 opacity-75">({option.count})</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
