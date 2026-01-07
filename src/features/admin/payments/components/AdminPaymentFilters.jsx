import { Search } from 'lucide-react';
import { FILTER_OPTIONS } from '../utils/paymentStatus';

export const AdminPaymentFilters = ({
    filters,
    onFiltersChange,
    stats
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="جستجو در پرداخت‌ها..."
                        value={filters.search}
                        onChange={(e) => onFiltersChange({ search: e.target.value })}
                        className="w-full pr-10 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={filters.status}
                    onChange={(e) => onFiltersChange({ status: e.target.value })}
                    className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                    {FILTER_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                    <div className="text-slate-600 dark:text-slate-400">
                        کل: <span className="font-bold text-slate-800 dark:text-white">{stats.total}</span>
                    </div>
                    <div className="text-blue-600 dark:text-blue-400">
                        در انتظار: <span className="font-bold">{stats.pending}</span>
                    </div>
                    <div className="text-green-600 dark:text-green-400">
                        تایید شده: <span className="font-bold">{stats.approved}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};