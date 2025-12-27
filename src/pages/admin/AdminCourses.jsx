import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, LogOut, BookOpen, Search, Globe, Share2, Eye, EyeOff, AlertCircle, ChevronDown, Edit, Save, UploadCloud, Loader2, X, CheckCircle2, ChevronLeft, ChevronRight, DollarSign, FileText, Image as ImageIcon, Trash2, RefreshCcw, Ban, AlertTriangle, User, Calendar, Clock, PlayCircle, List, Plus, MapPin, Video, MonitorPlay, Home } from 'lucide-react';
import Editor from '../../components/Editor';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '../../services/api';
import { getImageUrl, formatPrice, translateStatus, getStatusColor } from '../../services/Libs';
import { Button, Badge } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';



const translateError = (msg) => {
    if (!msg) return 'خطای نامشخص رخ داده است.';
    const lowerMsg = msg.toString().toLowerCase();
    if (lowerMsg.includes('required')) return 'لطفاً تمام فیلدهای الزامی را پر کنید.';
    if (lowerMsg.includes('title')) return 'عنوان دوره الزامی یا تکراری است.';
    if (lowerMsg.includes('price')) return 'قیمت دوره نامعتبر است.';
    if (lowerMsg.includes('category')) return 'دسته‌بندی انتخاب نشده است.';
    if (lowerMsg.includes('instructor')) return 'مدرس دوره انتخاب نشده است.';
    return msg;
};

