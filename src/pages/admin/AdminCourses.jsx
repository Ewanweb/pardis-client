import React, { useState, useEffect } from 'react';
import { Sparkles, LogOut, BookOpen } from 'lucide-react';
import { api } from '../../context/AuthContext';
import { Button, Badge } from '../../components/UI';

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', price: '', category_id: 1, description: '' });

    useEffect(() => { fetchCourses(); }, []);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
            setCourses(response.data.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/courses', { ...formData, status: 'published' });
            setShowModal(false);
            fetchCourses();
            setFormData({ title: '', price: '', category_id: 1, description: '' });
        } catch (error) { alert(error.response?.data?.message || 'خطا'); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm('آیا مطمئن هستید؟')) return;
        try { await api.delete(`/courses/${id}`); fetchCourses(); } catch (error) { alert('خطا در حذف'); }
    };

    return (
        <div>
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">مدیریت دوره‌ها</h2>
                    <p className="text-slate-400 text-sm mt-1">لیست تمام دوره‌های ثبت شده در سیستم</p>
                </div>
                <Button onClick={() => setShowModal(true)} icon={Sparkles}>دوره جدید</Button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl">
                        <div className="flex justify-between mb-6"><h3 className="text-xl font-black">ایجاد دوره</h3><button onClick={() => setShowModal(false)}><LogOut className="rotate-45"/></button></div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input className="w-full p-3 bg-slate-50 rounded-xl border outline-none" placeholder="عنوان" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" className="w-full p-3 bg-slate-50 rounded-xl border outline-none" placeholder="قیمت" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                                <input type="number" className="w-full p-3 bg-slate-50 rounded-xl border outline-none" placeholder="ID دسته" required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} />
                            </div>
                            <textarea className="w-full p-3 bg-slate-50 rounded-xl border outline-none h-24" placeholder="توضیحات" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            <Button type="submit" className="w-full mt-2">ذخیره</Button>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 border-b border-slate-100">
                    <tr><th className="px-6 py-5 text-xs font-black text-slate-500">دوره</th><th className="px-6 py-5 text-xs font-black text-slate-500">قیمت</th><th className="px-6 py-5 text-xs font-black text-slate-500">وضعیت</th><th className="px-6 py-5 text-xs font-black text-slate-500">عملیات</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {loading ? <tr><td colSpan="4" className="text-center py-10">لودینگ...</td></tr> : courses.map(course => (
                        <tr key={course.id} className="group hover:bg-slate-50/50">
                            <td className="px-6 py-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 overflow-hidden">{course.thumbnail ? <img src={course.thumbnail} className="w-full h-full object-cover"/> : <BookOpen size={18}/>}</div>
                                <span className="font-bold text-slate-700 text-sm">{course.title}</span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-700 text-sm">{Number(course.price).toLocaleString()}</td>
                            <td className="px-6 py-4"><Badge color={course.status === 'published' ? 'emerald' : 'amber'}>{course.status}</Badge></td>
                            <td className="px-6 py-4"><button onClick={() => handleDelete(course.id)} className="text-slate-400 hover:text-red-500"><LogOut size={18} /></button></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default AdminCourses;