import React, { useState, useEffect } from 'react';
import { Sparkles, LogOut, BookOpen, Search, Globe, Share2, Eye, EyeOff, AlertCircle, ChevronDown, Edit, Save, UploadCloud, Loader2, X, CheckCircle2, ChevronLeft, DollarSign, FileText, Image as ImageIcon, Trash2, RefreshCcw, Ban, AlertTriangle, User } from 'lucide-react';
import Editor from '../../components/Editor';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '../../services/api';
import { Button, Badge } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';

const AdminCourses = () => {
    const { hasRole } = useAuth();

    const [courses, setCourses] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    const [instructorsList, setInstructorsList] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showTrashed, setShowTrashed] = useState(false);

    const [currentStep, setCurrentStep] = useState(1);
    const TOTAL_STEPS = 5;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null);

    const initialFormState = {
        title: '', price: '', category_id: '', description: '', thumbnail: '', imageFile: null,
        status: 'draft', instructor_id: '',
        seo: { meta_title: '', meta_description: '', canonical_url: '', noindex: false, nofollow: false }
    };
    const [formData, setFormData] = useState(initialFormState);
    const SERVER_URL = 'https://localhost:44367'; // یا 8000 بسته به تنظیمات شما

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('blob:')) return path;
        // حذف اسلش اضافی احتمالی
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${SERVER_URL}${cleanPath}`;
    };
    useEffect(() => { fetchCourses(); }, [showTrashed]);

    useEffect(() => {
        fetchCategories();
        if (hasRole(['Admin', 'Manager'])) fetchInstructors();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const url = showTrashed ? '/courses?trashed=true' : '/courses';
            const response = await api.get(url);

            // ✅ ایمن‌سازی دریافت دیتا
            const data = response.data?.data || response.data || [];
            setCourses(Array.isArray(data) ? data : []);

        } catch (error) {
            console.error(error);
            toast.error('خطا در دریافت لیست دوره‌ها');
            setCourses([]);
        } finally { setLoading(false); }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategoriesList(response.data?.data || response.data || []);
        }
        catch (error) {
            console.error("Error categories", error);
            setCategoriesList([]);
        }
    };

    const fetchInstructors = async () => {
        try {
            const response = await api.get('/users?role=Instructor&all=true');
            setInstructorsList(response.data?.data || response.data || []);
        } catch (error) {
            console.error("Error instructors", error);
            setInstructorsList([]);
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setShowModal(false);
        setCurrentStep(1);
        setEditingCourseId(null);
        setIsSubmitting(false);
    };

    const handleEditClick = (course) => {
        setEditingCourseId(course.id);
        const catId = course.category?.id || course.category_id || '';
        const instId = course.instructor?.id || course.instructor_id || '';

        setFormData({
            title: course.title || '',
            price: course.price !== undefined ? course.price : '',
            category_id: catId,
            instructor_id: instId,
            description: course.description || '',
            thumbnail: course.thumbnail || course.image || '',
            status: course.status || 'draft',
            imageFile: null,
            seo: {
                meta_title: course.seo?.meta_title || '',
                meta_description: course.seo?.meta_description || '',
                canonical_url: course.seo?.canonical_url || '',
                noindex: !!course.seo?.noindex,
                nofollow: !!course.seo?.nofollow,
            }
        });
        setShowModal(true);
    };

    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSeoChange = (e) => { const { name, value, type, checked } = e.target; const val = type === 'checkbox' ? checked : value; setFormData(prev => ({ ...prev, seo: { ...prev.seo, [name]: val } })); };
    const handleFileSelect = (e) => { const file = e.target.files[0]; if (file) { if (file.size > 5 * 1024 * 1024) return toast.error('حجم بالا'); const newFormData = { ...formData, imageFile: file }; newFormData.thumbnail = URL.createObjectURL(file); setFormData(newFormData); toast.success('تصویر انتخاب شد'); } };
    const removeImage = () => { setFormData(prev => ({ ...prev, thumbnail: '', imageFile: null })); toast('تصویر حذف شد'); };

    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.title.trim()) return toast.error('عنوان الزامی است');
            const desc = formData.description ? formData.description.replace(/<[^>]*>?/gm, '').trim() : '';
            if (!desc && !formData.description.includes('<img')) return toast.error('توضیحات الزامی است');
        }
        if (currentStep === 2) {
            if (!formData.price && formData.price !== 0) return toast.error('قیمت الزامی است');
            if (!formData.category_id) return toast.error('دسته‌بندی الزامی است');
            if (hasRole(['Admin', 'Manager']) && !formData.instructor_id) return toast.error('انتخاب مدرس الزامی است');
        }
        if (currentStep < TOTAL_STEPS) setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => { if (currentStep > 1) setCurrentStep(prev => prev - 1); };

    const handleSave = async () => {
        setIsSubmitting(true);
        const savePromise = new Promise(async (resolve, reject) => {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('price', formData.price);
            data.append('CategoryId', formData.category_id);
            data.append('description', formData.description);
            data.append('status', formData.status);
            if (formData.instructor_id) data.append('instructor_id', formData.instructor_id);
            if (formData.imageFile) data.append('image', formData.imageFile);

            // ✅ اصلاح کلیدی برای ASP.NET Core:
            // ارسال مقادیر Boolean به صورت خودکار (به جای تبدیل به 1/0)
            // FormData خودش true/false را به رشته "true"/"false" تبدیل می‌کند که برای ASP عالی است.
            Object.keys(formData.seo).forEach(key => {
                const val = formData.seo[key];
                // اگر نال بود رشته خالی بفرست، وگرنه خود مقدار (حتی اگر بولین بود)
                const final = (val === null || val === undefined) ? '' : val;

                // استفاده از کلیدهای تو در تو (مناسب برای Model Binding)
                // اگر بک‌اند از seo[key] پشتیبانی میکند همین بماند، اگر Seo.Key میخواهد باید تغییر دهید
                // فعلا همان ساختار قبلی با اصلاح مقدار:
                data.append(`seo[${key}]`, final);
            });

            if (editingCourseId) data.append('_method', 'PUT');

            try {
                const url = editingCourseId ? `/courses/${editingCourseId}` : '/courses';
                await api.post(url, data, { headers: { 'Content-Type': 'multipart/form-data' } });
                fetchCourses();
                resetForm();
                resolve();
            } catch (error) {
                console.error(error);
                // نمایش خطاهای ولیدیشن به صورت دقیق‌تر
                if (error.response?.data?.errors) {
                    const errors = error.response.data.errors;
                    // گرفتن اولین پیام خطا از آبجکت خطاها
                    const firstErrorKey = Object.keys(errors)[0];
                    const firstErrorMessage = Array.isArray(errors[firstErrorKey])
                        ? errors[firstErrorKey][0]
                        : errors[firstErrorKey];
                    reject(firstErrorMessage);
                } else {
                    reject(error.response?.data?.title || error.response?.data?.message || 'خطا در عملیات');
                }
            }
        });
        await toast.promise(savePromise, { loading: 'ذخیره...', success: 'انجام شد', error: (e) => e }); setIsSubmitting(false);
    };

    const executeDelete = async (id) => { api.delete(`/courses/${id}`).then(() => { setCourses(prev => prev.filter(c => c.id !== id)); toast.success('حذف شد'); }).catch(() => toast.error('خطا')); };
    const handleDelete = (id) => { toast((t) => (<div className="flex flex-col gap-3 min-w-[280px]"><p className="font-bold text-sm text-slate-700 dark:text-slate-200">به سطل زباله منتقل شود؟</p><div className="flex gap-2 justify-end"><button onClick={() => toast.dismiss(t.id)} className="text-slate-500 text-xs">انصراف</button><button onClick={() => { toast.dismiss(t.id); executeDelete(id); }} className="bg-amber-500 text-white px-3 py-1 rounded text-xs shadow-sm">بله</button></div></div>)); };
    const handleRestore = async (id) => { api.post(`/courses/${id}/restore`).then(() => { setCourses(prev => prev.filter(c => c.id !== id)); toast.success('بازیابی شد'); }); };
    const handleForceDelete = async (id) => { toast((t) => (<div className="flex flex-col gap-3 min-w-[280px]"><p className="font-bold text-sm text-red-600">حذف دائم؟ غیرقابل بازگشت!</p><div className="flex gap-2 justify-end"><button onClick={() => toast.dismiss(t.id)} className="text-slate-500 text-xs">انصراف</button><button onClick={() => { toast.dismiss(t.id); api.delete(`/courses/${id}/force`).then(() => { setCourses(prev => prev.filter(c => c.id !== id)); toast.success('حذف دائم شد'); }); }} className="bg-red-600 text-white px-3 py-1 rounded text-xs shadow-sm">حذف</button></div></div>)); };

    const Stepper = () => (<div className="flex justify-between items-center mb-8 px-4 relative"><div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-10 rounded-full"></div><div className="absolute top-1/2 left-0 h-1 bg-indigo-500 -z-10 rounded-full transition-all duration-300" style={{ width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%` }}></div>{[{ id: 1, icon: FileText, label: 'محتوا' }, { id: 2, icon: DollarSign, label: 'جزئیات' }, { id: 3, icon: ImageIcon, label: 'تصویر' }, { id: 4, icon: Globe, label: 'سئو' }, { id: 5, icon: CheckCircle2, label: 'انتشار' }].map((step) => (<div key={step.id} className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 px-2 transition-colors"><div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= step.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'}`}><step.icon size={18} /></div><span className={`text-[10px] font-bold ${currentStep >= step.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>{step.label}</span></div>))}</div>);

    return (
        <div>
            <Toaster position="top-center" reverseOrder={false} toastOptions={{ style: { fontFamily: 'Vazirmatn', fontSize: '14px', borderRadius: '12px', background: '#333', color: '#fff' }}} />

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">مدیریت دوره‌ها</h2>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">لیست تمام دوره‌های ثبت شده در سیستم</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex">
                        <button onClick={() => setShowTrashed(false)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!showTrashed ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>دوره‌های فعال</button>
                        <button onClick={() => setShowTrashed(true)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${showTrashed ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}><Trash2 size={16} /> <span className="hidden sm:inline">سطل زباله</span></button>
                    </div>
                    <Button onClick={() => { resetForm(); setShowModal(true); }} icon={Sparkles}>دوره جدید</Button>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-4xl shadow-2xl my-8 flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-[2rem]">
                            <div><h3 className="text-xl font-black text-slate-800 dark:text-white">{editingCourseId ? 'ویرایش دوره' : 'ایجاد دوره جدید'}</h3><p className="text-xs text-slate-400 dark:text-slate-500 mt-1">مرحله {currentStep} از {TOTAL_STEPS}</p></div>
                            <button onClick={resetForm} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 dark:text-slate-500 hover:text-red-500 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <Stepper />
                            <div className="min-h-[300px]">
                                {/* STEP 1 */}
                                {currentStep === 1 && (<div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300"><div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">عنوان دوره</label><input className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-white transition-colors" required name="title" value={formData.title} onChange={handleChange} placeholder="مثال: آموزش پیشرفته React" /></div><div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">توضیحات کامل دوره</label><Editor value={formData.description} onChange={(val) => setFormData(prev => ({ ...prev, description: val }))} /></div></div>)}

                                {/* STEP 2 */}
                                {currentStep === 2 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-8 duration-300">
                                        <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">قیمت (تومان)</label><div className="relative"><input type="number" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-white transition-colors" required name="price" value={formData.price} onChange={handleChange} placeholder="0" /><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs font-bold">تومان</span></div><p className="text-xs text-slate-400 dark:text-slate-500 mt-2">عدد ۰ به معنی رایگان است.</p></div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">دسته‌بندی والد</label>
                                                {/* ✅ استفاده از ?.map برای جلوگیری از ارور اگر لیست نال بود */}
                                                <div className="relative"><select className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-700 dark:text-slate-200 appearance-none cursor-pointer transition-colors" required name="category_id" value={formData.category_id} onChange={handleChange}><option value="" disabled>انتخاب کنید...</option>{categoriesList?.map(cat => (<option key={cat.id} value={cat.id}>{cat.title}</option>))}</select><ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={20} /></div>
                                            </div>
                                            {/* انتخاب مدرس */}
                                            {hasRole(['Admin', 'Manager']) && (
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><User size={16}/> مدرس دوره</label>
                                                    {/* ✅ استفاده از ?.map */}
                                                    <div className="relative"><select className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-medium text-slate-700 dark:text-slate-200 appearance-none cursor-pointer transition-colors" name="instructor_id" value={formData.instructor_id} onChange={handleChange}><option value="" disabled>انتخاب مدرس...</option>{instructorsList?.map(inst => (<option key={inst.id} value={inst.id}>{inst.name} ({inst.email})</option>))}</select><ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={20} /></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {/* STEP 3, 4, 5 are the same... */}
                                {currentStep === 3 && (<div className="animate-in fade-in slide-in-from-right-8 duration-300"><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">تصویر شاخص دوره</label><div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-400 transition-all cursor-pointer relative overflow-hidden group"><input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" accept="image/*" onChange={handleFileSelect} />{formData.thumbnail ? (<div className="w-full max-w-md aspect-video rounded-xl overflow-hidden shadow-lg relative z-10"><img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold">تغییر تصویر</div></div>) : (<><div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><UploadCloud size={40} /></div><div className="text-center"><p className="text-lg font-bold text-slate-700 dark:text-slate-200">برای انتخاب تصویر کلیک کنید</p><p className="text-sm text-slate-400 dark:text-slate-500 mt-1">یا فایل را اینجا رها کنید</p></div></>)}</div></div>)}
                                {currentStep === 4 && (<div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300"><div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700"><h4 className="text-xs font-bold text-slate-400 mb-4 flex items-center gap-2"><Search size={16}/> پیش‌نمایش در گوگل</h4><div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm max-w-xl"><h3 className="text-[#1a0dab] dark:text-indigo-400 font-medium text-xl hover:underline cursor-pointer truncate">{formData.seo.meta_title || formData.title || 'عنوان دوره'}</h3><p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{formData.seo.meta_description || 'توضیحات متای دوره...'}</p></div></div><div className="grid gap-4"><div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Meta Title</label><input className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none dark:text-white" name="meta_title" value={formData.seo.meta_title} onChange={handleSeoChange} placeholder={formData.title} /></div><div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Meta Description</label><textarea className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none h-24 resize-none dark:text-white" name="meta_description" value={formData.seo.meta_description} onChange={handleSeoChange} /></div><div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1"><Share2 size={12}/> Canonical URL</label><input className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-left dark:text-white" dir="ltr" name="canonical_url" value={formData.seo.canonical_url} onChange={handleSeoChange} /></div><div className="grid grid-cols-2 gap-4"><label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${formData.seo.noindex ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}><span className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">{formData.seo.noindex ? <EyeOff size={16} className="text-red-500"/> : <Eye size={16} className="text-slate-400"/>} NoIndex</span><input type="checkbox" className="w-4 h-4 accent-red-500" name="noindex" checked={formData.seo.noindex} onChange={handleSeoChange} /></label><label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${formData.seo.nofollow ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}><span className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2"><AlertCircle size={16} className={formData.seo.nofollow ? "text-amber-500" : "text-slate-400"}/> NoFollow</span><input type="checkbox" className="w-4 h-4 accent-amber-500" name="nofollow" checked={formData.seo.nofollow} onChange={handleSeoChange} /></label></div></div></div>)}
                                {currentStep === 5 && (<div className="flex flex-col items-center justify-center py-10 animate-in fade-in slide-in-from-right-8 duration-300"><div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 animate-bounce-slow"><Sparkles size={48} /></div><h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">تقریباً تمام است!</h3><p className="text-slate-500 dark:text-slate-400 mb-8">وضعیت انتشار دوره را مشخص کنید.</p><div className="grid grid-cols-3 gap-4 w-full max-w-lg mb-10">{[{ value: 'draft', label: 'پیش‌نویس', icon: FileText, color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' }, { value: 'published', label: 'انتشار عمومی', icon: Globe, color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400' }, { value: 'archived', label: 'آرشیو', icon: LogOut, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' }].map((status) => (<button key={status.value} onClick={() => setFormData(prev => ({ ...prev, status: status.value }))} className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${formData.status === status.value ? `${status.color} border-current shadow-lg scale-105` : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><status.icon size={24} /><span className="font-bold text-sm">{status.label}</span></button>))}</div></div>)}
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-b-[2rem]">
                            <Button variant="ghost" onClick={currentStep === 1 ? resetForm : prevStep} className="!px-6 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
                                {currentStep === 1 ? 'انصراف' : 'مرحله قبل'}
                            </Button>
                            {currentStep < TOTAL_STEPS ? (
                                <Button onClick={nextStep} className="w-32 !bg-slate-900 hover:!bg-black dark:!bg-indigo-600 dark:hover:!bg-indigo-500">
                                    مرحله بعد <ChevronLeft size={18} className="mr-1"/>
                                </Button>
                            ) : (
                                <Button onClick={handleSave} disabled={isSubmitting} className="w-40 shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-2"><Save size={18}/> ذخیره نهایی</span>}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TABLE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm overflow-hidden transition-colors">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                    <tr><th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">دوره</th><th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">مدرس</th><th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">قیمت</th><th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">وضعیت</th><th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">عملیات</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {/* ✅ استفاده از ?.map در جدول */}
                    {loading ? (<tr><td colSpan="6" className="text-center py-12 text-slate-400 dark:text-slate-500">در حال بارگذاری...</td></tr>) : courses?.length === 0 ? (<tr><td colSpan="6" className="text-center py-16"><p className="text-slate-400 dark:text-slate-500 text-sm font-bold">هیچ دوره‌ای یافت نشد!</p></td></tr>) : courses?.map(course => (
                        <tr key={course.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3"><div className="w-14 h-14 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 overflow-hidden border border-indigo-100 dark:border-indigo-900/50 shadow-sm">{course.thumbnail ? <img src={getImageUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" onError={(e) => e.target.src = "https://placehold.co/100?text=Error"} /> : <BookOpen size={24}/>}</div><div><span className="font-bold text-slate-700 dark:text-slate-200 text-sm block">{course.title}</span><span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mt-1 inline-block">{course.category?.title || 'بدون دسته'}</span></div></td>
                            <td className="px-6 py-4"><span className="text-sm font-medium text-slate-600 dark:text-slate-300">{course.instructor?.name || 'نامشخص'}</span></td>
                            <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 text-sm">{Number(course.price).toLocaleString()}</td>
                            <td className="px-6 py-4"><Badge color={course.status === 'published' ? 'emerald' : 'amber'}>{course.status}</Badge></td>
                            <td className="px-6 py-4"><div className="flex items-center gap-2">{showTrashed ? (<><button onClick={() => handleRestore(course.id)} className="text-emerald-500"><RefreshCcw size={18}/></button><button onClick={() => handleForceDelete(course.id)} className="text-red-500"><Ban size={18}/></button></>) : (<><button onClick={() => handleEditClick(course)} className="text-slate-400 dark:text-slate-500 hover:text-indigo-600"><Edit size={18}/></button><button onClick={() => handleDelete(course.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500"><Trash2 size={18}/></button></>)}</div></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCourses;