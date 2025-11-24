import React, { useState, useEffect } from 'react';
import { Users, Search, Edit, Trash2, Shield, Mail, Phone, Lock, UserPlus, X, Check, Loader2, Save, User, AlertTriangle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '../../services/api';
import { Button, Badge } from '../../components/UI';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const AVAILABLE_ROLES = ['Manager', 'Admin', 'Instructor', 'Student', 'User'];
    const ROLE_LABELS = {
        'Manager': 'مدیر ارشد',
        'Admin': 'ادمین',
        'Instructor': 'مدرس',
        'Student': 'دانشجو',
        'User': 'کاربر'
    };

    const initialFormState = {
        name: '', email: '', mobile: '', password: '', password_confirmation: '',
        roles: ['Student'], is_active: true
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data.data);
        } catch (error) {
            console.error(error);
            toast.error('خطا در دریافت لیست کاربران');
        } finally { setLoading(false); }
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
            name: user.name,
            email: user.email,
            mobile: user.mobile || '',
            password: '',
            password_confirmation: '',
            roles: user.roles || [],
            is_active: Boolean(user.is_active)
        });
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const toggleRole = (role) => {
        setFormData(prev => {
            const currentRoles = prev.roles;
            if (currentRoles.includes(role)) {
                if (currentRoles.length > 1) return { ...prev, roles: currentRoles.filter(r => r !== role) };
                return prev;
            } else {
                return { ...prev, roles: [...currentRoles, role] };
            }
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email) return toast.error('نام و ایمیل الزامی است');
        if (!editingId && !formData.password) return toast.error('برای کاربر جدید رمز عبور الزامی است');
        if (formData.password && formData.password !== formData.password_confirmation) return toast.error('تکرار رمز عبور مطابقت ندارد');

        setIsSubmitting(true);
        const savePromise = new Promise(async (resolve, reject) => {
            try {
                const url = editingId ? `/users/${editingId}` : '/users';
                const method = editingId ? 'put' : 'post';
                const dataToSend = { ...formData };
                if (!dataToSend.password) delete dataToSend.password;
                if (!dataToSend.password_confirmation) delete dataToSend.password_confirmation;

                await api[method](url, dataToSend);
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

    // ✅ تابع داخلی برای اجرای حذف (بعد از تایید)
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

    // ✅✅✅ تابع جدید و زیبای حذف (Custom Toast UI)
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
                            آیا از حذف این کاربر اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 justify-end mt-1">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        انصراف
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            executeDelete(id);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm shadow-red-500/20"
                    >
                        بله، حذف شود
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'top-center',
            style: {
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'
            }
        });
    };

    return (
        <div>
            <Toaster position="top-center" reverseOrder={false} toastOptions={{ style: { fontFamily: 'Vazirmatn', fontSize: '14px', borderRadius: '12px', background: '#333', color: '#fff' }}} />

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">مدیریت کاربران</h2>
                    <p className="text-slate-400 text-sm mt-1">لیست دانشجویان، اساتید و مدیران سیستم</p>
                </div>
                <Button onClick={() => { resetForm(); setShowModal(true); }} icon={UserPlus}>کاربر جدید</Button>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl my-8 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-[2rem]">
                            <div><h3 className="text-xl font-black text-slate-800">{editingId ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}</h3><p className="text-xs text-slate-400 mt-1">اطلاعات هویتی و سطح دسترسی</p></div>
                            <button onClick={resetForm} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="userForm" onSubmit={handleSave} className="space-y-5">
                                <div className="space-y-4">
                                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5">نام کامل</label><div className="relative"><User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input className="w-full pr-10 pl-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-800" required name="name" value={formData.name} onChange={handleChange} placeholder="علی علوی" /></div></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-bold text-slate-500 mb-1.5">ایمیل</label><div className="relative"><Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="email" className="w-full pr-10 pl-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium" required name="email" value={formData.email} onChange={handleChange} dir="ltr" placeholder="mail@example.com" /></div></div>
                                        <div><label className="block text-xs font-bold text-slate-500 mb-1.5">موبایل</label><div className="relative"><Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" className="w-full pr-10 pl-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="0912..." /></div></div>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                        <label className="block text-xs font-bold text-yellow-700 mb-2 flex items-center gap-1"><Lock size={14}/> {editingId ? 'تغییر رمز عبور (اختیاری)' : 'تنظیم رمز عبور'}</label>
                                        <div className="space-y-3"><input type="password" className="w-full p-3 bg-white rounded-lg border border-yellow-200 focus:border-yellow-500 outline-none text-sm" name="password" value={formData.password} onChange={handleChange} placeholder="رمز عبور جدید" /><input type="password" className="w-full p-3 bg-white rounded-lg border border-yellow-200 focus:border-yellow-500 outline-none text-sm" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} placeholder="تکرار رمز عبور" /></div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-3 flex items-center gap-1"><Shield size={14}/> سطح دسترسی (نقش‌ها)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {AVAILABLE_ROLES.map(role => (
                                            <div key={role} onClick={() => toggleRole(role)} className={`cursor-pointer p-3 rounded-xl border flex items-center gap-3 transition-all ${formData.roles.includes(role) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.roles.includes(role) ? 'border-white' : 'border-slate-300'}`}>{formData.roles.includes(role) && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}</div>
                                                <span className="text-sm font-bold">{ROLE_LABELS[role] || role}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"><input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.checked}))} className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" /><label htmlFor="is_active" className="text-sm font-bold text-slate-700 cursor-pointer select-none">حساب کاربری فعال باشد</label></div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50 rounded-b-[2rem]">
                            <button onClick={resetForm} className="px-6 py-3 text-slate-500 hover:text-slate-700 font-bold text-sm">انصراف</button>
                            <Button type="submit" form="userForm" disabled={isSubmitting} icon={isSubmitting ? Loader2 : (editingId ? Save : UserPlus)}>{isSubmitting ? 'در حال ذخیره...' : (editingId ? 'ذخیره تغییرات' : 'ایجاد کاربر')}</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 border-b border-slate-100"><tr><th className="px-6 py-5 text-xs font-black text-slate-500 uppercase">کاربر</th><th className="px-6 py-5 text-xs font-black text-slate-500 uppercase">تماس</th><th className="px-6 py-5 text-xs font-black text-slate-500 uppercase">نقش‌ها</th><th className="px-6 py-5 text-xs font-black text-slate-500 uppercase">وضعیت</th><th className="px-6 py-5 text-xs font-black text-slate-500 uppercase">عملیات</th></tr></thead>
                    <tbody className="divide-y divide-slate-50">
                    {loading ? (<tr><td colSpan="5" className="text-center py-10 text-slate-400">در حال بارگذاری...</td></tr>) : users.map(user => (
                        <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-700 font-black border border-white shadow-sm">{user.name.charAt(0)}</div><div><span className="font-bold text-slate-700 block text-sm">{user.name}</span><span className="text-[10px] text-slate-400">ID: {user.id}</span></div></div></td>
                            <td className="px-6 py-4"><div className="flex flex-col gap-1"><span className="text-xs font-bold text-slate-600 flex items-center gap-1"><Mail size={12}/> {user.email}</span>{user.mobile && <span className="text-[10px] text-slate-400 flex items-center gap-1"><Phone size={10}/> {user.mobile}</span>}</div></td>
                            <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{user.roles?.map(role => (<Badge key={role} color={role === 'Manager' ? 'red' : role === 'Admin' ? 'violet' : role === 'Instructor' ? 'amber' : 'blue'}>{ROLE_LABELS[role] || role}</Badge>))}</div></td>
                            <td className="px-6 py-4"><div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${user.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}><div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>{user.is_active ? 'فعال' : 'غیرفعال'}</div></td>
                            <td className="px-6 py-4"><div className="flex items-center gap-2"><button onClick={() => handleEditClick(user)} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-full"><Edit size={18} /></button><button onClick={() => handleDelete(user.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"><Trash2 size={18} /></button></div></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;