const AdminCourses = () => {
    const { hasRole, user, loading: authLoading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isMyCourses = location.pathname.includes('my-courses');

    // ✅ همه useState hooks باید قبل از هر conditional return باشند
    const [courses, setCourses] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    const [instructorsList, setInstructorsList] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showTrashed, setShowTrashed] = useState(false);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [currentStep, setCurrentStep] = useState(1);
    const TOTAL_STEPS = 6;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null);

    const initialFormState = {
        title: '', price: '', category_id: '', description: '', thumbnail: '', imageFile: null,
        status: 'draft', instructor_id: '',
        start_from: '', schedule: '', // ✅ خالی - validation در فرانت‌اند
        type: 'Online', location: '', // ✅ خالی - validation در فرانت‌اند
        is_completed: false, is_started: false,
        sections: [], // ✅ خالی - validation در فرانت‌اند
        seo: { meta_title: '', meta_description: '', canonical_url: '', noindex: false, nofollow: false }
    };
    const [formData, setFormData] = useState(initialFormState);

    // ✅ همه useCallback و useEffect ها قبل از conditional return
    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const baseUrl = showTrashed ? '/courses?trashed=true' : '/courses';
            const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${page}`;

            const response = await api.get(url);
            const data = response.data?.data || response.data || [];
            setCourses(Array.isArray(data) ? data : []);

            if (data.length < 10) setHasMore(false);
            else setHasMore(true);

        } catch (error) {
            console.error(error);
            toast.error('خطا در دریافت لیست دوره‌ها');
            setCourses([]);
        } finally { setLoading(false); }
    }, [showTrashed, page]); // ✅ dependencies اضافه شده

    const fetchCategories = useCallback(async () => {
        try {
            const response = await api.get('/categories');
            setCategoriesList(response.data?.data || response.data || []);
        }
        catch (error) {
            console.error("Error categories", error);
            setCategoriesList([]);
        }
    }, []);

    const fetchInstructors = useCallback(async () => {
        try {
            const response = await api.get('/users/role/Instructor');
            setInstructorsList(response.data?.data || response.data || []);
        }
        catch (error) {
            console.error("Error instructors", error);
            setInstructorsList([]);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses, isMyCourses]); // ✅ fetchCourses اضافه شده

    useEffect(() => {
        // فقط Admin و Manager می‌توانند categories را ببینند
        if (hasRole(['Admin', 'Manager'])) {
            fetchCategories();
            fetchInstructors();
        }
    }, [hasRole, fetchCategories, fetchInstructors]);

    // محافظ قطعی - اگر کاربر دسترسی ندارد، هیچ چیز نمایش نده
    if (!authLoading && (!user || !hasRole(['Admin', 'Manager', 'Instructor']))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">دسترسی محدود</h1>
                    <p className="text-slate-500 dark:text-slate-400">شما دسترسی لازم برای مشاهده این صفحه را ندارید.</p>
                </div>
            </div>
        );
    }

    const resetForm = () => {
        setFormData(initialFormState);
        setShowModal(false);
        setCurrentStep(1);
        setEditingCourseId(null);
        setIsSubmitting(false);
    };

    const handleEditClick = (course) => {
        setEditingCourseId(course.id);

        const catId = course.categoryId || course.category?.id || course.category_id || '';
        const instId = course.instructorId || course.instructor?.id || course.instructor_id || '';

        let dateStr = course.startFrom || course.StartFrom || '';
        if (dateStr && typeof dateStr === 'string' && dateStr.includes('T')) {
            try { dateStr = dateStr.split('T')[0]; } catch { /* ignore date parsing errors */ }
        }

        const isCompletedVal = course.isCompleted ?? course.IsCompleted ?? course.is_completed ?? false;
        const isStartedVal = course.isStarted ?? course.IsStarted ?? course.is_started ?? false;

        setFormData({
            title: course.title || course.Title || '',
            price: course.price !== undefined ? course.price : (course.Price || ''),
            category_id: catId,
            instructor_id: instId,
            description: course.description || course.Description || '',
            thumbnail: course.thumbnail || course.Thumbnail || '',
            status: course.status || course.Status || 'draft',

            start_from: dateStr,
            schedule: course.schedule || course.Schedule || '',

            // ✅ اصلاح شد: دریافت نوع و مکان با پشتیبانی از حروف بزرگ
            type: course.type || course.Type || 'Online',
            location: course.location || course.Location || '',

            is_completed: !!isCompletedVal,
            is_started: !!isStartedVal,

            sections: (course.sections || course.Sections || []).map(s => ({
                id: s.id || s.Id,
                title: s.title || s.Title || '',
                description: s.description || s.Description || ''
            })),

            imageFile: null,
            seo: {
                meta_title: course.seo?.metaTitle || course.seo?.MetaTitle || '',
                meta_description: course.seo?.metaDescription || course.seo?.MetaDescription || '',
                canonical_url: course.seo?.canonicalUrl || course.seo?.CanonicalUrl || '',
                noindex: !!(course.seo?.noIndex || course.seo?.NoIndex),
                nofollow: !!(course.seo?.noFollow || course.seo?.NoFollow),
            }
        });
        setShowModal(true);
    };

    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSeoChange = (e) => { const { name, value, type, checked } = e.target; const val = type === 'checkbox' ? checked : value; setFormData(prev => ({ ...prev, seo: { ...prev.seo, [name]: val } })); };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) return toast.error('حجم تصویر نباید بیشتر از ۵ مگابایت باشد');
            const newFormData = { ...formData, imageFile: file };
            newFormData.thumbnail = URL.createObjectURL(file);
            setFormData(newFormData);
            toast.success('تصویر انتخاب شد');
        }
    };

    const handleAddSection = () => {
        setFormData(prev => ({
            ...prev,
            sections: [...prev.sections, { title: '', description: '' }]
        }));
    };
    const handleRemoveSection = (index) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== index)
        }));
    };
    const handleSectionChange = (index, field, value) => {
        const updatedSections = [...formData.sections];
        updatedSections[index][field] = value;
        setFormData(prev => ({ ...prev, sections: updatedSections }));
    };

    // --- Pagination Handlers ---
    const handleNextPage = () => setPage(prev => prev + 1);
    const handlePrevPage = () => setPage(prev => Math.max(1, prev - 1));

    const nextStep = () => {
        // مرحله 1: اطلاعات پایه
        if (currentStep === 1) {
            if (!formData.title.trim()) return toast.error('لطفاً عنوان دوره را وارد کنید.');
            const desc = formData.description ? formData.description.replace(/<[^>]*>?/gm, '').trim() : '';
            if (!desc && !formData.description.includes('<img')) return toast.error('لطفاً توضیحات دوره را وارد کنید.');
        }

        // مرحله 2: قیمت و دسته‌بندی
        if (currentStep === 2) {
            if (formData.price === '' || formData.price < 0) return toast.error('لطفاً قیمت معتبر وارد کنید.');
            if (!formData.category_id) return toast.error('لطفاً دسته‌بندی دوره را انتخاب کنید.');
            if (hasRole(['Admin', 'Manager']) && !formData.instructor_id) return toast.error('لطفاً مدرس دوره را انتخاب کنید.');
        }

        // مرحله 3: زمان‌بندی و محل
        if (currentStep === 3) {
            if (!formData.schedule.trim()) return toast.error('لطفاً زمان‌بندی دوره را وارد کنید.');
            if (!formData.location.trim()) {
                const locationLabel = formData.type === 'Online' ? 'لینک دوره' :
                    formData.type === 'Hybrid' ? 'محل برگزاری و لینک' : 'محل برگزاری';
                return toast.error(`وارد کردن ${locationLabel} الزامی است`);
            }
        }

        // مرحله 4: بخش‌های دوره
        if (currentStep === 4) {
            if (!formData.sections || formData.sections.length === 0) {
                return toast.error('حداقل یک بخش برای دوره الزامی است');
            }
            for (let i = 0; i < formData.sections.length; i++) {
                const section = formData.sections[i];
                if (!section.title.trim()) {
                    return toast.error(`عنوان بخش ${i + 1} الزامی است`);
                }
                if (!section.description.trim()) {
                    return toast.error(`توضیحات بخش ${i + 1} الزامی است`);
                }
            }
        }

        if (currentStep < TOTAL_STEPS) setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => { if (currentStep > 1) setCurrentStep(prev => prev - 1); };

    const handleSave = async () => {
        // ✅ Validation کامل قبل از ارسال
        if (!formData.title.trim()) {
            toast.error('عنوان دوره الزامی است');
            return;
        }

        const desc = formData.description ? formData.description.replace(/<[^>]*>?/gm, '').trim() : '';
        if (!desc && !formData.description.includes('<img')) {
            toast.error('توضیحات دوره الزامی است');
            return;
        }

        if (formData.price === '' || formData.price < 0) {
            toast.error('قیمت معتبر الزامی است');
            return;
        }

        if (!formData.category_id) {
            toast.error('انتخاب دسته‌بندی الزامی است');
            return;
        }

        if (hasRole(['Admin', 'Manager']) && !formData.instructor_id) {
            toast.error('انتخاب مدرس الزامی است');
            return;
        }

        if (!formData.location.trim()) {
            const locationLabel = formData.type === 'Online' ? 'لینک دوره' :
                formData.type === 'Hybrid' ? 'محل برگزاری و لینک' : 'محل برگزاری';
            toast.error(`وارد کردن ${locationLabel} الزامی است`);
            return;
        }

        if (!formData.schedule.trim()) {
            toast.error('زمان‌بندی دوره الزامی است');
            return;
        }

        if (!formData.sections || formData.sections.length === 0) {
            toast.error('حداقل یک بخش برای دوره الزامی است');
            return;
        }

        // بررسی sections
        for (let i = 0; i < formData.sections.length; i++) {
            const section = formData.sections[i];
            if (!section.title.trim()) {
                toast.error(`عنوان بخش ${i + 1} الزامی است`);
                return;
            }
            if (!section.description.trim()) {
                toast.error(`توضیحات بخش ${i + 1} الزامی است`);
                return;
            }
        }

        setIsSubmitting(true);
        const savePromise = new Promise((resolve, reject) => {
            const performSave = async () => {
                const data = new FormData();
                data.append('Title', formData.title);
                data.append('Price', formData.price.toString());
                data.append('CategoryId', formData.category_id);
                data.append('Description', formData.description);
                data.append('Status', formData.status);

                data.append('StartFrom', formData.start_from || '');
                data.append('Schedule', formData.schedule);

                data.append('Type', formData.type);
                data.append('Location', formData.location);

                data.append('IsCompleted', formData.is_completed ? 'true' : 'false');
                data.append('IsStarted', formData.is_started ? 'true' : 'false');

                if (formData.instructor_id) data.append('InstructorId', formData.instructor_id);

                if (formData.imageFile) data.append('Image', formData.imageFile);

                // ✅ sections با validation
                formData.sections.forEach((section, index) => {
                    data.append(`Sections[${index}].Title`, section.title);
                    data.append(`Sections[${index}].Description`, section.description);
                    if (section.id) data.append(`Sections[${index}].Id`, section.id);
                });

                Object.keys(formData.seo).forEach(key => {
                    const val = formData.seo[key];
                    const final = (val === null || val === undefined) ? '' : val;
                    let dtoKey = 'MetaTitle';
                    if (key === 'meta_title') dtoKey = 'MetaTitle';
                    if (key === 'meta_description') dtoKey = 'MetaDescription';
                    if (key === 'canonical_url') dtoKey = 'CanonicalUrl';
                    if (key === 'noindex') dtoKey = 'NoIndex';
                    if (key === 'nofollow') dtoKey = 'NoFollow';
                    data.append(`Seo.${dtoKey}`, final);
                });

                try {
                    const url = editingCourseId ? `/courses/${editingCourseId}` : '/courses';
                    const method = editingCourseId ? api.put : api.post;
                    await method(url, data);
                    fetchCourses();
                    resetForm();
                    resolve();
                } catch (error) {
                    console.error(error);
                    if (error.response?.data?.errors) {
                        const firstKey = Object.keys(error.response.data.errors)[0];
                        reject(translateError(error.response.data.errors[firstKey][0]));
                    } else {
                        reject(translateError(error.response?.data?.message || 'خطا در عملیات'));
                    }
                }
            };

            performSave();
        });

        try {
            await toast.promise(savePromise, {
                loading: 'در حال ذخیره اطلاعات...',
                success: <b>{editingCourseId ? 'دوره با موفقیت ویرایش شد!' : 'دوره جدید ساخته شد!'}</b>,
                error: (err) => <b>{err}</b>,
            });
        } catch (error) {
            console.error('Error in handleSave:', error);
            toast.error('خطا در ذخیره دوره');
        } finally { setIsSubmitting(false); }
    };

    const executeDelete = async (id) => { api.delete(`/courses/${id}`).then(() => { setCourses(prev => prev.filter(c => c.id !== id)); toast.success('حذف شد'); }).catch(() => toast.error('خطا')); };
    const handleDelete = (id) => { toast((t) => (<div className="flex flex-col gap-3 min-w-[280px]"><div className="flex items-start gap-3"><div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 shrink-0 border border-amber-100"><Trash2 size={20} /></div><div><h3 className="font-bold text-slate-800 text-sm">انتقال به زباله‌دان</h3><p className="text-xs text-slate-500 mt-1 leading-relaxed">آیا از انتقال این دوره اطمینان دارید؟</p></div></div><div className="flex gap-2 justify-end mt-1"><button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">انصراف</button><button onClick={() => { toast.dismiss(t.id); executeDelete(id); }} className="px-3 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors shadow-sm shadow-amber-500/20">بله، منتقل شود</button></div></div>), { duration: 5000 }); };
    const handleRestore = async (id) => { api.post(`/courses/${id}/restore`).then(() => { setCourses(prev => prev.filter(c => c.id !== id)); toast.success('بازیابی شد'); }); };
    const handleForceDelete = async (id) => { toast((t) => (<div className="flex flex-col gap-3 min-w-[280px]"><div className="flex items-start gap-3"><div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0 animate-pulse"><AlertTriangle size={20} /></div><div><h3 className="font-bold text-slate-800 text-sm">حذف همیشگی!</h3><p className="text-xs text-slate-500 mt-1 leading-relaxed">هشدار: این عملیات غیرقابل بازگشت است.</p></div></div><div className="flex gap-2 justify-end mt-2"><button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">انصراف</button><button onClick={() => { toast.dismiss(t.id); api.delete(`/courses/${id}/force`).then(() => { setCourses(prev => prev.filter(c => c.id !== id)); toast.success('حذف دائم شد'); }); }} className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-lg shadow-rose-600/30">حذف نهایی</button></div></div>), { duration: 6000 }); };

    const Stepper = () => (
        <div className="flex justify-between items-center mb-6 sm:mb-8 px-2 sm:px-4 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-10 rounded-full"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-indigo-500 -z-10 rounded-full transition-all duration-300" style={{ width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%` }}></div>
            {[
                { id: 1, icon: FileText, label: 'محتوا' },
                { id: 2, icon: DollarSign, label: 'جزئیات' },
                { id: 3, icon: List, label: 'سرفصل' },
                { id: 4, icon: ImageIcon, label: 'تصویر' },
                { id: 5, icon: Globe, label: 'سئو' },
                { id: 6, icon: CheckCircle2, label: 'انتشار' }
            ].map((step) => {
                const isActive = currentStep >= step.id;
                return (
                    <div key={step.id} className="flex flex-col items-center gap-1 sm:gap-2 bg-white dark:bg-slate-900 px-1 sm:px-2 transition-colors relative z-10">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'}`}>
                            <step.icon size={window.innerWidth >= 640 ? 18 : 16} />
                        </div>
                        <span className={`text-[9px] sm:text-[10px] font-bold text-center ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div>
            <Toaster position="top-center" reverseOrder={false} toastOptions={{ style: { fontFamily: 'Vazirmatn', fontSize: '14px', borderRadius: '12px', background: '#333', color: '#fff' } }} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 sm:mb-8">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
                        {isMyCourses ? 'دوره‌های من' : 'مدیریت دوره‌ها'}
                    </h2>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                        {isMyCourses
                            ? 'لیست دوره‌هایی که شما مدرس آن هستید'
                            : 'لیست تمام دوره‌های ثبت شده در سیستم'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <Button
                        onClick={() => window.location.href = '/'}
                        icon={Home}
                        variant="outline"
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                    >
                        صفحه اصلی
                    </Button>
                    <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex">
                        <button onClick={() => setShowTrashed(false)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!showTrashed ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>دوره‌های فعال</button>
                        <button onClick={() => setShowTrashed(true)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${showTrashed ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}><Trash2 size={16} /> <span className="hidden sm:inline">سطل زباله</span></button>
                    </div>
                    <Button onClick={() => { resetForm(); setShowModal(true); }} icon={Sparkles}>دوره جدید</Button>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] w-full max-w-5xl shadow-2xl my-4 sm:my-8 flex flex-col max-h-[95vh] sm:max-h-[90vh] border border-slate-100 dark:border-slate-800">
                        {/* Modal Header */}
                        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-2xl sm:rounded-t-[2rem]">
                            <div>
                                <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white">{editingCourseId ? 'ویرایش دوره' : 'ایجاد دوره جدید'}</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">مرحله {currentStep} از {TOTAL_STEPS}</p>
                            </div>
                            <button onClick={resetForm} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 dark:text-slate-500 hover:text-red-500 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar flex-1">
                            <Stepper />
                            <div className="min-h-[300px] sm:min-h-[400px]">
                                {/* STEP 1 */}
                                {currentStep === 1 && (<div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300"><div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">عنوان دوره</label><input className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-white transition-colors" required name="title" value={formData.title} onChange={handleChange} placeholder="مثال: آموزش پیشرفته React" /></div><div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">توضیحات کامل دوره</label><Editor value={formData.description} onChange={(val) => setFormData(prev => ({ ...prev, description: val }))} /></div></div>)}

                                {/* STEP 2 */}
                                {currentStep === 2 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-8 duration-300">
                                        <div className="space-y-6">
                                            <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">قیمت (تومان)</label><div className="relative"><input type="number" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-white transition-colors" required name="price" value={formData.price} onChange={handleChange} placeholder="0" /><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs font-bold">تومان</span></div><p className="text-xs text-slate-400 dark:text-slate-500 mt-2">عدد ۰ به معنی رایگان است.</p></div>
                                        </div>
                                        <div className="space-y-6">
                                            <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">دسته‌بندی والد</label><div className="relative"><select className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-700 dark:text-slate-200 appearance-none cursor-pointer transition-colors" required name="category_id" value={formData.category_id} onChange={handleChange}><option value="" disabled>انتخاب کنید...</option>{categoriesList?.map(cat => (<option key={cat.id} value={cat.id}>{cat.title}</option>))}</select><ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={20} /></div></div>

                                            {/* ✅ انتخاب نوع دوره - تصحیح شده */}
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">نوع برگزاری</label>
                                                <div className="relative">
                                                    <select
                                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-medium text-slate-700 dark:text-slate-200 appearance-none cursor-pointer"
                                                        name="type"
                                                        value={formData.type}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="Online">آنلاین (ویدیویی)</option>
                                                        <option value="InPerson">حضوری</option>
                                                        <option value="Hybrid">ترکیبی (آنلاین + حضوری)</option>
                                                    </select>
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                                        {formData.type === 'Online' ? <MonitorPlay size={20} /> : formData.type === 'Hybrid' ? <Globe size={20} /> : <MapPin size={20} />}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ✅ محل برگزاری - برای همه نوع دوره‌ها اجباری */}
                                            <div className="animate-in fade-in slide-in-from-top-2">
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                    {formData.type === 'Online' ? 'لینک دوره / پلتفرم' :
                                                        formData.type === 'Hybrid' ? 'محل برگزاری + لینک' :
                                                            'محل برگزاری'}
                                                </label>
                                                <input
                                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-medium text-slate-800 dark:text-white"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    placeholder={
                                                        formData.type === 'Online' ? 'مثال: https://lms.pardistous.ir/course/123' :
                                                            formData.type === 'Hybrid' ? 'مثال: تهران، دانشگاه شریف + لینک آنلاین' :
                                                                'مثال: تهران، دانشگاه شریف، کلاس 102'
                                                    }
                                                    required
                                                />
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {formData.type === 'Online' ? 'لینک دسترسی به دوره آنلاین الزامی است' :
                                                        formData.type === 'Hybrid' ? 'آدرس محل برگزاری و لینک آنلاین الزامی است' :
                                                            'آدرس دقیق محل برگزاری الزامی است'}
                                                </p>
                                            </div>

                                            {/* ✅ انتخاب مدرس (برای ادمین همیشه فعال) */}
                                            {hasRole(['Admin', 'Manager']) && (
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><User size={16} /> مدرس دوره</label>
                                                    <div className="relative"><select className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-medium text-slate-700 dark:text-slate-200 appearance-none cursor-pointer transition-colors" name="instructor_id" value={formData.instructor_id} onChange={handleChange}><option value="" disabled>انتخاب مدرس...</option>{instructorsList?.map(inst => (<option key={inst.id} value={inst.id}>{inst.name || inst.fullName} ({inst.email})</option>))}</select><ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={20} /></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: CURRICULUM */}
                                {currentStep === 3 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                <List size={20} /> سرفصل‌های دوره
                                            </h4>
                                            <Button variant="secondary" onClick={handleAddSection} className="!py-2 !px-4 !text-xs">
                                                <Plus size={16} /> افزودن فصل
                                            </Button>
                                        </div>

                                        {formData.sections.length === 0 ? (
                                            <div className="text-center py-10 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                                                <p className="text-slate-400 text-sm font-medium">هیچ سرفصلی اضافه نشده است.</p>
                                                <button onClick={handleAddSection} className="text-indigo-600 dark:text-indigo-400 text-sm font-bold mt-2 hover:underline">ایجاد اولین فصل</button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {formData.sections.map((section, index) => (
                                                    <div key={index} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                        <div className="p-4 flex items-center gap-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                                                            <div className="w-8 h-8 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-sm select-none">
                                                                {index + 1}
                                                            </div>
                                                            <input
                                                                type="text"
                                                                placeholder="عنوان فصل (مثلاً: مقدمات)"
                                                                className="flex-1 bg-transparent outline-none font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                                                value={section.title || ''}
                                                                onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                                                            />
                                                            <button onClick={() => handleRemoveSection(index)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                        <div className="p-4">
                                                            <textarea
                                                                rows="2"
                                                                placeholder="توضیحات کوتاه این فصل..."
                                                                className="w-full bg-transparent outline-none text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none"
                                                                value={section.description || ''}
                                                                onChange={(e) => handleSectionChange(index, 'description', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STEP 4: Image */}
                                {currentStep === 4 && (<div className="animate-in fade-in slide-in-from-right-8 duration-300"><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">تصویر شاخص دوره</label><div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-400 transition-all cursor-pointer relative overflow-hidden group"><input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" accept="image/*" onChange={handleFileSelect} />{formData.thumbnail ? (<div className="w-full max-w-md aspect-video rounded-xl overflow-hidden shadow-lg relative z-10"><img src={getImageUrl(formData.thumbnail)} alt="Preview" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold">تغییر تصویر</div></div>) : (<><div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><UploadCloud size={40} /></div><div className="text-center"><p className="text-lg font-bold text-slate-700 dark:text-slate-200">برای انتخاب تصویر کلیک کنید</p><p className="text-sm text-slate-400 dark:text-slate-500 mt-1">یا فایل را اینجا رها کنید</p></div></>)}</div></div>)}

                                {/* STEP 5: SEO */}
                                {currentStep === 5 && (<div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300"><div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700"><h4 className="text-xs font-bold text-slate-400 mb-4 flex items-center gap-2"><Search size={16} /> پیش‌نمایش در گوگل</h4><div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm max-w-xl"><h3 className="text-[#1a0dab] dark:text-indigo-400 font-medium text-xl hover:underline cursor-pointer truncate">{formData.seo.meta_title || formData.title || 'عنوان دوره'}</h3><p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{formData.seo.meta_description || 'توضیحات متای دوره...'}</p></div></div><div className="grid gap-4"><div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Meta Title</label><input className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none dark:text-white" name="meta_title" value={formData.seo.meta_title} onChange={handleSeoChange} placeholder={formData.title} /></div><div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Meta Description</label><textarea className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none h-24 resize-none dark:text-white" name="meta_description" value={formData.seo.meta_description} onChange={handleSeoChange} /></div><div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1"><Share2 size={12} /> Canonical URL</label><input className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-left dark:text-white" dir="ltr" name="canonical_url" value={formData.seo.canonical_url} onChange={handleSeoChange} /></div><div className="grid grid-cols-2 gap-4"><label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${formData.seo.noindex ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}><span className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">{formData.seo.noindex ? <EyeOff size={16} className="text-red-500" /> : <Eye size={16} className="text-slate-400" />} NoIndex</span><input type="checkbox" className="w-4 h-4 accent-red-500" name="noindex" checked={formData.seo.noindex} onChange={handleSeoChange} /></label><label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${formData.seo.nofollow ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}><span className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2"><AlertCircle size={16} className={formData.seo.nofollow ? "text-amber-500" : "text-slate-400"} /> NoFollow</span><input type="checkbox" className="w-4 h-4 accent-amber-500" name="nofollow" checked={formData.seo.nofollow} onChange={handleSeoChange} /></label></div></div></div>)}

                                {/* STEP 6: STATUS & FLAGS */}
                                {currentStep === 6 && (
                                    <div className="flex flex-col items-center justify-center py-10 animate-in fade-in slide-in-from-right-8 duration-300">
                                        <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 animate-bounce-slow"><Sparkles size={48} /></div>
                                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-8">وضعیت نهایی</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
                                            <div className="space-y-4">
                                                <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 text-center">وضعیت انتشار</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[{ value: 'draft', label: 'پیش‌نویس', icon: FileText, color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' }, { value: 'published', label: 'انتشار عمومی', icon: Globe, color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400' }, { value: 'archived', label: 'آرشیو', icon: LogOut, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' }].map((status) => (
                                                        <button key={status.value} onClick={() => setFormData(prev => ({ ...prev, status: status.value }))} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all text-xs font-bold ${formData.status === status.value ? `${status.color} border-current shadow-lg scale-105` : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                                            <status.icon size={20} />
                                                            <span>{status.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 text-center">وضعیت برگزاری</label>
                                                <div className="flex flex-col gap-3">
                                                    <div onClick={() => setFormData(prev => ({ ...prev, is_started: !prev.is_started }))} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.is_started ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.is_started ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}><PlayCircle size={20} /></div>
                                                        <div className="flex-1"><p className="font-bold text-sm">دوره شروع شده است</p><p className="text-[10px] opacity-70">دانشجویان می‌توانند محتوا را ببینند</p></div>
                                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.is_started ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'}`}>{formData.is_started && <CheckCircle2 size={14} className="text-white" />}</div>
                                                    </div>

                                                    <div onClick={() => setFormData(prev => ({ ...prev, is_completed: !prev.is_completed }))} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.is_completed ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.is_completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}><CheckCircle2 size={20} /></div>
                                                        <div className="flex-1"><p className="font-bold text-sm">دوره تکمیل شده است</p><p className="text-[10px] opacity-70">تمام جلسات بارگذاری شده‌اند</p></div>
                                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.is_completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>{formData.is_completed && <CheckCircle2 size={14} className="text-white" />}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-b-[2rem]">
                            <Button variant="ghost" onClick={currentStep === 1 ? resetForm : prevStep} className="!px-6 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
                                {currentStep === 1 ? 'انصراف' : 'مرحله قبل'}
                            </Button>
                            {currentStep < TOTAL_STEPS ? (
                                <Button onClick={nextStep} className="w-32 !bg-slate-900 hover:!bg-black dark:!bg-indigo-600 dark:hover:!bg-indigo-500">
                                    مرحله بعد <ChevronLeft size={18} className="mr-1" />
                                </Button>
                            ) : (
                                <Button onClick={handleSave} disabled={isSubmitting} className="w-40 shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-2"><Save size={18} /> ذخیره نهایی</span>}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* RESPONSIVE TABLE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl sm:rounded-[2rem] shadow-sm overflow-hidden transition-colors">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">دوره</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">مدرس</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">قیمت</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">وضعیت</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">عملیات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-12 text-slate-400 dark:text-slate-500">در حال بارگذاری...</td></tr>
                            ) : courses?.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-16"><p className="text-slate-400 dark:text-slate-500 text-sm font-bold">هیچ دوره‌ای یافت نشد!</p></td></tr>
                            ) : courses?.map(course => (
                                <tr key={course.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-14 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 overflow-hidden border border-indigo-100 dark:border-indigo-900/50 shadow-sm flex-shrink-0">
                                                {course.thumbnail || course.image ?
                                                    <img src={getImageUrl(course.thumbnail || course.image)} alt={course.title} className="w-full h-full object-cover" onError={(e) => e.target.src = "https://placehold.co/100?text=Error"} />
                                                    : <BookOpen size={24} />
                                                }
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm block truncate">{course.title}</span>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mt-1 inline-block">{course.category?.title || 'بدون دسته'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><span className="text-sm font-medium text-slate-600 dark:text-slate-300">{course.instructor?.name || course.instructor?.fullName || 'نامشخص'}</span></td>
                                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 text-sm">{formatPrice(course.price)}</td>
                                    <td className="px-6 py-4"><Badge color={course.deleted_at ? 'red' : getStatusColor(course.status)}>{course.deleted_at ? 'حذف شده' : translateStatus(course.status)}</Badge></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {showTrashed ? (
                                                <>
                                                    <button onClick={() => handleRestore(course.id)} className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-2 rounded-lg transition-colors" title="بازیابی"><RefreshCcw size={18} /></button>
                                                    <button onClick={() => handleForceDelete(course.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors" title="حذف دائم"><Ban size={18} /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => navigate(`/admin/courses/${course.id}/lms`)} className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-2 rounded-lg transition-colors" title="مدیریت LMS"><BookOpen size={18} /></button>
                                                    <button onClick={() => handleEditClick(course)} className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 p-2 rounded-lg transition-colors" title="ویرایش"><Edit size={18} /></button>
                                                    <button onClick={() => handleDelete(course.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors" title="حذف"><Trash2 size={18} /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400 dark:text-slate-500">در حال بارگذاری...</div>
                    ) : courses?.length === 0 ? (
                        <div className="text-center py-16"><p className="text-slate-400 dark:text-slate-500 text-sm font-bold">هیچ دوره‌ای یافت نشد!</p></div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {courses?.map(course => (
                                <div key={course.id} className="p-4 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 overflow-hidden border border-indigo-100 dark:border-indigo-900/50 shadow-sm flex-shrink-0">
                                            {course.thumbnail || course.image ?
                                                <img src={getImageUrl(course.thumbnail || course.image)} alt={course.title} className="w-full h-full object-cover" onError={(e) => e.target.src = "https://placehold.co/100?text=Error"} />
                                                : <BookOpen size={window.innerWidth >= 640 ? 28 : 24} />
                                            }
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base truncate">{course.title}</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        مدرس: {course.instructor?.name || course.instructor?.fullName || 'نامشخص'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Badge color={course.deleted_at ? 'red' : getStatusColor(course.status)} className="text-xs">
                                                        {course.deleted_at ? 'حذف شده' : translateStatus(course.status)}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg font-medium">
                                                        {course.category?.title || 'بدون دسته'}
                                                    </span>
                                                    <span className="font-bold text-slate-700 dark:text-slate-200">
                                                        {formatPrice(course.price)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1 sm:gap-2">
                                                    {showTrashed ? (
                                                        <>
                                                            <button onClick={() => handleRestore(course.id)} className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-2 rounded-lg transition-colors" title="بازیابی">
                                                                <RefreshCcw size={16} />
                                                            </button>
                                                            <button onClick={() => handleForceDelete(course.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors" title="حذف دائم">
                                                                <Ban size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => navigate(`/admin/courses/${course.id}/schedules`)} className="text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors" title="زمان‌بندی">
                                                                <Clock size={16} />
                                                            </button>
                                                            <button onClick={() => navigate(`/admin/courses/${course.id}/lms`)} className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-2 rounded-lg transition-colors" title="LMS">
                                                                <BookOpen size={16} />
                                                            </button>
                                                            <button onClick={() => handleEditClick(course)} className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 p-2 rounded-lg transition-colors" title="ویرایش">
                                                                <Edit size={16} />
                                                            </button>
                                                            <button onClick={() => handleDelete(course.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors" title="حذف">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50 dark:bg-slate-800/50">
                    <Button variant="secondary" onClick={handlePrevPage} disabled={page === 1} className="!text-xs w-full sm:w-auto">
                        <ChevronRight size={16} /> صفحه قبل
                    </Button>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">صفحه {page}</span>
                    <Button variant="secondary" onClick={handleNextPage} disabled={!hasMore} className="!text-xs w-full sm:w-auto">
                        صفحه بعد <ChevronLeft size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminCourses;