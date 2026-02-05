import { useMemo, useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Search, Plus, X, AlertTriangle, Database, Shield, SlidersHorizontal } from 'lucide-react';
import { Button, Badge } from '../../components/UI';
import { apiClient, API_URL } from '../../services/api';
import { useAlert } from '../../hooks/useAlert';
import { formatDate } from '../../services/Libs';

const DEFAULT_GROUP_LABELS = {
    ManualPayment: '?????? ????',
    Payment: '??????',
    Auth: '????? ????',
    Security: '?????',
    Email: '?????',
    System: '?????'
};

const SystemSettings = () => {
    const alert = useAlert();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [version, setVersion] = useState(1);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [updatedBy, setUpdatedBy] = useState('');
    const [settingsMap, setSettingsMap] = useState({});
    const [initialMap, setInitialMap] = useState({});
    const [search, setSearch] = useState('');
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const response = await apiClient.get('/admin/system/settings', {
            showSuccessAlert: false
        });

        if (response?.success) {
            const data = response.data || {};
            const map = data.data || {};

            setVersion(data.version || 1);
            setUpdatedAt(data.updatedAt || null);
            setUpdatedBy(data.updatedBy || 'System');
            setSettingsMap(map);
            setInitialMap(map);
        } else {
            alert.showError('??? ?? ?????? ??????? ?????');
        }

        setLoading(false);
    };

    const hasChanges = useMemo(() => {
        const keys = new Set([...Object.keys(initialMap), ...Object.keys(settingsMap)]);
        for (const key of keys) {
            if ((initialMap[key] ?? '') !== (settingsMap[key] ?? '')) return true;
        }
        return false;
    }, [initialMap, settingsMap]);

    const groupedSettings = useMemo(() => {
        const entries = Object.entries(settingsMap)
            .filter(([key, value]) => {
                if (!search.trim()) return true;
                const q = search.toLowerCase();
                return key.toLowerCase().includes(q) || String(value).toLowerCase().includes(q);
            })
            .sort((a, b) => a[0].localeCompare(b[0]));

        return entries.reduce((acc, [key, value]) => {
            const group = key.split('.')[0] || 'System';
            acc[group] = acc[group] || [];
            acc[group].push({ key, value });
            return acc;
        }, {});
    }, [settingsMap, search]);

    const handleChange = (key, value) => {
        setSettingsMap(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleRemove = (key) => {
        const next = { ...settingsMap };
        delete next[key];
        setSettingsMap(next);
    };

    const handleAdd = () => {
        if (!newKey.trim()) {
            alert.showError('???? ????? ?? ???? ????');
            return;
        }
        setSettingsMap(prev => ({
            ...prev,
            [newKey.trim()]: newValue ?? ''
        }));
        setNewKey('');
        setNewValue('');
    };

    const handleSave = async () => {
        setSaving(true);
        const response = await apiClient.put('/admin/system/settings', {
            version,
            data: settingsMap
        });

        if (response?.success) {
            const data = response.data || {};
            setVersion(data.version || version + 1);
            setUpdatedAt(data.updatedAt || new Date().toISOString());
            setUpdatedBy(data.updatedBy || 'System');
            setInitialMap(data.data || settingsMap);
            setSettingsMap(data.data || settingsMap);
        }

        setSaving(false);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-56 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                            ))}
                        </div>
                        <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Settings size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 dark:text-white">??????? ?????</h1>
                            <p className="text-slate-500 dark:text-slate-400">?????? ??????? ???????? ????? ? ?????? ????</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={fetchSettings} className="!py-2.5">
                            <RefreshCw size={16} className="ml-2" />
                            ???????????
                        </Button>
                        <Button onClick={handleSave} disabled={!hasChanges || saving} className="!py-2.5">
                            {saving ? <RefreshCw size={16} className="ml-2 animate-spin" /> : <Save size={16} className="ml-2" />}
                            {saving ? '?? ??? ?????...' : '????? ???????'}
                        </Button>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                        <Badge color="blue">???? {version}</Badge>
                        <span>????? ?????: {updatedAt ? formatDate(updatedAt) : '??????'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge color="emerald">??????????? ???? {updatedBy || 'System'}</Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal size={18} className="text-indigo-600 dark:text-indigo-400" />
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">??????? ?????</h3>
                            </div>
                            <div className="relative w-full lg:w-80">
                                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="????? ?? ??????..."
                                    className="w-full pr-10 pl-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {Object.keys(groupedSettings).length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center">
                            <p className="text-slate-500 dark:text-slate-400">?????? ???? ????? ???? ?????.</p>
                        </div>
                    ) : (
                        Object.entries(groupedSettings).map(([group, items]) => (
                            <div key={group} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield size={18} className="text-emerald-500" />
                                        <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                                            {DEFAULT_GROUP_LABELS[group] || group}
                                        </h4>
                                    </div>
                                    <Badge color="slate" size="sm">{items.length} ????</Badge>
                                </div>

                                <div className="space-y-4">
                                    {items.map(({ key, value }) => (
                                        <div key={key} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-slate-400">{key}</p>
                                                    <input
                                                        type="text"
                                                        value={value ?? ''}
                                                        onChange={(e) => handleChange(key, e.target.value)}
                                                        className="mt-2 w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="!py-2.5 !px-3 text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={() => handleRemove(key)}
                                                >
                                                    <X size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Database size={18} className="text-purple-600" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">????? ??????</h3>
                        </div>
                        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center justify-between">
                                <span>????? ?? ??????</span>
                                <span className="font-bold text-slate-800 dark:text-white">{Object.keys(settingsMap).length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>??????? ????? ????</span>
                                {hasChanges ? (
                                    <Badge color="amber" size="sm">?? ?????? ?????</Badge>
                                ) : (
                                    <Badge color="emerald" size="sm">?????</Badge>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span>API</span>
                                <span className="font-medium text-slate-800 dark:text-white">{API_URL}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Plus size={18} className="text-indigo-600" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">?????? ???? ????</h3>
                        </div>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="System.Key"
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <input
                                type="text"
                                placeholder="?????"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <Button variant="outline" className="w-full" onClick={handleAdd}>
                                ??????
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-900/10 p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={18} className="text-amber-600" />
                            <h3 className="font-bold text-amber-900 dark:text-amber-200">???? ??????</h3>
                        </div>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            ????? ??????? ???? ??? ?????? ???? ???????? ??? ????? ????? ??? ??????. ??? ?? ?????? ???? ?????? ?? ????? ????.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
