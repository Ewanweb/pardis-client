import React, { useState, useEffect } from 'react';
import { Layers, Sparkles, LogOut } from 'lucide-react';
import { api } from '../../context/AuthContext';
import { Button } from '../../components/UI';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');

    useEffect(() => { fetchCats(); }, []);

    const fetchCats = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', { name, parent_id: null });
            setName('');
            fetchCats();
        } catch (error) { alert('خطا'); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm('حذف شود؟')) return;
        try { await api.delete(`/categories/${id}`); fetchCats(); } catch (error) { alert('خطا: دسته خالی نیست'); }
    };

    return (
        <div>
            <h2 className="text-2xl font-black text-slate-800 mb-8">مدیریت دسته‌بندی‌ها</h2>

            <div className="grid md:grid-cols-3 gap-8">
                {/* فرم ساخت */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-fit">
                    <h3 className="font-bold text-slate-700 mb-4">افزودن دسته جدید</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <input className="w-full p-3 bg-slate-50 rounded-xl border outline-none" placeholder="نام دسته (مثلا: برنامه‌نویسی)" required value={name} onChange={e => setName(e.target.value)} />
                        <Button type="submit" className="w-full">ساخت دسته‌بندی</Button>
                    </form>
                </div>

                {/* لیست */}
                <div className="md:col-span-2 bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-100">
                        <tr><th className="px-6 py-4 text-xs font-black text-slate-500">نام دسته</th><th className="px-6 py-4 text-xs font-black text-slate-500">اسلاگ</th><th className="px-6 py-4 text-xs font-black text-slate-500">عملیات</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {categories.map(cat => (
                            <tr key={cat.id} className="group hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-slate-700">{cat.title}</td>
                                <td className="px-6 py-4 text-sm text-slate-400">{cat.slug}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleDelete(cat.id)} className="text-slate-400 hover:text-red-500"><LogOut size={18} /></button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default AdminCategories;