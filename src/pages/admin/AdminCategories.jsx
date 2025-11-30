import React, { useState, useEffect } from 'react';
import { Sparkles, LogOut, Layers, Search, Globe, Share2, Eye, EyeOff, AlertCircle, ChevronDown, Edit, Save, UploadCloud, Loader2, X, FolderTree, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '../../services/api';
import { Button, Badge } from '../../components/UI';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const initialFormState = {
        name: '',
        parent_id: '',
        image: '',
        imageFile: null,
        is_active: true,
        seo: {
            meta_title: '',
            meta_description: '',
            canonical_url: '',
            noindex: false,
            nofollow: false,
        }
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data.data);
        } catch (error) {
            console.error(error);
            toast.error('خطا در دریافت دسته‌بندی‌ها');
        } finally { setLoading(false); }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setShowModal(false);
        setActiveTab('general');
        setEditingId(null);
        setIsSubmitting(false);
    };

    const handleEditClick = (cat) => {
        setEditingId(cat.id);
        setFormData({
            name: cat.title,
            parent_id: cat.parentId || '',
            image: cat.image || '',
            imageFile: null,
            is_active: Boolean(cat.isActive),
            seo: {
                meta_title: cat.seo?.metaTitle || '',
                meta_description: cat.seo?.metaDescription || '',
                canonical_url: cat.seo?.canonicalUrl || '',
                noindex: cat.seo?.noIndex || false,
                nofollow: cat.seo?.noFollow || false,
            }
        });
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSeoChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({
            ...prev,
            seo: { ...prev.seo, [name]: val }
        }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) return toast.error('حجم تصویر نباید بیشتر از ۲ مگابایت باشد');
            const newFormData = { ...formData, imageFile: file };
            newFormData.image = URL.createObjectURL(file);
            setFormData(newFormData);
            toast.success('تصویر انتخاب شد');
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: '', imageFile: null }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const savePromise = new Promise(async (resolve, reject) => {
            const payload = new FormData();
            payload.append('Name', formData.name);
            if(formData.parent_id) payload.append('ParentId', formData.parent_id);
            payload.append('IsActive', formData.is_active);

            if (formData.imageFile) payload.append('Image', formData.imageFile);

            payload.append('Seo.MetaTitle', formData.seo.meta_title || '');
            payload.append('Seo.MetaDescription', formData.seo.meta_description || '');
            payload.append('Seo.CanonicalUrl', formData.seo.canonical_url || '');
            payload.append('Seo.NoIndex', formData.seo.noindex);
            payload.append('Seo.NoFollow', formData.seo.nofollow);

            try {
                if (editingId) {
                    await api.put(`/categories/${editingId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
                } else {
                    await api.post('/categories', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
                }
                fetchCategories();
                resetForm();
                resolve();
            } catch (error) {
                const msg = error.response?.data?.message || 'خطا در عملیات';
                reject(msg);
            }
        });

        await toast.promise(savePromise, {
            loading: 'در حال ذخیره...',
            success: <b>{editingId ? 'دسته ویرایش شد!' : 'دسته جدید ساخته شد!'}</b>,
            error: (err) => <b>{err}</b>,
        });

        setIsSubmitting(false);
    };

    const executeDelete = async (id) => {
        const deletePromise = api.delete(`/categories/${id}`);
        toast.promise(deletePromise, {
            loading: 'در حال حذف...',
            success: () => {
                fetchCategories();
                return 'دسته‌بندی با موفقیت حذف شد';
            },
            error: (err) => err.response?.data?.message || 'خطا در حذف دسته‌بندی',
        });
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-4 min-w-[300px]">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 shrink-0 animate-pulse">
                        <Trash2 size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">حذف دسته‌بندی</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            آیا از حذف اطمینان دارید؟ اگر این دسته دارای دوره یا زیرمجموعه باشد، حذف نخواهد شد.
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
        ), { duration: 5000, position: 'top-center', style: { borderRadius: '16px', padding: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }});
    };

    return (
        <div>
            <Toaster position="top-center" reverseOrder={false} toastOptions={{ style: { fontFamily: 'Vazirmatn', fontSize: '14px', borderRadius: '12px', background: '#333', color: '#fff' }}} />

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">مدیریت دسته‌بندی‌ها</h2>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">دسته‌بندی‌های دوره را ایجاد و مدیریت کنید</p>
                </div>
                <Button onClick={() => { resetForm(); setShowModal(true); }} icon={Sparkles}>دسته‌بندی جدید</Button>
            </div>

            {/* --- MODAL --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl shadow-2xl my-8 flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-800">

                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-[2rem]">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">{editingId ? 'ویرایش دسته‌بندی' : 'ایجاد دسته‌بندی جدید'}</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">اطلاعات عمومی و تنظیمات سئو</p>
                            </div>
                            <button onClick={resetForm} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 dark:text-slate-500 hover:text-red-500 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <div className="flex px-6 border-b border-slate-100 dark:border-slate-800 gap-6">
                            <button onClick={() => setActiveTab('general')} className={`py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'general' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>اطلاعات عمومی</button>
                            <button onClick={() => setActiveTab('seo')} className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'seo' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}><Globe size={16} /> سئو (SEO)</button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="catForm" onSubmit={handleSave} className="space-y-6">

                                {/* TAB 1: GENERAL */}
                                {activeTab === 'general' && (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">نام دسته‌بندی</label>
                                            <input className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-white transition-colors"
                                                   required name="name" value={formData.name} onChange={handleChange} placeholder="مثال: برنامه نویسی وب" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">دسته‌بندی والد (اختیاری)</label>
                                            <div className="relative">
                                                <select className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-700 dark:text-slate-200 appearance-none cursor-pointer transition-colors"
                                                        name="parent_id" value={formData.parent_id} onChange={handleChange}>
                                                    <option value="">--- دسته‌بندی اصلی (ریشه) ---</option>
                                                    {categories
                                                        .filter(cat => cat.id !== editingId)
                                                        .map(cat => (
                                                            <option key={cat.id} value={cat.id}>{cat.title}</option>
                                                        ))}
                                                </select>
                                                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={20} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">تصویر دسته‌بندی</label>
                                            <div className="flex gap-4 items-start">
                                                <label className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer font-bold text-sm">
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                                                    <UploadCloud size={20} />
                                                    <span>انتخاب تصویر</span>
                                                </label>
                                                {formData.image && (
                                                    <div className="relative h-[60px] w-auto aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm group">
                                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                                        <button type="button" onClick={removeImage} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.checked}))} className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" />
                                            <label htmlFor="is_active" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">این دسته‌بندی فعال باشد</label>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: SEO */}
                                {activeTab === 'seo' && (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
                                            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1"><Search size={14}/> پیش‌نمایش گوگل</h4>
                                            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                                                <span className="text-[10px] text-slate-800 dark:text-slate-200 font-bold block mb-1">Pardis Academy</span>
                                                <h3 className="text-[#1a0dab] dark:text-indigo-400 font-medium text-lg truncate">{formData.seo.meta_title || formData.name || 'عنوان دسته'}</h3>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{formData.seo.meta_description || 'توضیحات متا اینجا قرار می‌گیرد...'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Meta Title</label>
                                            <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-sm font-medium dark:text-white" name="meta_title" value={formData.seo.meta_title} onChange={handleSeoChange} placeholder={formData.name} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Meta Description</label>
                                            <textarea className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none h-24 resize-none text-sm font-medium dark:text-white" name="meta_description" value={formData.seo.meta_description} onChange={handleSeoChange} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1"><Share2 size={12}/> Canonical URL</label>
                                            <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-left text-sm font-medium dark:text-white" dir="ltr" name="canonical_url" value={formData.seo.canonical_url} onChange={handleSeoChange} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${formData.seo.noindex ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">{formData.seo.noindex ? <EyeOff size={16} className="text-red-500"/> : <Eye size={16} className="text-slate-400"/>} NoIndex</span>
                                                <input type="checkbox" className="w-4 h-4 accent-red-500" name="noindex" checked={formData.seo.noindex} onChange={handleSeoChange} />
                                            </label>
                                            <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${formData.seo.nofollow ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2"><AlertCircle size={16} className={formData.seo.nofollow ? "text-amber-500" : "text-slate-400"}/> NoFollow</span>
                                                <input type="checkbox" className="w-4 h-4 accent-amber-500" name="nofollow" checked={formData.seo.nofollow} onChange={handleSeoChange} />
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-b-[2rem]">
                            <button onClick={resetForm} className="px-6 py-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white font-bold text-sm">انصراف</button>
                            <Button type="submit" form="catForm" disabled={isSubmitting} icon={isSubmitting ? Loader2 : (editingId ? Save : Sparkles)}>{isSubmitting ? 'در حال ذخیره...' : (editingId ? 'ذخیره تغییرات' : 'ایجاد دسته‌بندی')}</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* LIST TABLE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm overflow-hidden transition-colors">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">دسته‌بندی</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">والد</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">سازنده</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">وضعیت</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">دوره‌ها</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">عملیات</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {loading ? (<tr><td colSpan="6" className="text-center py-10 text-slate-400 dark:text-slate-500">در حال بارگذاری...</td></tr>) : categories.map(cat => (
                        <tr key={cat.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center overflow-hidden">
                                        {cat.image ? <img src={cat.image} className="w-full h-full object-cover"/> : <Layers size={20} className="text-indigo-300 dark:text-indigo-500"/>}
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-700 dark:text-slate-200 block text-sm">{cat.title}</span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">/{cat.slug}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {cat.parentId ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs rounded-lg font-bold">
                                            <FolderTree size={12}/>
                                        {categories.find(c => c.id === cat.parentId)?.title || 'والد ناشناس'}
                                        </span>
                                ) : (
                                    <span className="text-xs text-slate-300 dark:text-slate-600 font-bold">--- ریشه ---</span>
                                )}
                            </td>

                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                        {cat.creator ? cat.creator.charAt(0) : 'S'}
                                    </div>
                                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                                            {cat.creator || 'سیستم'}
                                        </span>
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                <Badge color={cat.isActive ? 'emerald' : 'red'}>{cat.isActive ? 'فعال' : 'غیرفعال'}</Badge>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{cat.coursesCount || 0}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEditClick(cat)} className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(cat.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"><Trash2 size={18} /></button>
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

export default AdminCategories;