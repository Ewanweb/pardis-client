import React from 'react';

export const AdminCard = ({ children, title, subtitle, icon: Icon, className = '', actions = null }) => {
    return (
        <div className={`bg-gradient-to-br from-white via-slate-50/30 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20 backdrop-blur-sm overflow-hidden ${className}`}>
            {(title || Icon || actions) && (
                <div className="bg-gradient-to-r from-slate-50/80 via-white/60 to-slate-50/80 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-800/80 border-b border-slate-200/50 dark:border-slate-700/50 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {Icon && (
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/25">
                                    <Icon size={24} strokeWidth={2.5} />
                                </div>
                            )}
                            <div>
                                {title && (
                                    <h2 className="text-xl font-bold text-text-primary dark:text-white">
                                        {title}
                                    </h2>
                                )}
                                {subtitle && (
                                    <p className="text-text-secondary dark:text-slate-300 text-sm mt-1">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                        {actions && (
                            <div className="flex items-center gap-2">
                                {actions}
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

export const AdminTable = ({ headers, children, className = '' }) => {
    return (
        <div className={`bg-gradient-to-br from-white via-slate-50/30 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20 backdrop-blur-sm overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gradient-to-r from-slate-50/80 via-white/60 to-slate-50/80 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-800/80 border-b border-slate-200/50 dark:border-slate-700/50">
                            {headers.map((header, index) => (
                                <th key={index} className="text-right py-4 px-6 font-bold text-text-primary dark:text-slate-300 text-sm">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {children}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const AdminTableRow = ({ children, className = '', hover = true }) => {
    return (
        <tr className={`border-b border-slate-100/50 dark:border-slate-800/50 ${hover ? 'hover:bg-gradient-to-r hover:from-primary-50/30 hover:to-secondary-50/30 dark:hover:from-slate-800/30 dark:hover:to-slate-700/30 transition-all duration-300' : ''} ${className}`}>
            {children}
        </tr>
    );
};

export const AdminTableCell = ({ children, className = '' }) => {
    return (
        <td className={`py-4 px-6 text-text-secondary dark:text-slate-300 ${className}`}>
            {children}
        </td>
    );
};

export const AdminStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {stats.map((stat, index) => (
                <div key={index} className="bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20 backdrop-blur-sm group hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 ${stat.color}`}>
                            <stat.icon size={24} strokeWidth={2.5} />
                        </div>
                        {stat.trend && (
                            <div className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend > 0 ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' : 'text-red-600 bg-red-100 dark:bg-red-900/30'}`}>
                                {stat.trend > 0 ? '+' : ''}{stat.trend}%
                            </div>
                        )}
                    </div>
                    <div className="text-3xl font-black text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                        {stat.value}
                    </div>
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {stat.label}
                    </div>
                </div>
            ))}
        </div>
    );
};