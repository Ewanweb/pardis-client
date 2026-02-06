import { useMemo, useState, useEffect } from 'react';
import { FileText, Search, Download, RefreshCw, AlertTriangle, Info, CheckCircle2, XCircle, Clock, Filter, Shield } from 'lucide-react';
import { Button, Badge } from '../../components/UI';
import { apiClient } from '../../services/api';
import { formatDate } from '../../services/Libs';
import { Pagination } from '../../components/Pagination/Pagination';

const levelConfig = {
    error: { label: 'خطا', color: 'red', icon: XCircle },
    warning: { label: 'هشدار', color: 'amber', icon: AlertTriangle },
    info: { label: 'اطلاعات', color: 'blue', icon: Info },
    debug: { label: 'دیباگ', color: 'slate', icon: Clock },
    success: { label: 'موفق', color: 'emerald', icon: CheckCircle2 }
};

const SystemLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [source, setSource] = useState('');
    const [userId, setUserId] = useState('');
    const [eventId, setEventId] = useState('');
    const [requestId, setRequestId] = useState('');
    const [dateRange, setDateRange] = useState('today');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pageSize: 50, total: 0 });

    useEffect(() => {
        fetchLogs(1, pagination.pageSize);
    }, [selectedLevel, source, eventId, userId, requestId, dateRange, customFrom, customTo, searchTerm]);

    const getRangeDates = () => {
        const now = new Date();
        if (dateRange === 'today') {
            const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            return { from, to: now };
        }
        if (dateRange === 'week') {
            const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return { from, to: now };
        }
        if (dateRange === 'month') {
            const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return { from, to: now };
        }
        if (dateRange === 'custom' && (customFrom || customTo)) {
            return {
                from: customFrom ? new Date(customFrom) : null,
                to: customTo ? new Date(customTo) : null
            };
        }
        return { from: null, to: null };
    };

    const fetchLogs = async (page = 1, pageSize = 50) => {
        setLoading(true);
        const { from, to } = getRangeDates();

        const params = {
            page,
            pageSize,
            sort: 'time_desc',
            search: searchTerm || undefined,
            level: selectedLevel === 'all' ? undefined : selectedLevel,
            source: source || undefined,
            eventId: eventId || undefined,
            userId: userId || undefined,
            requestId: requestId || undefined,
            from: from ? from.toISOString() : undefined,
            to: to ? to.toISOString() : undefined
        };

        const response = await apiClient.get('/admin/system/logs', {
            params,
            showSuccessAlert: false
        });

        if (response?.success) {
            const data = response.data || {};
            const items = data.items || [];
            const paging = data.pagination || { page, pageSize, total: items.length };

            setLogs(items);
            setPagination({
                page: paging.page || page,
                pageSize: paging.pageSize || pageSize,
                total: paging.total || 0
            });
        } else {
            setLogs([]);
            setPagination({ page, pageSize, total: 0 });
        }

        setLoading(false);
    };

    const totalPages = useMemo(() => {
        return pagination.pageSize > 0 ? Math.ceil(pagination.total / pagination.pageSize) : 1;
    }, [pagination]);

    const handlePageChange = (page) => {
        fetchLogs(page, pagination.pageSize);
    };

    const handlePageSizeChange = (pageSize) => {
        fetchLogs(1, pageSize);
    };

    const exportLogs = () => {
        if (!logs.length) return;

        const headers = ['Time', 'Level', 'Source', 'Message', 'UserId', 'EventId', 'RequestId', 'Properties'];
        const rows = logs.map(log => [
            log.time,
            log.level,
            log.source,
            log.message,
            log.userId || '',
            log.eventId || '',
            log.requestId || '',
            log.properties || ''
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `system-logs-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const getLevelBadge = (level) => {
        const config = levelConfig[level] || { label: level, color: 'slate', icon: Clock };
        return (
            <Badge color={config.color} size="sm" className="flex items-center gap-1">
                <config.icon size={12} />
                {config.label}
            </Badge>
        );
    };

    const renderedLogs = useMemo(() => logs, [logs]);

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-orange-50 via-white to-rose-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <FileText size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 dark:text-white">گزارش‌های سیستم</h1>
                            <p className="text-slate-500 dark:text-slate-400">مشاهده و مدیریت گزارش‌ها و رویدادهای سیستم</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => fetchLogs(pagination.page, pagination.pageSize)} className="!py-2.5">
                            <RefreshCw size={16} className="ml-2" />
                            بارگذاری مجدد
                        </Button>
                        <Button variant="outline" onClick={exportLogs} className="!py-2.5">
                            <Download size={16} className="ml-2" />
                            خروجی CSV
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={18} className="text-indigo-600" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">فیلترها</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            جستجو
                        </label>
                        <div className="relative">
                            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="جستجو در پیام‌ها..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            سطح لاگ
                        </label>
                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="all">همه</option>
                            {Object.keys(levelConfig).map(level => (
                                <option key={level} value={level}>{levelConfig[level].label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            منبع
                        </label>
                        <input
                            type="text"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            placeholder="Api, Jobs, Auth..."
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            بازه زمانی
                        </label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="today">امروز</option>
                            <option value="week">۷ روز</option>
                            <option value="month">۳۰ روز</option>
                            <option value="all">همه</option>
                            <option value="custom">سفارشی</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            UserId
                        </label>
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            EventId
                        </label>
                        <input
                            type="text"
                            value={eventId}
                            onChange={(e) => setEventId(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            RequestId
                        </label>
                        <input
                            type="text"
                            value={requestId}
                            onChange={(e) => setRequestId(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {dateRange === 'custom' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    از تاریخ
                                </label>
                                <input
                                    type="date"
                                    value={customFrom}
                                    onChange={(e) => setCustomFrom(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    تا تاریخ
                                </label>
                                <input
                                    type="date"
                                    value={customTo}
                                    onChange={(e) => setCustomTo(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">لاگ‌ها ({pagination.total})</h3>
                    <Badge color="slate" size="sm" className="flex items-center gap-1">
                        <Shield size={12} />
                        {selectedLevel === 'all' ? 'همه سطوح' : levelConfig[selectedLevel]?.label || selectedLevel}
                    </Badge>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500">در حال بارگذاری لاگ‌ها...</div>
                ) : renderedLogs.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="mx-auto text-slate-400 mb-4" size={40} />
                        <p className="text-slate-500 dark:text-slate-400">هیچ لاگی در این بازه یافت نشد</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {renderedLogs.map((log) => (
                            <div key={log.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        {getLevelBadge(log.level)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-3 mb-2 text-xs text-slate-500 dark:text-slate-400">
                                            <span>{formatDate(log.time)}</span>
                                            {log.source && <span>منبع: {log.source}</span>}
                                            {log.eventId && <span>Event: {log.eventId}</span>}
                                            {log.requestId && <span>Request: {log.requestId}</span>}
                                        </div>
                                        <p className="font-medium text-slate-800 dark:text-white mb-1">{log.message}</p>
                                        {log.properties && (
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{log.properties}</p>
                                        )}
                                        {log.userId && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">کاربر: {log.userId}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Pagination
                page={pagination.page}
                pageSize={pagination.pageSize}
                totalCount={pagination.total}
                totalPages={totalPages}
                hasNext={pagination.page < totalPages}
                hasPrev={pagination.page > 1}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
            />
        </div>
    );
};

export default SystemLogs;
