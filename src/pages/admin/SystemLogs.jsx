import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Download, RefreshCw, AlertTriangle, Info, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button, Badge } from '../../components/UI';
import { apiClient } from '../../services/api';
import { formatDate } from '../../services/Libs';

const SystemLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [dateRange, setDateRange] = useState('today');

    const logLevels = [
        { value: 'all', label: 'همه سطوح', color: 'slate' },
        { value: 'error', label: 'خطا', color: 'red' },
        { value: 'warning', label: 'هشدار', color: 'amber' },
        { value: 'info', label: 'اطلاعات', color: 'blue' },
        { value: 'success', label: 'موفقیت', color: 'emerald' }
    ];

    const logCategories = [
        { value: 'all', label: 'همه دسته‌ها' },
        { value: 'authentication', label: 'احراز هویت' },
        { value: 'database', label: 'دیتابیس' },
        { value: 'api', label: 'API' },
        { value: 'system', label: 'سیستم' },
        { value: 'security', label: 'امنیت' },
        { value: 'payment', label: 'پرداخت' }
    ];

    useEffect(() => {
        fetchLogs();
    }, [selectedLevel, selectedCategory, dateRange]);

    const fetchLogs = async () => {
        try {
            setLoading(true);

            // This would be a real API call to get system logs
            // For now, using mock data since the backend endpoint doesn't exist yet
            const mockLogs = [
                {
                    id: 1,
                    timestamp: new Date().toISOString(),
                    level: 'info',
                    category: 'authentication',
                    message: 'کاربر admin@example.com وارد سیستم شد',
                    details: 'IP: 192.168.1.100, User-Agent: Mozilla/5.0...',
                    userId: 'admin@example.com'
                },
                {
                    id: 2,
                    timestamp: new Date(Date.now() - 300000).toISOString(),
                    level: 'warning',
                    category: 'database',
                    message: 'اتصال به دیتابیس کند است',
                    details: 'Query execution time: 2.5 seconds',
                    userId: null
                },
                {
                    id: 3,
                    timestamp: new Date(Date.now() - 600000).toISOString(),
                    level: 'error',
                    category: 'payment',
                    message: 'خطا در پردازش پرداخت',
                    details: 'Payment gateway timeout for transaction #12345',
                    userId: 'user@example.com'
                },
                {
                    id: 4,
                    timestamp: new Date(Date.now() - 900000).toISOString(),
                    level: 'success',
                    category: 'api',
                    message: 'API endpoint جدید فعال شد',
                    details: '/api/v1/courses endpoint deployed successfully',
                    userId: null
                },
                {
                    id: 5,
                    timestamp: new Date(Date.now() - 1200000).toISOString(),
                    level: 'warning',
                    category: 'security',
                    message: 'تلاش ناموفق برای ورود',
                    details: 'Failed login attempt from IP: 203.0.113.1',
                    userId: 'unknown@example.com'
                }
            ];

            setLogs(mockLogs);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
        const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
        return matchesSearch && matchesLevel && matchesCategory;
    });

    const getLevelIcon = (level) => {
        switch (level) {
            case 'error':
                return <XCircle size={16} className="text-red-500" />;
            case 'warning':
                return <AlertTriangle size={16} className="text-amber-500" />;
            case 'info':
                return <Info size={16} className="text-blue-500" />;
            case 'success':
                return <CheckCircle2 size={16} className="text-emerald-500" />;
            default:
                return <Clock size={16} className="text-slate-500" />;
        }
    };

    const getLevelBadge = (level) => {
        const levelConfig = logLevels.find(l => l.value === level);
        return (
            <Badge color={levelConfig?.color || 'slate'} size="sm">
                {levelConfig?.label || level}
            </Badge>
        );
    };

    const getCategoryLabel = (category) => {
        const categoryConfig = logCategories.find(c => c.value === category);
        return categoryConfig?.label || category;
    };

    const exportLogs = () => {
        // This would export logs to CSV or other format
        console.log('Exporting logs...');
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
                    <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl mb-6"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">لاگ‌های سیستم</h1>
                        <p className="text-slate-500 dark:text-slate-400">مشاهده و مدیریت لاگ‌های سیستم</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchLogs} className="flex items-center gap-2">
                        <RefreshCw size={16} />
                        بروزرسانی
                    </Button>
                    <Button variant="outline" onClick={exportLogs} className="flex items-center gap-2">
                        <Download size={16} />
                        خروجی
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            جستجو
                        </label>
                        <div className="relative">
                            <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="جستجو در لاگ‌ها..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            {logLevels.map(level => (
                                <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            دسته‌بندی
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            {logCategories.map(category => (
                                <option key={category.value} value={category.value}>{category.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            بازه زمانی
                        </label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="today">امروز</option>
                            <option value="week">هفته گذشته</option>
                            <option value="month">ماه گذشته</option>
                            <option value="all">همه</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        لاگ‌های سیستم ({filteredLogs.length})
                    </h3>
                </div>

                {filteredLogs.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="mx-auto text-slate-400 mb-4" size={48} />
                        <p className="text-slate-500 dark:text-slate-400">
                            {searchTerm || selectedLevel !== 'all' || selectedCategory !== 'all'
                                ? 'لاگی با این فیلتر یافت نشد'
                                : 'هیچ لاگی موجود نیست'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {filteredLogs.map((log) => (
                            <div key={log.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        {getLevelIcon(log.level)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            {getLevelBadge(log.level)}
                                            <Badge color="slate" size="sm">
                                                {getCategoryLabel(log.category)}
                                            </Badge>
                                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                                {formatDate(log.timestamp)}
                                            </span>
                                        </div>

                                        <p className="font-medium text-slate-800 dark:text-white mb-1">
                                            {log.message}
                                        </p>

                                        {log.details && (
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                {log.details}
                                            </p>
                                        )}

                                        {log.userId && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                کاربر: {log.userId}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemLogs;