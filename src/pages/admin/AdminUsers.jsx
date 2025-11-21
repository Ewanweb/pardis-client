import React, { useState, useEffect } from 'react';
import { Users, Edit, Save, X, Shield } from 'lucide-react';
import { api } from '../../context/AuthContext';
import { Button, Badge } from '../../components/UI';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null); // کاربری که در حال ویرایش است
    const [selectedRoles, setSelectedRoles] = useState([]); // نقش‌های انتخاب شده

    // لیست تمام نقش‌های ممکن در سیستم
    const availableRoles = ['Manager', 'Admin', 'Instructor', 'Student', 'User'];

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            // فرض بر این است که روت لیست کاربران وجود دارد (اگر ندارید باید بسازید)
            // Route::get('/users', [UserController::class, 'index']);
            const response = await api.get('/users');
            setUsers(response.data.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setSelectedRoles(user.roles || []);
    };

    const toggleRole = (role) => {
        if (selectedRoles.includes(role)) {
            setSelectedRoles(prev => prev.filter(r => r !== role));
        } else {
            setSelectedRoles(prev => [...prev, role]);
        }
    };

    const handleSaveRoles = async () => {
        if (!editingUser) return;
        try {
            // درخواست به روت اختصاصی لاراول که ساختیم
            await api.put(`/users/${editingUser.id}/roles`, { roles: selectedRoles });
            setEditingUser(null);
            fetchUsers(); // رفرش لیست
            alert('نقش‌ها با موفقیت آپدیت شدند');
        } catch (error) {
            alert(error.response?.data?.message || 'خطا در تغییر نقش');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">مدیریت کاربران</h2>
                    <p className="text-slate-400 text-sm mt-1">مشاهده لیست کاربران و تعیین سطح دسترسی</p>
                </div>
            </div>

            {/* Modal تغییر نقش */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-slate-800">تغییر نقش: {editingUser.name}</h3>
                            <button onClick={() => setEditingUser(null)}><X size={20} /></button>
                        </div>

                        <div className="space-y-3 mb-6">
                            <p className="text-sm text-slate-500 mb-2">نقش‌های مورد نظر را انتخاب کنید:</p>
                            <div className="grid grid-cols-2 gap-3">
                                {availableRoles.map(role => (
                                    <div key={role}
                                         onClick={() => toggleRole(role)}
                                         className={`cursor-pointer p-3 rounded-xl border flex items-center gap-2 transition-all ${selectedRoles.includes(role) ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'}`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedRoles.includes(role) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                            {selectedRoles.includes(role) && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                        </div>
                                        <span className="text-sm font-bold">{role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button onClick={handleSaveRoles} className="w-full">
                            <Save size={18} /> ذخیره تغییرات
                        </Button>
                    </div>
                </div>
            )}

            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-5 text-xs font-black text-slate-500">کاربر</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-500">ایمیل</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-500">نقش‌ها</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-500">عملیات</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {loading ? <tr><td colSpan="4" className="text-center py-10">لودینگ...</td></tr> : users.map(u => (
                        <tr key={u.id} className="group hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-bold text-slate-700 text-sm flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs">{u.name[0]}</div>
                                {u.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                    {u.roles?.map(r => (
                                        <Badge key={r} color={r === 'Manager' ? 'red' : r === 'Admin' ? 'violet' : 'blue'}>{r}</Badge>
                                    ))}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <button onClick={() => handleEditClick(u)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors">
                                    <Shield size={18} />
                                </button>
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