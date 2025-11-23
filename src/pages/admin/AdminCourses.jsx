import React, { useState, useEffect } from 'react';
import { Sparkles, LogOut, BookOpen, Search, Globe, Share2, Eye, EyeOff, AlertCircle, ChevronDown, Edit, Save, UploadCloud, Loader2, X, CheckCircle2, ChevronLeft, DollarSign, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import Editor from '../../components/Editor';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '../../context/AuthContext';
import { Button, Badge } from '../../components/UI';

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [currentStep, setCurrentStep] = useState(1);
    const TOTAL_STEPS = 5;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null);

    // استیت فرم (thumbnail برای نمایش لینک قبلی، imageFile برای فایل جدید)
    const initialFormState = {
        title: '', price: '', category_id: '', description: '', thumbnail: '', imageFile: null,
        status: 'draft',
        seo: {
            meta_title: '', meta_description: '', canonical_url: '', noindex: false, nofollow: false,
        }
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchCourses();
        fetchCategories();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
            setCourses(response.data.data);
        } catch (error) {
            console.error(error);
            toast.error('خطا در دریافت لیست دوره‌ها');
        } finally { setLoading(false); }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategoriesList(response.data.data);
        } catch (error) { console.error("Error fetching categories:", error); }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setShowModal(false);
        setCurrentStep(1);
        setEditingCourseId(null);
        setIsSubmitting(false);
    };

    // ✅ تابع پر کردن فرم برای ویرایش (با حل مشکل دسته‌بندی و قیمت)
    const handleEditClick = (course) => {
        setEditingCourseId(course.id);

        // پیدا کردن ID دسته‌بندی (چه عدد باشد چه آبجکت)
        let catId = '';
        if (course.category_id) catId = course.category_id;
        else if (course.category && course.category.id) catId = course.category.id;

        setFormData({
            title: course.title || '',
            // تبدیل قیمت به عدد یا رشته خالی برای جلوگیری از warning
            price: course.price !== undefined ? course.price : '',
            category_id: catId,
            description: course.description || '',
            // استفاده از فیلد image به جای thumbnail اگر thumbnail خالی بود (طبق Resource لاراول)
            thumbnail: course.thumbnail || course.image || '',
            status: course.status || 'draft',
            imageFile: null, // فایل جدید نداریم
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

    // انتخاب فایل جدید
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) return toast.error('حجم تصویر نباید بیشتر از ۲ مگابایت باشد');

            const newFormData = { ...formData, imageFile: file };
            // ساخت پیش‌نمایش موقت
            newFormData.thumbnail = URL.createObjectURL(file);
            setFormData(newFormData);
            toast.success('تصویر انتخاب شد');
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, thumbnail: '', imageFile: null }));
        toast('تصویر حذف شد', { icon: '🗑️' });
    };

    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.title) return toast.error('لطفاً عنوان دوره را وارد کنید');
            if (!formData.description || formData.description === '<p></p>') return toast.error('توضیحات الزامی است');
        }
        if (currentStep === 2) {
            if (!formData.price && formData.price !== 0) return toast.error('قیمت دوره الزامی است');
            if (!formData.category_id) return toast.error('دسته‌بندی الزامی است');
        }

        if (currentStep < TOTAL_STEPS) setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    // ✅ ذخیره‌سازی با مدیریت صحیح عکس در ویرایش
    const handleSave = async () => {
        setIsSubmitting(true);

        const savePromise = new Promise(async (resolve, reject) => {
            const data = new FormData();

            data.append('title', formData.title);
            data.append('price', formData.price);
            data.append('category_id', formData.category_id);
            data.append('description', formData.description);
            data.append('status', formData.status);

            // فقط اگر فایل جدید انتخاب شده باشد ارسال کن
            if (formData.imageFile) {
                data.append('image', formData.imageFile);
            }
            // نکته: اگر فایل جدید نبود، هیچی نفرست (لاراول عکس قبلی را نگه میدارد)

            Object.keys(formData.seo).forEach(key => {
                const val = formData.seo[key];
                const finalVal = typeof val === 'boolean' ? (val ? 1 : 0) : (val || '');
                data.append(`seo[${key}]`, finalVal);
            });

            if (editingCourseId) {
                data.append('_method', 'PUT');
            }

            try {
                const url = editingCourseId ? `/courses/${editingCourseId}` : '/courses';
                await api.post(url, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                fetchCourses();
                resetForm();
                resolve();
            } catch (error) {
                console.error(error);
                // گرفتن اولین ارور ولیدیشن اگر موجود بود
                const errors = error.response?.data?.errors;
                let msg = error.response?.data?.message || 'خطا در عملیات';
                if (errors) msg = Object.values(errors)[0][0];

                reject(msg);
            }
        });

        await toast.promise(savePromise, {
            loading: 'در حال ذخیره...',
            success: <b>{editingCourseId ? 'دوره ویرایش شد!' : 'دوره ساخته شد!'}</b>,
            error: (err) => <b>{err}</b>,
        });

        setIsSubmitting(false);
    };

    const handleDelete = async (id) => {
        if(!window.confirm('آیا مطمئن هستید؟')) return;

        const deletePromise = api.delete(`/courses/${id}`);

        toast.promise(deletePromise, {
            loading: 'در حال حذف...',
            success: () => {
                setCourses(prev => prev.filter(c => c.id !== id));
                return 'دوره حذف شد';
            },
            error: 'خطا در حذف دوره',
        });
    };

    const Stepper = () => (
        <div className="flex justify-between items-center mb-8 px-4 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-indigo-500 -z-10 rounded-full transition-all duration-300" style={{ width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%` }}></div>
            {[ { id: 1, icon: FileText, label: 'محتوا' }, { id: 2, icon: DollarSign, label: 'جزئیات' }, { id: 3, icon: ImageIcon, label: 'تصویر' }, { id: 4, icon: Globe, label: 'سئو' }, { id: 5, icon: CheckCircle2, label: 'انتشار' } ].map((step) => (
                <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= step.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white border-slate-200 text-slate-400'}`}><step.icon size={18} /></div>
                    <span className={`text-[10px] font-bold ${currentStep >= step.id ? 'text-indigo-600' : 'text-slate-400'}`}>{step.label}</span>
                </div>
            ))}
        </div>
    );

    return (
        <div>
            <Toaster position="top-center" reverseOrder={false} toastOptions={{ style: { fontFamily: 'Vazirmatn', fontSize: '14px', borderRadius: '12px', background: '#333', color: '#fff' }}} />

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">مدیریت دوره‌ها</h2>
                    <p className="text-slate-400 text-sm mt-1">لیست تمام دوره‌های ثبت شده در سیستم</p>
                </div>
                <Button onClick={() => { resetForm(); setShowModal(true); }} icon={Sparkles}>دوره جدید</Button>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl my-8 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-[2rem]">
                            <div><h3 className="text-xl font-black text-slate-800">{editingCourseId ? 'ویرایش دوره' : 'ایجاد دوره جدید'}</h3><p className="text-xs text-slate-400 mt-1">مرحله {currentStep} از {TOTAL_STEPS}</p></div>
                            <button onClick={resetForm} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <Stepper />
                            <div className="min-h-[300px]">
                                {/* STEP 1 */}
                                {currentStep === 1 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                                        <div><label className="block text-sm font-bold text-slate-700 mb-2">عنوان دوره</label><input className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-800" required name="title" value={formData.title} onChange={handleChange} placeholder="مثال: آموزش پیشرفته React" /></div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-2">توضیحات کامل دوره</label><Editor value={formData.description} onChange={(val) => setFormData(prev => ({ ...prev, description: val }))} /></div>
                                    </div>
                                )}
                                {/* STEP 2 */}
                                {currentStep === 2 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-8 duration-300">
                                        <div><label className="block text-sm font-bold text-slate-700 mb-2">قیمت دوره (تومان)</label><div className="relative"><input type="number" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none font-bold text-slate-800" required name="price" value={formData.price} onChange={handleChange} placeholder="0" /><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">تومان</span></div><p className="text-xs text-slate-400 mt-2">عدد ۰ به معنی رایگان است.</p></div>
                                        <div><label className="block text-sm font-bold text-slate-700 mb-2">دسته‌بندی والد</label><div className="relative"><select className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none font-medium text-slate-700 appearance-none cursor-pointer" required name="category_id" value={formData.category_id} onChange={handleChange}><option value="" disabled>انتخاب کنید...</option>{categoriesList.map(cat => (<option key={cat.id} value={cat.id}>{cat.title}</option>))}</select><ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} /></div></div>
                                    </div>
                                )}
                                {/* STEP 3 */}
                                {currentStep === 3 && (
                                    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                                        <label className="block text-sm font-bold text-slate-700 mb-4">تصویر شاخص دوره</label>
                                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-slate-50 hover:border-indigo-400 transition-all cursor-pointer relative overflow-hidden group">
                                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" accept="image/*" onChange={handleFileSelect} />
                                            {formData.thumbnail ? (<div className="w-full max-w-md aspect-video rounded-xl overflow-hidden shadow-lg relative z-10"><img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" /><button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 p-1 rounded-full text-white shadow-lg hover:bg-red-600 transition-colors z-30"><X size={16}/></button></div>) : (<><div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><UploadCloud size={40} /></div><div className="text-center"><p className="text-lg font-bold text-slate-700">برای انتخاب تصویر کلیک کنید</p><p className="text-sm text-slate-400 mt-1">یا فایل را اینجا رها کنید</p></div></>)}
                                        </div>
                                    </div>
                                )}
                                {/* STEP 4 */}
                                {currentStep === 4 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200"><h4 className="text-xs font-bold text-slate-400 mb-4 flex items-center gap-2"><Search size={16}/> پیش‌نمایش در گوگل</h4><div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm max-w-xl"><h3 className="text-[#1a0dab] font-medium text-xl hover:underline cursor-pointer truncate">{formData.seo.meta_title || formData.title || 'عنوان دوره'}</h3><p className="text-sm text-slate-600 mt-1 line-clamp-2">{formData.seo.meta_description || 'توضیحات متای دوره...'}</p></div></div>
                                        <div className="grid gap-4">
                                            <div><label className="block text-xs font-bold text-slate-500 mb-1.5">Meta Title</label><input className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none" name="meta_title" value={formData.seo.meta_title} onChange={handleSeoChange} placeholder={formData.title} /></div>
                                            <div><label className="block text-xs font-bold text-slate-500 mb-1.5">Meta Description</label><textarea className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none h-24 resize-none" name="meta_description" value={formData.seo.meta_description} onChange={handleSeoChange} /></div>
                                            <div><label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Share2 size={12}/> Canonical URL</label><input className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none text-left" dir="ltr" name="canonical_url" value={formData.seo.canonical_url} onChange={handleSeoChange} /></div>
                                            <div className="grid grid-cols-2 gap-4"><label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${formData.seo.noindex ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}><span className="text-sm font-bold text-slate-600 flex items-center gap-2">{formData.seo.noindex ? <EyeOff size={16} className="text-red-500"/> : <Eye size={16} className="text-slate-400"/>} NoIndex</span><input type="checkbox" className="w-4 h-4 accent-red-500" name="noindex" checked={formData.seo.noindex} onChange={handleSeoChange} /></label><label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${formData.seo.nofollow ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}><span className="text-sm font-bold text-slate-600 flex items-center gap-2"><AlertCircle size={16} className={formData.seo.nofollow ? "text-amber-500" : "text-slate-400"}/> NoFollow</span><input type="checkbox" className="w-4 h-4 accent-amber-500" name="nofollow" checked={formData.seo.nofollow} onChange={handleSeoChange} /></label></div>
                                        </div>
                                    </div>
                                )}
                                {/* STEP 5 */}
                                {currentStep === 5 && (
                                    <div className="flex flex-col items-center justify-center py-10 animate-in fade-in slide-in-from-right-8 duration-300">
                                        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce-slow"><Sparkles size={48} /></div>
                                        <h3 className="text-2xl font-black text-slate-800 mb-2">تقریباً تمام است!</h3>
                                        <p className="text-slate-500 mb-8">وضعیت انتشار دوره را مشخص کنید.</p>
                                        <div className="grid grid-cols-3 gap-4 w-full max-w-lg mb-10">
                                            {[{ value: 'draft', label: 'پیش‌نویس', icon: FileText, color: 'bg-slate-100 text-slate-600' }, { value: 'published', label: 'انتشار عمومی', icon: Globe, color: 'bg-emerald-50 border-emerald-500 text-emerald-700' }, { value: 'archived', label: 'آرشیو شده', icon: LogOut, color: 'bg-amber-50 text-amber-700' }].map((status) => (
                                                <button key={status.value} onClick={() => setFormData(prev => ({ ...prev, status: status.value }))} className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${formData.status === status.value ? `${status.color} border-current shadow-lg scale-105` : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}><status.icon size={24} /><span className="font-bold text-sm">{status.label}</span></button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50 rounded-b-[2rem]">
                            <Button variant="ghost" onClick={currentStep === 1 ? resetForm : prevStep} className="!px-6">{currentStep === 1 ? 'انصراف' : 'مرحله قبل'}</Button>
                            {currentStep < TOTAL_STEPS ? (<Button onClick={nextStep} className="w-32 !bg-slate-900 hover:!bg-black">مرحله بعد <ChevronLeft size={18} className="mr-1"/></Button>) : (<Button onClick={handleSave} disabled={isSubmitting} className="w-40 shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700">{isSubmitting ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-2"><Save size={18}/> ذخیره نهایی</span>}</Button>)}
                        </div>
                    </div>
                </div>
            )}

            {/* Table List */}
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 border-b border-slate-100"><tr><th className="px-6 py-5 text-xs font-black text-slate-500">دوره</th><th className="px-6 py-5 text-xs font-black text-slate-500">قیمت</th><th className="px-6 py-5 text-xs font-black text-slate-500">وضعیت</th><th className="px-6 py-5 text-xs font-black text-slate-500">عملیات</th></tr></thead>
                    <tbody className="divide-y divide-slate-50">
                    {loading ? <tr><td colSpan="4" className="text-center py-10">لودینگ...</td></tr> : courses.map(course => (
                        <tr key={course.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3">
                                <div className="w-14 h-14 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 overflow-hidden border border-indigo-100 shadow-sm group-hover:scale-105 transition-transform">
                                    {course.thumbnail || course.image ? (
                                        <img src={course.thumbnail || course.image} alt={course.title} className="w-full h-full object-cover" onError={(e) => e.target.src = "https://placehold.co/100?text=Error"} />
                                    ) : (
                                        <BookOpen size={24} />
                                    )}
                                </div>
                                <div><span className="font-bold text-slate-700 text-sm block">{course.title}</span>{course.seo?.meta_title && <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-0.5"><Globe size={10}/> سئو شده</span>}</div>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-700 text-sm">{Number(course.price).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">تومان</span></td>
                            <td className="px-6 py-4"><Badge color={course.status === 'published' ? 'emerald' : course.status === 'archived' ? 'red' : 'amber'}>{course.status === 'published' ? 'منتشر شده' : course.status === 'archived' ? 'آرشیو' : 'پیش‌نویس'}</Badge></td>
                            <td className="px-6 py-4"><div className="flex items-center gap-2"><button onClick={() => handleEditClick(course)} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-full"><Edit size={18} /></button><button onClick={() => handleDelete(course.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"><Trash2 size={18} /></button></div></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default AdminCourses;