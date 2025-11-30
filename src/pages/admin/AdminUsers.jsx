import React, { useState, useEffect } from 'react';
import { Users, Search, Edit, Trash2, Shield, Mail, Phone, Lock, UserPlus, X, Check, Loader2, Save, User, AlertTriangle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '../../services/api';
import { Button, Badge } from '../../components/UI';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const initialFormState = {
        name: '', email: '', mobile: '', password: '', password_confirmation: '',
        roles: ['Student'], is_active: true
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            const data = Array.isArray(response.data) ? response.data : response.data.data || [];
            setUsers(data);
        } catch (error) {
            console.error(error);
            toast.error('خطا در دریافت لیست کاربران');
        } finally { setLoading(false); }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('users/getroles');
            const data = response.data.data || response.data || [];
            setAvailableRoles(data);
        } catch (error) {
            console.error("Error fetching roles:", error);
            setAvailableRoles([
                { name: 'Student', description: 'دانشجو' },
                { name: 'Instructor', description: 'مدرس' },
                { name: 'Admin', description: 'ادمین' }
            ]);
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setShowModal(false);
        setEditingId(null);
        setIsSubmitting(false);
    };

    const handleEditClick = (user) => {
        setEditingId(user.id);
        setFormData({
            name: user.fullName || user.name || '',
            email: user.email || '',
            mobile: user.mobile || '',
            password: '',
            password_confirmation: '',
            roles: user.roles || [],
            is_active: user.isActive !== undefined ? user.isActive : true
        });
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleRole = (roleName) => {
        setFormData(prev => {
            const currentRoles = prev.roles;
            if (currentRoles.includes(roleName)) {
                if (currentRoles.length > 1) return { ...prev, roles: currentRoles.filter(r => r !== roleName) };
                return prev;
            } else {
                return { ...prev, roles: [...currentRoles, roleName] };
            }
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email) return toast.error('نام و ایمیل الزامی است');
        if (!editingId && !formData.password) return toast.error('برای کاربر جدید رمز عبور الزامی است');
        if (formData.password && formData.password !== formData.password_confirmation) return toast.error('تکرار رمز عبور مطابقت ندارد');

        setIsSubmitting(true);

        const payload = {
            fullName: formData.name,
            email: formData.email,
            mobile: formData.mobile,
            roles: formData.roles
        };

        if (editingId) {
            payload.Id = editingId;
        }

        if (formData.password) {
            payload.password = formData.password;
        }

        const savePromise = new Promise(async (resolve, reject) => {
            try {
                if (editingId) {
                    await api.put(`/users/${editingId}`, payload);
                    // اگر روت جداگانه برای نقش‌ها دارید
                    // await api.put(`/users/${editingId}/roles`, formData.roles);
                } else {
                    await api.post('/users', payload);
                }

                fetchUsers();
                resetForm();
                resolve();
            } catch (error) {
                console.error(error);
                reject(error.response?.data?.message || 'خطا در عملیات');
            }
        });

        await toast.promise(savePromise, {
            loading: 'در حال پردازش...',
            success: <b>{editingId ? 'اطلاعات کاربر ویرایش شد!' : 'کاربر جدید ساخته شد!'}</b>,
            error: (err) => <b>{err}</b>,
        });
        setIsSubmitting(false);
    };

    const executeDelete = async (id) => {
        const deletePromise = api.delete(`/users/${id}`);
        toast.promise(deletePromise, {
            loading: 'در حال حذف...',
            success: () => {
                setUsers(prev => prev.filter(u => u.id !== id));
                return 'کاربر با موفقیت حذف شد 🗑️';
            },
            error: (err) => err.response?.data?.message || 'خطا در حذف',
        });
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-4 min-w-[280px]">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 shrink-0 animate-pulse">
                        <Trash2 size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">حذف کاربر</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            آیا از حذف این کاربر اطمینان دارید؟
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 justify-end mt-1">
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">انصراف</button>
                    <button onClick={() => { toast.dismiss(t.id); executeDelete(id); }} className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm shadow-red-500/20">بله، حذف شود</button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const getRoleLabel = (roleName) => {
        const found = availableRoles.find(r => r.name === roleName);
        return found ? found.description : roleName;
    };

    return (
        <div>
            <Toaster position="top-center" reverseOrder={false} toastOptions={{ style: { fontFamily: 'Vazirmatn', fontSize: '14px', borderRadius: '12px', background: '#333', color: '#fff' }}} />

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">مدیریت کاربران</h2>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">لیست دانشجویان، اساتید و مدیران سیستم</p>
                </div>
                <Button onClick={() => { resetForm(); setShowModal(true); }} icon={UserPlus}>کاربر جدید</Button>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-lg shadow-2xl my-8 flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-[2rem]">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">{editingId ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">اطلاعات هویتی و سطح دسترسی</p>
                            </div>
                            <button onClick={resetForm} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 dark:text-slate-500 hover:text-red-500 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="userForm" onSubmit={handleSave} className="space-y-5">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">نام کامل</label>
                                        <div className="relative">
                                            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                                            <input className="w-full pr-10 pl-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-white transition-colors"
                                                   required name="name" value={formData.name || ''} onChange={handleChange} placeholder="علی علوی" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">ایمیل</label>
                                            <div className="relative">
                                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                                                <input type="email" className="w-full pr-10 pl-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-800 dark:text-white transition-colors"
                                                       required name="email" value={formData.email || ''} onChange={handleChange} dir="ltr" placeholder="mail@example.com" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">موبایل</label>
                                            <div className="relative">
                                                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                                                <input type="text" className="w-full pr-10 pl-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-800 dark:text-white transition-colors"
                                                       name="mobile" value={formData.mobile || ''} onChange={handleChange} placeholder="0912..." />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                                        <label className="block text-xs font-bold text-yellow-700 dark:text-yellow-500 mb-2 flex items-center gap-1"><Lock size={14}/> {editingId ? 'تغییر رمز عبور (اختیاری)' : 'تنظیم رمز عبور'}</label>
                                        <div className="space-y-3">
                                            <input type="password" className="w-full p-3 bg-white dark:bg-slate-800 rounded-lg border border-yellow-200 dark:border-yellow-900/30 focus:border-yellow-500 outline-none text-sm text-slate-800 dark:text-white transition-colors"
                                                   name="password" value={formData.password || ''} onChange={handleChange} placeholder="رمز عبور جدید" />
                                            <input type="password" className="w-full p-3 bg-white dark:bg-slate-800 rounded-lg border border-yellow-200 dark:border-yellow-900/30 focus:border-yellow-500 outline-none text-sm text-slate-800 dark:text-white transition-colors"
                                                   name="password_confirmation" value={formData.password_confirmation || ''} onChange={handleChange} placeholder="تکرار رمز عبور" />
                                        </div>
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1"><Shield size={14}/> سطح دسترسی (نقش‌ها)</label>
                                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar p-1">
                                        {availableRoles.length > 0 ? availableRoles.map(role => (
                                            <div
                                                key={role.name}
                                                onClick={() => toggleRole(role.name)}
                                                className={`cursor-pointer p-3 rounded-xl border flex items-center gap-3 transition-all 
                                                    ${formData.roles.includes(role.name)
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.roles.includes(role.name) ? 'border-white' : 'border-slate-300 dark:border-slate-500'}`}>
                                                    {formData.roles.includes(role.name) && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                                </div>
                                                <span className="text-sm font-bold">{role.description}</span>
                                            </div>
                                        )) : <p className="text-xs text-slate-400 col-span-2 text-center py-4">در حال بارگذاری نقش‌ها...</p>}
                                    </div>
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.checked}))} className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" />
                                    <label htmlFor="is_active" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">حساب کاربری فعال باشد</label>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-b-[2rem]">
                            <button onClick={resetForm} className="px-6 py-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white font-bold text-sm">انصراف</button>
                            <Button type="submit" form="userForm" disabled={isSubmitting} icon={isSubmitting ? Loader2 : (editingId ? Save : UserPlus)}>{isSubmitting ? 'در حال ذخیره...' : (editingId ? 'ذخیره تغییرات' : 'ایجاد کاربر')}</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm overflow-hidden transition-colors">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">کاربر</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">تماس</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">نقش‌ها</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">وضعیت</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">عملیات</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {loading ? (<tr><td colSpan="5" className="text-center py-10 text-slate-400 dark:text-slate-500">در حال بارگذاری...</td></tr>) : users.map(user => (
                        <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900 dark:to-violet-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-black border border-white dark:border-slate-800 shadow-sm">
                                        {(user.fullName || user.name || 'U').charAt(0)}
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-700 dark:text-slate-200 block text-sm">{user.fullName || user.name}</span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500">ID: {user.id.substring(0, 8)}...</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1"><Mail size={12}/> {user.email}</span>
                                    {user.mobile && <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1"><Phone size={10}/> {user.mobile}</span>}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                    {user.roles?.map(roleName => (
                                        <Badge key={roleName} color={roleName === 'Manager' ? 'red' : roleName === 'Admin' ? 'violet' : roleName === 'Instructor' ? 'amber' : 'blue'}>
                                            {getRoleLabel(roleName)}
                                        </Badge>
                                    ))}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${user.isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    {user.isActive ? 'فعال' : 'غیرفعال'}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEditClick(user)} className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(user.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"><Trash2 size={18} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;